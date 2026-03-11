// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userInfo, userRole } = event

  try {
    // 检查用户是否已存在
    const userQuery = await db.collection('users').where({
      phone: userInfo.phone
    }).get()

    let userId
    let userRecord

    if (userQuery.data.length > 0) {
      // 用户已存在，更新信息
      userId = userQuery.data[0]._id
      userRecord = userQuery.data[0]
      
      await db.collection('users').doc(userId).update({
        data: {
          name: userInfo.name,
          role: userRole,
          updateTime: new Date()
        }
      })
    } else {
      // 创建新用户
      const userRes = await db.collection('users').add({
        data: {
          name: userInfo.name,
          phone: userInfo.phone,
          role: userRole,
          createTime: new Date(),
          updateTime: new Date()
        }
      })
      userId = userRes._id
    }

    // 返回用户信息
    return {
      code: 0,
      message: '登录成功',
      data: {
        userId: userId,
        userInfo: {
          id: userId,
          name: userInfo.name,
          phone: userInfo.phone,
          role: userRole
        }
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      code: -1,
      message: '登录失败',
      error: err
    }
  }
}
