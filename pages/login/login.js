// pages/login/login.js
const app = getApp();
const UserManager = require('../../utils/userManager');

Page({
  data: {
    selectedRole: null,
    formData: {
      name: '',
      phone: ''
    },
    loading: false,
    userCity: ''
  },

  onLoad() {
    // 页面加载时获取用户位置
    this.getUserLocation();
  },

  // 获取用户地理位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.reverseGeocoder(res.latitude, res.longitude);
      },
      fail: () => {
        // 获取位置失败，使用默认城市
        this.setData({ userCity: '北京市' });
      }
    });
  },

  // 逆地址解析获取城市
  reverseGeocoder(latitude, longitude) {
    // 使用微信地图SDK进行逆地址解析
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=LWQBZ-SLH6F-VNOJD-N2ZI5-DA3YE-CKBR2`,
      success: (res) => {
        let city = '北京市';
        if (res.data && res.data.result && res.data.result.address_component) {
          city = res.data.result.address_component.city || '北京市';
          // 去掉末尾的"市"字，统一格式
          city = city.replace(/市$/, '');
        }
        this.setData({ userCity: city });
      },
      fail: () => {
        this.setData({ userCity: '北京' });
      }
    });
  },

  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
    this.updateCanLogin();
  },

  // 输入处理
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    const formDataKey = 'formData.' + field;
    const dataObj = {};
    dataObj[formDataKey] = value;
    this.setData(dataObj);
    this.updateCanLogin();
  },

  // 计算是否可以登录
  updateCanLogin() {
    const { selectedRole, formData } = this.data;
    const canLogin = selectedRole && formData.name && formData.phone && formData.phone.length === 11;
    this.setData({ canLogin });
  },

  // 登录处理
  async handleLogin() {
    const { selectedRole, formData, userCity } = this.data;

    // 简单验证
    if (!formData.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    if (!formData.phone || formData.phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    this.setData({ loading: true });
    wx.showLoading({ title: '登录中...' });

    // 调用云开发登录，传入城市信息
    const result = await UserManager.login(formData.name, formData.phone, selectedRole, userCity);

    wx.hideLoading();
    this.setData({ loading: false });

    if (result.success) {
      // 保存用户信息
      app.saveLoginInfo(result.userInfo, selectedRole, result.openid);

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        // 使用 reLaunch 重新启动小程序，确保所有页面和组件重新初始化
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }, 1500);
    } else {
      wx.showToast({
        title: result.message || '登录失败',
        icon: 'none'
      });
    }
  }
});
