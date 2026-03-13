// pages/dispatcher/manage/manage.js
const app = getApp();
const CloudStorage = require('../../../utils/cloudStorage');
const Util = require('../../../utils/util');

Page({
  data: {
    currentFilter: 'all',
    orders: [],
    filteredOrders: [],
    statusText: Util.orderStatusMap,
    statusColor: Util.orderStatusColor
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  // 加载订单
  async loadOrders() {
    try {
      const orders = await CloudStorage.getDispatcherOrders(app.globalData.userId);
      
      const formattedOrders = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        formattedOrders.push({
          orderId: order.orderId,
          serviceType: order.serviceType,
          serviceTypeName: Util.serviceTypeMap[order.serviceType] || order.serviceType,
          price: order.price,
          duration: order.duration,
          serviceDate: order.serviceDate,
          serviceTime: order.serviceTime,
          address: order.address,
          contactName: order.contactName,
          contactPhone: order.contactPhone,
          requirements: order.requirements,
          status: order.status,
          grabTime: order.grabTime,
          dispatcherId: order.dispatcherId,
          dispatcherName: order.dispatcherName,
          workerId: order.workerId,
          workerName: order.workerName,
          workerPhone: order.workerPhone,
          createTime: order.createTime,
          updateTime: order.updateTime
        });
      }

      this.setData({ orders: formattedOrders }, () => {
        this.filterOrders();
      });
    } catch (e) {
      console.error('加载订单失败:', e);
    }
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter }, () => {
      this.filterOrders();
    });
  },

  // 筛选订单
  filterOrders() {
    const { orders, currentFilter } = this.data;
    
    let filteredOrders = orders;
    if (currentFilter !== 'all') {
      filteredOrders = orders.filter(order => order.status === currentFilter);
    }

    this.setData({ filteredOrders });
  },

  // 查看详情
  viewDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${orderId}`
    });
  },

  // 取消订单
  async cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });
          
          const result = await CloudStorage.cancelOrder(orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.loadOrders();
          } else {
            wx.showToast({
              title: result.message || '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 完成订单
  async completeOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认完成',
      content: '确定要标记这个订单为已完成吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          const result = await CloudStorage.completeOrder(orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '完成成功',
              icon: 'success'
            });
            this.loadOrders();
          } else {
            wx.showToast({
              title: result.message || '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 回退订单（将已接单订单回退到待接单）
  async revertOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认回退',
      content: '确定要将此订单回退到未接单状态吗？\n回退后订单将重新对外开放接单。',
      confirmText: '确认回退',
      confirmColor: '#f44336',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          const result = await CloudStorage.revertOrder(orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '回退成功',
              icon: 'success'
            });
            this.loadOrders();
          } else {
            wx.showToast({
              title: result.message || '回退失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 拨打电话
  makeCall(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  // 隐藏电话号码
  hidePhone(phone) {
    if (!phone || phone.length < 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
  }
});
