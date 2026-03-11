// pages/worker/worker.js
const app = getApp();
const CloudStorage = require('../../utils/cloudStorage');
const Util = require('../../utils/util');

Page({
  data: {
    searchKeyword: '',
    serviceTypeFilter: 'all',
    priceFilter: 'all',
    showFilterModal: false,
    orders: [],
    displayOrders: []
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
      // 获取用户城市信息，用于筛选订单
      const userCity = app.globalData.userInfo && app.globalData.userInfo.city ? app.globalData.userInfo.city : '';
      const orders = await CloudStorage.getAvailableOrders(userCity);
      
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
          serviceTimeStart: order.serviceTimeStart,
          serviceTimeEnd: order.serviceTimeEnd,
          address: order.address,
          contactName: order.contactName,
          contactPhone: order.contactPhone,
          requirements: order.requirements,
          createTime: order.createTime,
          dispatcherId: order.dispatcherId,
          dispatcherName: order.dispatcherName
        });
      }

      this.setData({ orders: formattedOrders }, () => {
        this.applyFilters();
      });
    } catch (e) {
      console.error('加载订单失败:', e);
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索
  onSearch() {
    this.applyFilters();
  },

  // 显示筛选
  showFilter() {
    this.setData({
      showFilterModal: true
    });
  },

  // 隐藏筛选
  hideFilter() {
    this.setData({
      showFilterModal: false
    });
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  // 按服务类型筛选
  filterByType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      serviceTypeFilter: type
    }, () => {
      this.applyFilters();
    });
  },

  // 按价格筛选
  filterByPrice(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      priceFilter: range
    }, () => {
      this.applyFilters();
      this.hideFilter();
    });
  },

  // 应用所有筛选
  applyFilters() {
    const filteredOrders = [];
    for (let i = 0; i < this.data.orders.length; i++) {
      filteredOrders.push(this.data.orders[i]);
    }

    // 关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.serviceTypeName.toLowerCase().includes(keyword) ||
        order.address.toLowerCase().includes(keyword)
      );
    }

    // 服务类型筛选
    if (this.data.serviceTypeFilter !== 'all') {
      filteredOrders = filteredOrders.filter(
        order => order.serviceType === this.data.serviceTypeFilter
      );
    }

    // 价格筛选
    if (this.data.priceFilter !== 'all') {
      const [min, max] = this.data.priceFilter.split('-').map(v => v === '+' ? Infinity : parseInt(v));
      filteredOrders = filteredOrders.filter(order => {
        const price = parseFloat(order.price);
        return price >= min && price <= max;
      });
    }

    this.setData({
      displayOrders: filteredOrders
    });
  },

  // 抢单
  async grabOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const order = this.data.displayOrders[index];

    wx.showModal({
      title: '确认抢单',
      content: `确定要接这个订单吗？\n\n服务类型: ${order.serviceTypeName}\n价格: ¥${order.price}\n地址: ${order.address}`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '抢单中...' });

          const result = await CloudStorage.grabOrder(orderId, {
            workerId: app.globalData.userId,
            workerName: app.globalData.userInfo.name,
            workerPhone: app.globalData.userInfo.phone
          });

          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '抢单成功',
              icon: 'success',
              duration: 1500
            });

            setTimeout(() => {
              this.loadOrders();
            }, 1500);
          } else {
            wx.showModal({
              title: '提示',
              content: result.message,
              showCancel: false
            });
          }
        }
      }
    });
  }
});
