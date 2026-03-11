// utils/userManager.js
// 用户管理工具类

const app = getApp()

const UserManager = {
  // 用户登录/注册
  async login(name, phone, role, city) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'userManager',
        data: {
          action: 'login',
          data: { name, phone, role, city }
        }
      })
      
      console.log('登录结果:', result)
      
      if (result.result && result.result.code === 0) {
        // 从 userManager 云函数返回的 openid 中获取
        const openid = result.result.data && result.result.data._openid 
          ? result.result.data._openid 
          : (result.result.openid || null)
        
        if (!openid) {
          console.error('未获取到 openid')
          return {
            success: false,
            message: '获取用户标识失败'
          }
        }
        
        return {
          success: true,
          userInfo: result.result.data,
          openid: openid
        }
      } else {
        return {
          success: false,
          message: result.result ? result.result.message : '登录失败'
        }
      }
    } catch (e) {
      console.error('登录失败:', e)
      return {
        success: false,
        message: '登录失败: ' + (e.message || e)
      }
    }
  },

  // 获取当前用户信息
  async getUserInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'userManager',
        data: {
          action: 'get'
        }
      })
      
      if (result.result.code === 0) {
        return {
          success: true,
          userInfo: result.result.data
        }
      } else {
        return {
          success: false,
          message: result.result.message
        }
      }
    } catch (e) {
      console.error('获取用户信息失败:', e)
      return {
        success: false,
        message: '获取用户信息失败'
      }
    }
  },

  // 更新用户信息
  async updateUserInfo(data) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'userManager',
        data: {
          action: 'update',
          data
        }
      })
      
      if (result.result.code === 0) {
        return {
          success: true,
          userInfo: result.result.data
        }
      } else {
        return {
          success: false,
          message: result.result.message
        }
      }
    } catch (e) {
      console.error('更新用户信息失败:', e)
      return {
        success: false,
        message: '更新失败'
      }
    }
  }
};

module.exports = UserManager;
