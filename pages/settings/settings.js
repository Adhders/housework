// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    version: '1.0.0',
    userInfo: null,
    cacheSize: '0KB'
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    });
    this.getCacheSize();
    this.loadUserCity();
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    });
    this.loadUserCity();
  },

  // 加载用户的城市信息
  async loadUserCity() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'userManager',
        data: {
          action: 'get'
        }
      });

      if (result.result && result.result.code === 0) {
        const userData = result.result.data;
        if (userData && userData.city) {
          this.setData({ defaultCity: userData.city });
        }
      }
    } catch (e) {
      console.error('加载默认城市失败:', e);
    }
  },

  // 跳转到地址管理
  goToAddressManage() {
    wx.navigateTo({
      url: '/pages/settings/address/address'
    });
  },

  // 获取缓存大小
  getCacheSize() {
    try {
      const res = wx.getStorageInfoSync();
      const size = res.currentSize;
      if (size < 1024) {
        this.setData({ cacheSize: size + 'KB' });
      } else {
        this.setData({ cacheSize: (size / 1024).toFixed(2) + 'MB' });
      }
    } catch (e) {
      console.error('获取缓存失败:', e);
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '清除中...' });
          
          try {
            // 清除本地存储（保留登录信息）
            const userInfo = wx.getStorageSync('userInfo');
            const userRole = wx.getStorageSync('userRole');
            const userId = wx.getStorageSync('userId');
            
            wx.clearStorageSync();
            
            // 恢复登录信息
            if (userInfo) wx.setStorageSync('userInfo', userInfo);
            if (userRole) wx.setStorageSync('userRole', userRole);
            if (userId) wx.setStorageSync('userId', userId);
            
            wx.hideLoading();
            wx.showToast({
              title: '清除成功',
              icon: 'success'
            });
            
            this.setData({ cacheSize: '0KB' });
          } catch (e) {
            wx.hideLoading();
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '家政服务小程序\n版本：1.0.0\n\n为您提供专业的家政服务',
      showCancel: false
    });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4001234567'
          });
        }
      }
    });
  },

  // 使用帮助
  help() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 派单员可以发布和管理订单\n2. 家政阿姨可以抢接订单\n3. 订单完成后请及时标记\n4. 如有问题请联系客服',
      showCancel: false
    });
  },

  // 隐私政策
  privacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护，不会将您的个人信息泄露给第三方。详细政策请查看官网。',
      showCancel: false
    });
  },

  // 用户协议
  userAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '使用本应用即表示您同意我们的服务条款。请遵守相关法律法规，文明使用。',
      showCancel: false
    });
  }
});
