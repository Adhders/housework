// pages/orderDetail/orderDetail.js
const app = getApp();
const CloudStorage = require('../../utils/cloudStorage');
const Util = require('../../utils/util');

Page({
  data: {
    orderId: null,
    order: null,
    loading: true,
    error: false,
    userRole: null,
    statusText: Util.orderStatusMap,
    statusIcon: {
      'pending': '⏳',
      'accepted': '✅',
      'completed': '🎉',
      'cancelled': '❌'
    },
    statusDesc: {
      'pending': '等待阿姨接单中',
      'accepted': '阿姨已接单，服务进行中',
      'completed': '订单已完成',
      'cancelled': '订单已取消'
    },
    statusBgColor: {
      'pending': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      'accepted': 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      'completed': 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      'cancelled': 'linear-gradient(135deg, #999 0%, #666 100%)'
    },
    showActions: false,
    canGrab: false,
    canCancel: false,
    canComplete: false,
    canEdit: false,
    isEditing: false,
    editForm: {}
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail();
    } else {
      this.setData({ error: true, loading: false });
    }
  },

  // 加载订单详情
  async loadOrderDetail() {
    try {
      const order = await CloudStorage.getOrder(this.data.orderId);
      
      if (!order) {
        this.setData({ error: true, loading: false });
        return;
      }

      // 转换服务类型名称
      order.serviceTypeName = Util.serviceTypeMap[order.serviceType] || order.serviceType;

      // 判断权限和操作
      const userRole = app.globalData.userRole;
      const userId = app.globalData.userId;

      let showActions = false;
      let canGrab = false;
      let canCancel = false;
      let canComplete = false;

      // 家政阿姨可以抢单
      if (userRole === 'worker' && order.status === 'pending') {
        showActions = true;
        canGrab = true;
      }

      // 派单员可以取消待接单的订单
      if (userRole === 'dispatcher' && order.dispatcherId === userId && order.status === 'pending') {
        showActions = true;
        canCancel = true;
      }

      // 派单员可以完成已接单的订单
      if (userRole === 'dispatcher' && order.dispatcherId === userId && order.status === 'accepted') {
        showActions = true;
        canComplete = true;
      }

      // 派单员可以编辑自己发布的待接单订单
      let canEdit = false;
      if (userRole === 'dispatcher' && order.dispatcherId === userId && order.status === 'pending') {
        canEdit = true;
      }

      this.setData({
        order,
        loading: false,
        userRole,
        showActions,
        canGrab,
        canCancel,
        canComplete,
        canEdit,
        editForm: {
          serviceType: order.serviceType,
          price: order.price,
          duration: order.duration,
          serviceDate: order.serviceDate,
          serviceTime: order.serviceTime,
          address: order.address,
          contactName: order.contactName,
          contactPhone: order.contactPhone,
          requirements: order.requirements
        }
      });
    } catch (e) {
      console.error('加载订单详情失败:', e);
      this.setData({ error: true, loading: false });
    }
  },

  // 抢单
  async grabOrder() {
    const order = this.data.order;

    wx.showModal({
      title: '确认抢单',
      content: `确定要接这个订单吗？\n\n服务类型: ${order.serviceTypeName}\n价格: ¥${order.price}\n地址: ${order.address}`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '抢单中...' });

          const result = await CloudStorage.grabOrder(this.data.orderId, {
            workerId: app.globalData.userId,
            workerName: app.globalData.userInfo.name,
            workerPhone: app.globalData.userInfo.phone
          });

          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '抢单成功',
              icon: 'success',
              duration: 1500
            });

            setTimeout(() => {
              this.loadOrderDetail();
            }, 1500);
          } else {
            wx.showModal({
              title: '提示',
              content: result.message,
              showCancel: false
            });
          }
        }
      }
    });
  },

  // 取消订单
  async cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });
          
          const result = await CloudStorage.cancelOrder(this.data.orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.loadOrderDetail();
          } else {
            wx.showToast({
              title: result.message || '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 完成订单
  async completeOrder() {
    wx.showModal({
      title: '确认完成',
      content: '确定要标记这个订单为已完成吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          const result = await CloudStorage.completeOrder(this.data.orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '完成成功',
              icon: 'success'
            });
            this.loadOrderDetail();
          } else {
            wx.showToast({
              title: result.message || '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 拨打客户电话
  makeCall() {
    if (this.data.order && this.data.order.contactPhone) {
      wx.makePhoneCall({
        phoneNumber: this.data.order.contactPhone,
        fail: () => {
          wx.showToast({
            title: '拨打电话失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 拨打接单人电话
  callWorker() {
    if (this.data.order && this.data.order.workerPhone) {
      wx.makePhoneCall({
        phoneNumber: this.data.order.workerPhone,
        fail: () => {
          wx.showToast({
            title: '拨打电话失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 隐藏电话号码
  hidePhone(phone) {
    if (!phone || phone.length < 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
  },

  // 进入编辑模式
  startEdit() {
    this.setData({ isEditing: true });
  },

  // 取消编辑
  cancelEdit() {
    const { order } = this.data;
    this.setData({
      isEditing: false,
      editForm: {
        serviceType: order.serviceType,
        price: order.price,
        duration: order.duration,
        serviceDate: order.serviceDate,
        serviceTime: order.serviceTime,
        address: order.address,
        contactName: order.contactName,
        contactPhone: order.contactPhone,
        requirements: order.requirements
      }
    });
  },

  // 编辑表单输入
  onEditInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`editForm.${field}`]: value
    });
  },

  // 保存编辑
  async saveEdit() {
    const { orderId, editForm } = this.data;
    
    wx.showLoading({ title: '保存中...' });
    
    const result = await CloudStorage.updateOrder(orderId, editForm);
    
    wx.hideLoading();
    
    if (result) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.setData({ isEditing: false });
      this.loadOrderDetail();
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
});
