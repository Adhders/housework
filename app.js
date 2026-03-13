// app.js
App({
  globalData: {
    userInfo: null,
    userRole: null, // 'dispatcher' | 'worker'
    userId: null,
    openid: null,
    orders: [],
    userOrders: [],
    db: null,
    envId: null,
    needRefreshOrders: {} // 需要刷新的订单标志
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'housework-6g7cwxyi244a3bf5', // 请替换为你的云开发环境ID
        traceUser: true,
      });
      
      this.globalData.db = wx.cloud.database();
      this.globalData.envId = 'housework-6g7cwxyi244a3bf5';
    }

    // 检查登录状态
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && userRole && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.userRole = userRole;
      this.globalData.openid = openid;
      this.globalData.userId = userInfo._id || openid;
    }
  },

  // 保存登录信息
  saveLoginInfo(userInfo, userRole, openid) {
    this.globalData.userInfo = userInfo;
    this.globalData.userRole = userRole;
    this.globalData.openid = openid;
    this.globalData.userId = userInfo._id || openid;
    
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userRole', userRole);
    wx.setStorageSync('openid', openid);
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null;
    this.globalData.userRole = null;
    this.globalData.userId = null;
    this.globalData.openid = null;
    
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userRole');
    wx.removeStorageSync('openid');
  }
})
