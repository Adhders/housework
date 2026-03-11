// cloudStorage.js - Cloud Storage Utility Module
var CloudStorage = {
  saveOrders: async function(orders) {
    return true
  },

  getOrders: async function() {
    try {
      var app = getApp()
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'getDispatcherOrders',
          data: {
            dispatcherId: app.globalData.userId
          }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return result.result.data || []
      }
      return []
    } catch (e) {
      console.error('getOrders error:', e)
      return []
    }
  },

  addOrder: async function(order) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'create',
          data: order
        }
      })
      return result.result && result.result.code === 0
    } catch (e) {
      console.error('addOrder error:', e)
      return false
    }
  },

  updateOrder: async function(orderId, updates) {
    try {
      var data = { orderId: orderId }
      for (var key in updates) {
        if (updates.hasOwnProperty(key)) {
          data[key] = updates[key]
        }
      }
      
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'update',
          data: data
        }
      })
      return result.result && result.result.code === 0
    } catch (e) {
      console.error('updateOrder error:', e)
      return false
    }
  },

  getOrder: async function(orderId) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'get',
          data: { orderId: orderId }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return result.result.data
      }
      return null
    } catch (e) {
      console.error('getOrder error:', e)
      return null
    }
  },

  getAvailableOrders: async function(city) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'getAvailable',
          data: { city: city }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return result.result.data || []
      }
      return []
    } catch (e) {
      console.error('getAvailableOrders error:', e)
      return []
    }
  },

  getDispatcherOrders: async function(dispatcherId) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'getDispatcherOrders',
          data: { dispatcherId: dispatcherId }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return result.result.data || []
      }
      return []
    } catch (e) {
      console.error('getDispatcherOrders error:', e)
      return []
    }
  },

  getWorkerOrders: async function(workerId) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'getWorkerOrders',
          data: { workerId: workerId }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return result.result.data || []
      }
      return []
    } catch (e) {
      console.error('getWorkerOrders error:', e)
      return []
    }
  },

  grabOrder: async function(orderId, workerInfo) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'grab',
          data: {
            orderId: orderId,
            workerId: workerInfo.workerId,
            workerName: workerInfo.workerName,
            workerPhone: workerInfo.workerPhone
          }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return { success: true, message: '抢单成功' }
      } else {
        return { success: false, message: result.result ? result.result.message : '抢单失败' }
      }
    } catch (e) {
      console.error('grabOrder error:', e)
      return { success: false, message: '抢单失败' }
    }
  },

  cancelOrder: async function(orderId) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'cancel',
          data: { orderId: orderId }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return { success: true, message: '取消成功' }
      } else {
        return { success: false, message: result.result ? result.result.message : '取消失败' }
      }
    } catch (e) {
      console.error('cancelOrder error:', e)
      return { success: false, message: '取消失败' }
    }
  },

  completeOrder: async function(orderId) {
    try {
      var result = await wx.cloud.callFunction({
        name: 'orderManager',
        data: {
          action: 'complete',
          data: { orderId: orderId }
        }
      })
      
      if (result.result && result.result.code === 0) {
        return { success: true, message: '完成成功' }
      } else {
        return { success: false, message: result.result ? result.result.message : '完成失败' }
      }
    } catch (e) {
      console.error('completeOrder error:', e)
      return { success: false, message: '完成失败' }
    }
  }
}

module.exports = CloudStorage
