// pages/dispatcher/dispatcher.js
const app = getApp();
const CloudStorage = require('../../utils/cloudStorage');
const Util = require('../../utils/util');

Page({
  data: {
    stats: {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0
    },
    recentOrders: [],
    statusText: {
      'pending': '待接单',
      'accepted': '已接单',
      'completed': '已完成',
      'cancelled': '已取消'
    },
    statusColor: Util.orderStatusColor
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  // 加载订单数据
  async loadOrders() {
    try {
      const orders = await CloudStorage.getDispatcherOrders(app.globalData.userId);
      
      // 计算统计
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        completed: orders.filter(o => o.status === 'completed').length
      };

      // 获取最近订单（最多5条）
      const recentOrders = [];
      const maxOrders = Math.min(orders.length, 5);
      for (let i = 0; i < maxOrders; i++) {
        const order = orders[i];
        recentOrders.push({
          orderId: order.orderId,
          serviceType: Util.serviceTypeMap[order.serviceType] || order.serviceType,
          price: order.price,
          duration: order.duration,
          serviceDate: order.serviceDate,
          serviceTime: order.serviceTime,
          address: order.address,
          status: order.status,
          createTime: Util.formatTime(order.createTime)
        });
      }

      this.setData({ stats, recentOrders });
    } catch (e) {
      console.error('加载订单失败:', e);
    }
  },

  // 跳转到发布订单
  goToPublish() {
    wx.navigateTo({
      url: '/pages/dispatcher/publish/publish'
    });
  },

  // 跳转到订单管理
  goToManage() {
    wx.navigateTo({
      url: '/pages/dispatcher/manage/manage'
    });
  },

  // 跳转到阿姨管理
  goToWorkers() {
    wx.navigateTo({
      url: '/pages/dispatcher/workers/workers'
    });
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${orderId}`
    });
  }
});
