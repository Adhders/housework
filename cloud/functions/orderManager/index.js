// 订单管理云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const _ = db.command

// 订单集合名称
const ORDERS_COLLECTION = 'orders'

exports.main = function(event, context) {
  try {
    const wxContext = cloud.getWXContext()
    const action = event.action
    const data = event.data || {}

    switch (action) {
      case 'create':
        return createOrder(data, wxContext)

      case 'update':
        return updateOrder(data, wxContext)

      case 'get':
        return getOrder(data)

      case 'getAvailable':
        return getAvailableOrders(data)

      case 'getDispatcherOrders':
        return getDispatcherOrders(data)

      case 'getWorkerOrders':
        return getWorkerOrders(data)

      case 'grab':
        return grabOrder(data, wxContext)

      case 'cancel':
        return cancelOrder(data, wxContext)

      case 'complete':
        return completeOrder(data, wxContext)

      case 'uploadImages':
        return uploadServiceImages(data, wxContext)

      default:
        return Promise.resolve({
          code: 400,
          message: '未知的操作类型'
        })
    }
  } catch (err) {
    console.error('订单管理错误:', err)
    var errorMsg = '操作失败'
    if (err) {
      if (typeof err === 'string') {
        errorMsg = err
      } else if (err.message) {
        errorMsg = err.message
      } else {
        try {
          errorMsg = String(err)
        } catch (e) {
          errorMsg = '未知错误'
        }
      }
    }
    return Promise.resolve({
      code: 500,
      message: errorMsg
    })
  }
}

function createOrder(orderData, wxContext) {
  var now = Date.now()

  var order = {
    _openid: wxContext.OPENID,
    status: 'pending',
    createTime: now,
    updateTime: now
  }

  Object.keys(orderData).forEach(function(key) {
    if (orderData[key] !== undefined && orderData[key] !== null) {
      order[key] = orderData[key]
    }
  })

  return db.collection(ORDERS_COLLECTION).add({
    data: order
  }).then(function(result) {
    // 将 MongoDB 生成的 _id 同时保存为 orderId
    var orderId = result._id
    return db.collection(ORDERS_COLLECTION).doc(orderId).update({
      data: {
        orderId: orderId
      }
    }).then(function() {
      var responseData = {
        _id: orderId,
        orderId: orderId
      }

      Object.keys(order).forEach(function(key) {
        responseData[key] = order[key]
      })

      return {
        code: 0,
        message: '创建成功',
        data: responseData
      }
    })
  }).catch(function(err) {
    console.error('创建订单失败:', err)
    return {
      code: -1,
      message: err.message || '创建订单失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

function updateOrder(orderData, wxContext) {
  var orderId = orderData.orderId
  var updates = {}

  Object.keys(orderData).forEach(function(key) {
    if (key !== 'orderId' && orderData[key] !== undefined && orderData[key] !== null) {
      updates[key] = orderData[key]
    }
  })

  return db.collection(ORDERS_COLLECTION).doc(orderId).get().then(function(order) {
    if (!order.data) {
      return {
        code: 404,
        message: '订单不存在'
      }
    }

    if (order.data._openid !== wxContext.OPENID) {
      return {
        code: 403,
        message: '无权操作此订单'
      }
    }

    var now = Date.now()
    updates.updateTime = now

    return db.collection(ORDERS_COLLECTION).doc(orderId).update({
      data: updates
    }).then(function(result) {
      return {
        code: 0,
        message: '更新成功',
        data: result
      }
    })
  }).catch(function(err) {
    console.error('更新订单失败:', err)
    return {
      code: -1,
      message: err.message || '更新订单失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

function getOrder(data) {
  var orderId = data.orderId

  return db.collection(ORDERS_COLLECTION).doc(orderId).get().then(function(result) {
    if (!result.data) {
      return {
        code: 404,
        message: '订单不存在'
      }
    }
    return {
      code: 0,
      message: '获取成功',
      data: result.data
    }
  }).catch(function(err) {
    console.error('获取订单失败:', err)
    return {
      code: -1,
      message: err.message || '获取订单失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

function getAvailableOrders(data) {
  var city = data && data.city ? data.city : ''
  
  var whereCondition = {
    status: 'pending'
  }
  
  // 如果有城市信息，按城市筛选
  if (city) {
    whereCondition.city = city
  }
  
  return db.collection(ORDERS_COLLECTION)
    .where(whereCondition)
    .orderBy('createTime', 'desc')
    .get().then(function(result) {
      return {
        code: 0,
        message: '获取成功',
        data: result.data
      }
    }).catch(function(err) {
      console.error('获取可抢单列表失败:', err)
      return {
        code: -1,
        message: err.message || '获取可抢单列表失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}

function getDispatcherOrders(data) {
  var dispatcherId = data.dispatcherId
  return db.collection(ORDERS_COLLECTION)
    .where({
      dispatcherId: dispatcherId
    })
    .orderBy('createTime', 'desc')
    .get().then(function(result) {
      return {
        code: 0,
        message: '获取成功',
        data: result.data
      }
    }).catch(function(err) {
      console.error('获取派单员订单失败:', err)
      return {
        code: -1,
        message: err.message || '获取派单员订单失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}

function getWorkerOrders(data) {
  var workerId = data.workerId
  return db.collection(ORDERS_COLLECTION)
    .where({
      workerId: workerId
    })
    .orderBy('createTime', 'desc')
    .get().then(function(result) {
      return {
        code: 0,
        message: '获取成功',
        data: result.data
      }
    }).catch(function(err) {
      console.error('获取阿姨订单失败:', err)
      return {
        code: -1,
        message: err.message || '获取阿姨订单失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}

function grabOrder(data, wxContext) {
  var orderId = data.orderId
  var workerName = data.workerName
  var workerPhone = data.workerPhone
  var workerId = data.workerId

  return db.collection(ORDERS_COLLECTION).doc(orderId).get().then(function(order) {
    if (!order.data) {
      return {
        code: 404,
        message: '订单不存在'
      }
    }

    if (order.data.status !== 'pending') {
      return {
        code: 400,
        message: '订单已被接单'
      }
    }

    return db.collection(ORDERS_COLLECTION)
      .where({
        workerId: workerId,
        status: 'accepted'
      })
      .count().then(function(hasPendingOrder) {
        if (hasPendingOrder.total > 0) {
          return {
            code: 400,
            message: '您还有进行中的订单，请先完成当前订单'
          }
        }

        var now = Date.now()
        return db.collection(ORDERS_COLLECTION).doc(orderId).update({
          data: {
            status: 'accepted',
            workerId: workerId,
            workerName: workerName,
            workerPhone: workerPhone,
            workerOpenid: wxContext.OPENID,
            grabTime: now,
            updateTime: now
          }
        }).then(function(result) {
          return {
            code: 0,
            message: '抢单成功',
            data: result
          }
        })
      })
  }).catch(function(err) {
    console.error('抢单失败:', err)
    return {
      code: -1,
      message: err.message || '抢单失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

function cancelOrder(data, wxContext) {
  var orderId = data.orderId

  return db.collection(ORDERS_COLLECTION).doc(orderId).get().then(function(order) {
    if (!order.data) {
      return {
        code: 404,
        message: '订单不存在'
      }
    }

    if (order.data._openid !== wxContext.OPENID) {
      return {
        code: 403,
        message: '无权操作此订单'
      }
    }

    if (order.data.status !== 'pending') {
      return {
        code: 400,
        message: '只能取消待接单的订单'
      }
    }

    var now = Date.now()
    return db.collection(ORDERS_COLLECTION).doc(orderId).update({
      data: {
        status: 'cancelled',
        updateTime: now
      }
    }).then(function(result) {
      return {
        code: 0,
        message: '取消成功',
        data: result
      }
    })
  }).catch(function(err) {
    console.error('取消订单失败:', err)
    return {
      code: -1,
      message: err.message || '取消订单失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

function completeOrder(data, wxContext) {
  var orderId = data.orderId

  return db.collection(ORDERS_COLLECTION).doc(orderId).get().then(function(order) {
    if (!order.data) {
      return {
        code: 404,
        message: '订单不存在'
      }
    }

    if (order.data._openid !== wxContext.OPENID) {
      return {
        code: 403,
        message: '无权操作此订单'
      }
    }

    if (order.data.status !== 'accepted') {
      return {
        code: 400,
        message: '只能完成已接单的订单'
      }
    }

    var now = Date.now()
    return db.collection(ORDERS_COLLECTION).doc(orderId).update({
      data: {
        status: 'completed',
        updateTime: now
      }
    }).then(function(result) {
      return {
        code: 0,
        message: '完成成功',
        data: result
      }
    })
  }).catch(function(err) {
    console.error('完成订单失败:', err)
    return {
      code: -1,
      message: err.message || '完成订单失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

// 上传服务图片
function uploadServiceImages(data, wxContext) {
  var orderId = data.orderId
  var imageUrls = data.imageUrls || []

  return db.collection(ORDERS_COLLECTION).doc(orderId).get().then(function(order) {
    if (!order.data) {
      return {
        code: 404,
        message: '订单不存在'
      }
    }

    // 检查权限：只有接单的阿姨可以上传图片
    if (order.data.workerOpenid !== wxContext.OPENID) {
      return {
        code: 403,
        message: '无权操作此订单'
      }
    }

    // 检查订单状态：只能为已接单或已完成的订单上传图片
    if (order.data.status !== 'accepted' && order.data.status !== 'completed') {
      return {
        code: 400,
        message: '只能在接单后上传服务图片'
      }
    }

    // 合并现有图片和新上传的图片
    var existingImages = order.data.serviceImages || []
    var allImages = existingImages.concat(imageUrls)

    var now = Date.now()
    return db.collection(ORDERS_COLLECTION).doc(orderId).update({
      data: {
        serviceImages: allImages,
        updateTime: now
      }
    }).then(function(result) {
      return {
        code: 0,
        message: '上传成功',
        data: {
          imageCount: allImages.length
        }
      }
    })
  }).catch(function(err) {
    console.error('上传服务图片失败:', err)
    return {
      code: -1,
      message: err.message || '上传服务图片失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}
