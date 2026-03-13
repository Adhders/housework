// pages/settings/address-edit/address-edit.js
const app = getApp();

Page({
  data: {
    city: '',
    showCityPicker: false,
    selectedCity: ''
  },

  onLoad() {
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
          city: userData.city || '',
          selectedCity: userData.city || ''
        });
      }
    } catch (e) {
      console.error('加载城市失败:', e);
    }
  },

  // 打开城市选择器
  openCityPicker() {
    this.setData({ showCityPicker: true });
  },

  // 城市选择完成
  onCitySelect(e) {
    const city = e.detail.city;
    this.setData({
      city: city,
      selectedCity: city,
      showCityPicker: false
    });
  },

  // 关闭城市选择器
  onCityPickerClose() {
    this.setData({ showCityPicker: false });
  },

  // 保存城市
  async saveCity() {
    const { city } = this.data;

    if (!city) {
      wx.showToast({
        title: '请选择工作城市',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '保存中...' });

      const result = await wx.cloud.callFunction({
        name: 'userManager',
        data: {
          action: 'update',
          data: {
            city: city
          }
        }
      });

      wx.hideLoading();

      if (result.result && result.result.code === 0) {
        // 更新全局数据
        if (app.globalData.userInfo) {
          app.globalData.userInfo.city = city;
        }

        wx.showToast({
          title: '保存成功',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        });
      } else {
        wx.showToast({
          title: result.result ? result.result.message : '保存失败',
          icon: 'none'
        });
      }
    } catch (e) {
      wx.hideLoading();
      console.error('保存城市失败:', e);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
});
