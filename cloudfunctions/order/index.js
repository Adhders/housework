// cloudfunctions/order/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = _.aggregate

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    switch (action) {
      case 'add':
        // 添加订单
        return await addOrder(data, openid)
      case 'update':
        // 更新订单
        return await updateOrder(data, openid)
      case 'get':
        // 获取订单详情
        return await getOrder(data.orderId)
      case 'getList':
        // 获取订单列表
        return await getOrderList(data, openid)
      case 'grab':
        // 抢单
        return await grabOrder(data, openid)
      default:
        return {
          code: -1,
          message: '未知的操作'
        }
    }
  } catch (err) {
    console.error('订单操作失败:', err)
    return {
      code: -1,
      message: '操作失败',
      error: err
    }
  }
}

// 添加订单
async function addOrder(orderData, openid) {
  // 创建订单时间
  const serviceTime = `${orderData.serviceDate} ${orderData.serviceTimeStart} - ${orderData.serviceTimeEnd}`

  const order = {
    dispatcherId: orderData.dispatcherId,
    dispatcherName: orderData.dispatcherName,
    dispatcherOpenid: openid,
    serviceType: orderData.serviceTypeKey,
    serviceTypeName: orderData.serviceTypeName,
    price: parseFloat(orderData.price).toFixed(2),
    duration: parseInt(orderData.duration),
    serviceDate: orderData.serviceDate,
    serviceTime: serviceTime,
    serviceTimeStart: orderData.serviceTimeStart,
    serviceTimeEnd: orderData.serviceTimeEnd,
    address: orderData.address,
    contactName: orderData.contactName,
    contactPhone: orderData.contactPhone,
    requirements: orderData.requirements || '',
    status: 'pending',
    createTime: new Date(),
    updateTime: new Date()
  }

  const res = await db.collection('orders').add({ data: order })

  return {
    code: 0,
    message: '发布成功',
    data: {
      orderId: res._id
    }
  }
}

// 更新订单
async function updateOrder(updateData, openid) {
  const { orderId, updates } = updateData

  // 验证权限
  const orderRes = await db.collection('orders').doc(orderId).get()
  if (orderRes.data.length === 0) {
    return {
      code: -1,
      message: '订单不存在'
    }
  }

  const order = orderRes.data
  const userId = updates.workerId || order.dispatcherId

  // 检查权限：只有派单员或接单人可以更新订单
  if (openid !== order.dispatcherOpenid && !updates.workerId) {
    return {
      code: -1,
      message: '无权操作'
    }
  }

  await db.collection('orders').doc(orderId).update({
    data: {
      ...updates,
      updateTime: new Date()
    }
  })

  return {
    code: 0,
    message: '更新成功'
  }
}

// 获取订单详情
async function getOrder(orderId) {
  const res = await db.collection('orders').doc(orderId).get()
  
  if (!res.data) {
    return {
      code: -1,
      message: '订单不存在'
    }
  }

  return {
    code: 0,
    data: res.data
  }
}

// 获取订单列表
async function getOrderList(queryData, openid) {
  const { type, userId } = queryData

  let query = db.collection('orders')

  switch (type) {
    case 'available':
      // 获取可接订单（待接单状态）
      query = query.where({
        status: 'pending'
      })
      break
    case 'dispatcher':
      // 获取派单员的订单
      query = query.where({
        dispatcherId: userId
      })
      break
    case 'worker':
      // 获取阿姨的订单
      query = query.where({
        workerId: userId
      })
      break
    default:
      break
  }

  // 按创建时间倒序排列
  query = query.orderBy('createTime', 'desc')

  const res = await query.get()

  return {
    code: 0,
    data: res.data
  }
}

// 抢单
async function grabOrder(grabData, openid) {
  const { orderId, workerId, workerName, workerPhone } = grabData

  // 检查订单是否存在
  const orderRes = await db.collection('orders').doc(orderId).get()
  if (!orderRes.data) {
    return {
      code: -1,
      message: '订单不存在'
    }
  }

  const order = orderRes.data

  // 检查订单状态
  if (order.status !== 'pending') {
    return {
      code: -1,
      message: '订单已被接单'
    }
  }

  // 检查是否已有进行中订单
  const pendingOrders = await db.collection('orders').where({
    workerId: workerId,
    status: 'accepted'
  }).count()

  if (pendingOrders.total > 0) {
    return {
      code: -1,
      message: '您还有进行中的订单，请先完成'
    }
  }

  // 更新订单状态
  await db.collection('orders').doc(orderId).update({
    data: {
      status: 'accepted',
      workerId: workerId,
      workerName: workerName,
      workerPhone: workerPhone,
      workerOpenid: openid,
      grabTime: new Date(),
      updateTime: new Date()
    }
  })

  return {
    code: 0,
    message: '抢单成功'
  }
}
