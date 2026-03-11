// 用户管理云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const _ = db.command

// 用户集合名称
const USERS_COLLECTION = 'users'

exports.main = function(event, context) {
  try {
    const wxContext = cloud.getWXContext()
    const action = event.action
    const data = event.data || {}

    switch (action) {
      case 'login':
        return loginOrRegister(data, wxContext)

      case 'get':
        return getUser(wxContext)

      case 'update':
        return updateUser(data, wxContext)

      default:
        return Promise.resolve({
          code: 400,
          message: '未知的操作类型'
        })
    }
  } catch (err) {
    console.error('用户管理错误:', err)
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

function loginOrRegister(userData, wxContext) {
  var name = userData.name
  var phone = userData.phone
  var role = userData.role
  // 去掉城市名称中的"市"字，统一格式
  var city = (userData.city || '北京市').replace(/市$/, '')
  var openid = wxContext.OPENID
  var now = Date.now()

  if (!name || !phone || !role) {
    return Promise.resolve({
      code: 400,
      message: '请填写完整信息'
    })
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return Promise.resolve({
      code: 400,
      message: '手机号格式不正确'
    })
  }

  return db.collection(USERS_COLLECTION)
    .where({
      _openid: openid
    })
    .get().then(function(existingUser) {
      if (existingUser.data.length > 0) {
        var userId = existingUser.data[0]._id
        var existingData = existingUser.data[0]

        var updateData = {
          name: name,
          phone: phone,
          role: role,
          updateTime: now
        }
        // 如果用户已有城市信息，保留原城市；否则使用传入的城市或默认值
        if (existingData.city) {
          updateData.city = existingData.city
        } else {
          updateData.city = city
        }

        return db.collection(USERS_COLLECTION).doc(userId).update({
          data: updateData
        }).then(function() {
          return db.collection(USERS_COLLECTION).doc(userId).get()
        }).then(function(updatedUser) {
          return {
            code: 0,
            message: '登录成功',
            data: updatedUser.data,
            openid: openid
          }
        })
      } else {
        return db.collection(USERS_COLLECTION).add({
          data: {
            _openid: openid,
            name: name,
            phone: phone,
            role: role,
            city: city,
            createTime: now,
            updateTime: now
          }
        }).then(function(result) {
          return db.collection(USERS_COLLECTION).doc(result._id).get()
        }).then(function(newUser) {
          return {
            code: 0,
            message: '注册成功',
            data: newUser.data
          }
        })
      }
    }).catch(function(err) {
      console.error('登录/注册失败:', err)
      return {
        code: -1,
        message: err.message || '登录/注册失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}

function getUser(wxContext) {
  var openid = wxContext.OPENID

  return db.collection(USERS_COLLECTION)
    .where({
      _openid: openid
    })
    .get().then(function(result) {
      if (result.data.length === 0) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }

      return {
        code: 0,
        message: '获取成功',
        data: result.data[0]
      }
    }).catch(function(err) {
      console.error('获取用户信息失败:', err)
      return {
        code: -1,
        message: err.message || '获取用户信息失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}

function updateUser(userData, wxContext) {
  var openid = wxContext.OPENID

  return db.collection(USERS_COLLECTION)
    .where({
      _openid: openid
    })
    .get().then(function(existingUser) {
      if (existingUser.data.length === 0) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }

      var userId = existingUser.data[0]._id
      var now = Date.now()

      var updateData = {}
      Object.keys(userData).forEach(function(key) {
        if (userData[key] !== undefined && userData[key] !== null) {
          updateData[key] = userData[key]
        }
      })
      updateData.updateTime = now

      return db.collection(USERS_COLLECTION).doc(userId).update({
        data: updateData
      }).then(function() {
        return db.collection(USERS_COLLECTION).doc(userId).get()
      }).then(function(updatedUser) {
        return {
          code: 0,
          message: '更新成功',
          data: updatedUser.data
        }
      })
    }).catch(function(err) {
      console.error('更新用户信息失败:', err)
      return {
        code: -1,
        message: err.message || '更新用户信息失败',
        error: err && err.message ? err.message : String(err)
      }
    })
}
