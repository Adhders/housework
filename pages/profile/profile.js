// pages/profile/profile.js
const app = getApp();
const CloudStorage = require('../../utils/cloudStorage');
const Util = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    userRole: null,
    userAvatarChar: '用',
    menuItems: [],
    stats: null
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  async loadUserInfo() {
    if (!app.globalData.userInfo || !app.globalData.userRole) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    const userInfo = app.globalData.userInfo;
    const nameStr = String(userInfo.name || '');
    const avatarChar = nameStr.charAt(0) || '用';
    
    // 根据角色生成菜单项
    const menuItems = this.generateMenuItems(app.globalData.userRole);
    
    // 加载统计数据
    let stats = null;
    if (app.globalData.userRole === 'dispatcher') {
      stats = await this.loadDispatcherStats();
    } else if (app.globalData.userRole === 'worker') {
      stats = await this.loadWorkerStats();
    }
    
    this.setData({
      userInfo: userInfo,
      userRole: app.globalData.userRole,
      userAvatarChar: avatarChar,
      menuItems: menuItems,
      stats: stats
    });
  },

  // 加载派单员统计数据
  async loadDispatcherStats() {
    try {
      const orders = await CloudStorage.getDispatcherOrders(app.globalData.userId);
      
      const stats = {
        total: orders.length,
        pending: 0,
        accepted: 0,
        completed: 0,
        totalAmount: 0
      };
      
      orders.forEach(order => {
        if (order.status === 'pending') stats.pending++;
        else if (order.status === 'accepted') stats.accepted++;
        else if (order.status === 'completed') {
          stats.completed++;
          stats.totalAmount += parseFloat(order.price) || 0;
        }
      });
      
      return stats;
    } catch (e) {
      console.error('加载派单员统计失败:', e);
      return null;
    }
  },

  // 加载家政阿姨统计数据
  async loadWorkerStats() {
    try {
      const orders = await CloudStorage.getWorkerOrders(app.globalData.userId);
      
      const stats = {
        total: orders.length,
        pending: 0,
        accepted: 0,
        completed: 0
      };
      
      orders.forEach(order => {
        if (order.status === 'accepted') stats.accepted++;
        else if (order.status === 'completed') stats.completed++;
      });
      
      return stats;
    } catch (e) {
      console.error('加载家政阿姨统计失败:', e);
      return null;
    }
  },

  // 根据角色生成菜单项
  generateMenuItems(userRole) {
    const baseItems = [];
    
    if (userRole === 'worker') {
      // 家政阿姨的菜单
      baseItems.push(
        {
          id: 'my-orders',
          icon: '📋',
          title: '我的订单',
          desc: '查看和管理我的订单',
          url: '/pages/worker/myOrders/myOrders'
        },
        {
          id: 'my-performance',
          icon: '📊',
          title: '我的业绩',
          desc: '查看服务统计',
          url: ''
        }
      );
    } else if (userRole === 'dispatcher') {
      // 派单员的菜单
      baseItems.push(
        {
          id: 'publish-order',
          icon: '➕',
          title: '发布订单',
          desc: '发布家政需求',
          url: '/pages/dispatcher/publish/publish'
        },
        {
          id: 'dispatch-manage',
          icon: '📋',
          title: '派单管理',
          desc: '管理所有订单',
          url: '/pages/dispatcher/manage/manage'
        },
        {
          id: 'worker-manage',
          icon: '👷‍♀️',
          title: '阿姨管理',
          desc: '管理合作阿姨',
          url: '/pages/dispatcher/workers/workers'
        },
        {
          id: 'statistics',
          icon: '📊',
          title: '数据统计',
          desc: '查看订单和收入统计',
          url: '/pages/dispatcher/stats/stats'
        }
      );
    }
    
    // 通用菜单项
    baseItems.push(
      {
        id: 'settings',
        icon: '⚙️',
        title: '设置',
        desc: '应用设置',
        url: '/pages/settings/settings'
      }
    );
    
    return baseItems;
  },

  // 跳转到菜单项
  navigateToMenuItem(e) {
    const id = e.currentTarget.dataset.id;
    const url = e.currentTarget.dataset.url;
    
    if (url) {
      wx.navigateTo({
        url: url
      });
    } else {
      // 处理没有URL的菜单项
      switch(id) {
        case 'my-performance':
          this.showStats();
          break;
        default:
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          });
      }
    }
  },

  // 编辑资料
  editProfile() {
    wx.showModal({
      title: '编辑资料',
      editable: true,
      placeholderText: '请输入新的昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          // 更新用户信息
          app.globalData.userInfo.name = res.content;
          this.setData({
            userInfo: app.globalData.userInfo,
            userAvatarChar: res.content.charAt(0)
          });
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示统计详情
  showStats() {
    const { stats, userRole } = this.data;
    if (!stats) {
      wx.showToast({
        title: '暂无统计数据',
        icon: 'none'
      });
      return;
    }

    let content = `总订单: ${stats.total}\n待接单: ${stats.pending}\n已接单: ${stats.accepted}\n已完成: ${stats.completed}`;
    if (userRole === 'dispatcher') {
      content += `\n总金额: ¥${stats.totalAmount.toFixed(2)}`;
    }

    wx.showModal({
      title: '数据统计',
      content: content,
      showCancel: false
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          app.logout();
          
          // 跳转到登录页
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});