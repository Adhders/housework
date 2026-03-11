// 获取用户openid
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = function(event, context) {
  try {
    const wxContext = cloud.getWXContext()

    return {
      event: event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  } catch (err) {
    console.error('获取openid错误:', err)
    var errorMsg = '获取openid失败'
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
    return {
      code: 500,
      message: errorMsg
    }
  }
}
