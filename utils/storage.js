// utils/storage.js
// 本地存储工具类

const Storage = {
  // 存储订单数据
  saveOrders(orders) {
    try {
      wx.setStorageSync('orders', orders);
      return true;
    } catch (e) {
      console.error('保存订单失败:', e);
      return false;
    }
  },

  // 获取订单数据
  getOrders() {
    try {
      return wx.getStorageSync('orders') || [];
    } catch (e) {
      console.error('获取订单失败:', e);
      return [];
    }
  },

  // 添加订单
  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    return this.saveOrders(orders);
  },

  // 更新订单
  updateOrder(orderId, updates) {
    const orders = this.getOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      return this.saveOrders(orders);
    }
    return false;
  },

  // 获取订单详情
  getOrder(orderId) {
    const orders = this.getOrders();
    return orders.find(order => order.id === orderId);
  },

  // 获取可抢单列表
  getAvailableOrders() {
    const orders = this.getOrders();
    return orders.filter(order => order.status === 'pending');
  },

  // 获取派单员的订单
  getDispatcherOrders(dispatcherId) {
    const orders = this.getOrders();
    return orders.filter(order => order.dispatcherId === dispatcherId);
  },

  // 获取阿姨的订单
  getWorkerOrders(workerId) {
    const orders = this.getOrders();
    return orders.filter(order => order.workerId === workerId);
  }
};

module.exports = Storage;
