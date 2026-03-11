// pages/worker/myOrders/myOrders.js
const app = getApp();
const CloudStorage = require('../../../utils/cloudStorage');
const Util = require('../../../utils/util');

Page({
  data: {
    role: 'worker',
    currentFilter: 'all',
    orders: [],
    filteredOrders: [],
    grabTimeText: [],
    statusText: Util.orderStatusMap,
    statusColor: Util.orderStatusColor
  },

  onLoad(options) {
    if (options.role) {
      this.setData({ role: options.role });
    }
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  // 加载订单
  async loadOrders() {
    try {
      let orders;
      
      if (this.data.role === 'dispatcher') {
        orders = await CloudStorage.getDispatcherOrders(app.globalData.userId);
      } else {
        orders = await CloudStorage.getWorkerOrders(app.globalData.userId);
      }

      // 格式化订单数据
      const formattedOrders = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        formattedOrders.push({
          orderId: order.orderId || order._id,
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

      // 格式化抢单时间
      const grabTimeText = formattedOrders.map(order => 
        order.grabTime ? Util.formatTime(order.grabTime) : '-'
      );

      this.setData({ 
        orders: formattedOrders,
        grabTimeText
      }, () => {
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
