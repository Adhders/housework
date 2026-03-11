// utils/cloud.js
// 云开发工具类

const Cloud = {
  // 调用云函数
  async callFunction(name, data) {
    try {
      const res = await wx.cloud.callFunction({
        name: name,
        data: data
      })
      return res.result
    } catch (err) {
      console.error(`云函数 ${name} 调用失败:`, err)
      throw err
    }
  },

  // 登录
  async login(userInfo, userRole) {
    return await this.callFunction('login', {
      userInfo,
      userRole
    })
  },

  // 添加订单
  async addOrder(orderData) {
    return await this.callFunction('order', {
      action: 'add',
      data: orderData
    })
  },

  // 更新订单
  async updateOrder(orderId, updates) {
    return await this.callFunction('order', {
      action: 'update',
      data: { orderId, updates }
    })
  },

  // 获取订单详情
  async getOrder(orderId) {
    return await this.callFunction('order', {
      action: 'get',
      data: { orderId }
    })
  },

  // 获取订单列表
  async getOrderList(type, userId) {
    return await this.callFunction('order', {
      action: 'getList',
      data: { type, userId }
    })
  },

  // 抢单
  async grabOrder(orderId, workerId, workerName, workerPhone) {
    return await this.callFunction('order', {
      action: 'grab',
      data: { orderId, workerId, workerName, workerPhone }
    })
  }
}

module.exports = Cloud
