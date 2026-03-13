// 家政人员管理云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 评价集合名称
const EVALUATIONS_COLLECTION = 'evaluations'

exports.main = function(event, context) {
  try {
    const wxContext = cloud.getWXContext()
    const action = event.action
    const data = event.data || {}

    switch (action) {
      case 'addEvaluation':
        return addEvaluation(data, wxContext)

      case 'getWorkerEvaluations':
        return getWorkerEvaluations(data)

      case 'getWorkerList':
        return getWorkerList(data)

      default:
        return Promise.resolve({
          code: 400,
          message: '未知的操作类型'
        })
    }
  } catch (err) {
    console.error('家政人员管理错误:', err)
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

// 添加评价
function addEvaluation(data, wxContext) {
  var evaluation = {
    _openid: wxContext.OPENID,
    createTime: Date.now()
  }

  Object.keys(data).forEach(function(key) {
    if (data[key] !== undefined && data[key] !== null) {
      evaluation[key] = data[key]
    }
  })

  return db.collection(EVALUATIONS_COLLECTION).add({
    data: evaluation
  }).then(function(result) {
    return {
      code: 0,
      message: '评价成功',
      data: { _id: result._id }
    }
  }).catch(function(err) {
    console.error('添加评价失败:', err)
    return {
      code: -1,
      message: err.message || '添加评价失败',
      error: err && err.message ? err.message : String(err)
    }
  })
}

// 获取阿姨评价列表
function getWorkerEvaluations(data) {
  var workerId = data.workerId
  
  return db.collection(EVALUATIONS_COLLECTION)
    .where({ workerId: workerId })
    .orderBy('createTime', 'desc')
    .get().then(function(result) {
      return {
        code: 0,
        message: '获取成功',
        data: result.data
      }
    }).catch(function(err) {
      console.error('获取评价失败:', err)
      return {
        code: -1,
        message: err.message || '获取评价失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}

// 获取阿姨列表（从接过订单的用户中提取）
function getWorkerList(data) {
  var dispatcherId = data.dispatcherId
  
  return db.collection('orders')
    .where({
      dispatcherId: dispatcherId,
      workerId: db.command.exists(true)
    })
    .get().then(function(result) {
      // 去重提取阿姨信息
      var workerMap = {}
      result.data.forEach(function(order) {
        if (order.workerId && !workerMap[order.workerId]) {
          workerMap[order.workerId] = {
            workerId: order.workerId,
            workerName: order.workerName,
            workerPhone: order.workerPhone,
            workerAvatar: order.workerAvatar || '',
            city: order.city || ''
          }
        }
      })
      
      return {
        code: 0,
        message: '获取成功',
        data: Object.values(workerMap)
      }
    }).catch(function(err) {
      console.error('获取阿姨列表失败:', err)
      return {
        code: -1,
        message: err.message || '获取阿姨列表失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}
