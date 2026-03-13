// pages/settings/address/address.js
const app = getApp();

Page({
  data: {
    city: ''
  },

  onLoad() {
    this.loadUserCity();
  },

  onShow() {
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
        this.setData({
          city: userData.city || ''
        });
      }
    } catch (e) {
      console.error('加载城市失败:', e);
    }
  },

  // 添加/设置城市
  addCity() {
    wx.navigateTo({
      url: '/pages/settings/address-edit/address-edit'
    });
  },

  // 编辑城市
  editCity() {
    wx.navigateTo({
      url: '/pages/settings/address-edit/address-edit'
    });
  }
});

