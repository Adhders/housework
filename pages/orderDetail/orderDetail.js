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
    canUploadImage: false,
    mapMarkers: [],
    hasLoaded: false // 标记是否已加载过，避免 onShow 重复加载
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ 
        orderId: options.id,
        hasLoaded: false
      });
      this.loadOrderDetail();
    } else {
      this.setData({ error: true, loading: false });
    }
  },

  onShow() {
    // 页面显示时检查是否需要刷新订单数据
    if (this.data.orderId && this.data.hasLoaded) {
      // 检查全局数据中是否有订单需要刷新
      const app = getApp();
      if (app.globalData.needRefreshOrders && app.globalData.needRefreshOrders[this.data.orderId]) {
        this.loadOrderDetail();
        // 清除刷新标志
        delete app.globalData.needRefreshOrders[this.data.orderId];
      }
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

      // 将 fileID 转为临时访问链接用于展示
      if (order.serviceImages && order.serviceImages.length > 0) {
        try {
          const res = await wx.cloud.getTempFileURL({ fileList: order.serviceImages });
          order.serviceImages = res.fileList.map(f => f.tempFileURL || f.fileID);
        } catch (e) {
          console.error('获取图片链接失败:', e);
        }
      }

      // 如果没有经纬度，获取用户当前位置
      if (!order.latitude || !order.longitude) {
        try {
          const locationRes = await wx.getLocation({ type: 'gcj02' });
          order.latitude = locationRes.latitude;
          order.longitude = locationRes.longitude;
          order.useCurrentLocation = true;
        } catch (e) {
          console.log('获取当前位置失败');
          wx.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' });
        }
      }

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

      // 判断是否可以上传服务图片（只有接单阿姨在服务中状态可以上传）
      let canUploadImage = false;
      if (userRole === 'worker' && order.workerId === userId && order.status === 'accepted') {
        canUploadImage = true;
      }

      // 构建地图标记点
      let mapMarkers = [];
      if (order.latitude && order.longitude) {
        const markerTitle = order.useCurrentLocation ? '您的位置' : order.address || '服务地址';
        mapMarkers = [{
          id: 1,
          latitude: order.latitude,
          longitude: order.longitude,
          title: markerTitle,
          width: 36,
          height: 36,
          callout: {
            content: markerTitle,
            color: '#333333',
            fontSize: 13,
            borderRadius: 6,
            bgColor: '#ffffff',
            padding: 8,
            display: 'ALWAYS'
          }
        }];
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
        canUploadImage,
        mapMarkers,
        hasLoaded: true // 标记已加载完成
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

  // 点击地图开启导航
  openNavigation() {
    const { order } = this.data;
    if (!order.latitude || !order.longitude) {
      wx.showToast({ title: '暂无位置信息', icon: 'none' });
      return;
    }
    wx.openLocation({
      latitude: order.latitude,
      longitude: order.longitude,
      name: order.useCurrentLocation ? '您的位置' : order.address || '服务地址',
      address: order.address || '',
      scale: 16
    });
  },

  // 无经纬度时通过地址文字打开导航（腾讯地图搜索）
  openNavigationByAddress() {
    const { order } = this.data;
    if (!order.address) {
      wx.showToast({ title: '暂无地址信息', icon: 'none' });
      return;
    }
    // 用 scheme 调起腾讯地图 / 系统地图搜索
    wx.showActionSheet({
      itemList: ['腾讯地图', '高德地图', '百度地图'],
      success: (res) => {
        const address = encodeURIComponent(order.address);
        const name = encodeURIComponent(order.address);
        const schemes = [
          `qqmap://map/routeplan?type=drive&to=${name}&tocoord=&referer=housework`,
          `iosamap://path?sourceApplication=housework&dname=${name}&dev=1`,
          `baidumap://map/direction?destination=name:${name}&mode=driving&coord_type=gcj02`
        ];
        const scheme = schemes[res.tapIndex];
        wx.setClipboardData({
          data: order.address,
          success: () => {
            wx.showModal({
              title: '地址已复制',
              content: `"${order.address}" 已复制到剪贴板，请在地图APP中粘贴搜索`,
              showCancel: false
            });
          }
        });
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

  // 进入编辑模式 - 跳转到派单页面编辑
  startEdit() {
    const { orderId } = this.data;
    wx.navigateTo({
      url: `/pages/dispatcher/publish/publish?orderId=${orderId}&mode=edit`
    });
  },

  // 选择并上传服务图片
  chooseServiceImage() {
    wx.chooseImage({
      count: 9, // 最多可选9张
      sizeType: ['compressed'], // 压缩图
      sourceType: ['camera', 'album'], // 相机或相册
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.uploadServiceImages(tempFilePaths);
      }
    });
  },

  // 上传服务图片到云对象存储
  async uploadServiceImages(filePaths) {
    wx.showLoading({ title: `上传中 0/${filePaths.length}` });
    
    try {
      const fileIDs = [];
      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const ext = filePath.split('.').pop() || 'jpg';
        const cloudPath = `service-images/${this.data.orderId}/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
        
        wx.showLoading({ title: `上传中 ${i + 1}/${filePaths.length}` });
        
        const res = await wx.cloud.uploadFile({ cloudPath, filePath });
        fileIDs.push(res.fileID);
      }
      
      // 保存 fileID 到订单（不存临时链接，fileID 永久有效）
      const result = await CloudStorage.uploadServiceImages(this.data.orderId, fileIDs);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({ title: '上传成功', icon: 'success' });
        this.loadOrderDetail();
      } else {
        wx.showToast({ title: result.message || '上传失败', icon: 'none' });
      }
    } catch (e) {
      console.error('上传图片失败:', e);
      wx.hideLoading();
      wx.showToast({ title: '上传失败，请重试', icon: 'none' });
    }
  },

  // 预览图片（serviceImages 此时已是临时链接）
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    const urls = this.data.order.serviceImages || [];
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  // 分享订单
  onShareAppMessage() {
    const { order } = this.data;
    if (!order) {
      return {
        title: '家政服务订单',
        path: '/pages/index/index'
      };
    }
    const title = `【家政招单】${order.serviceTypeName}｜¥${order.price}｜${order.city || ''}`;

    // 用腾讯地图静态图 API 生成带地图标注的分享封面
    let imageUrl = '';
    if (order.latitude && order.longitude) {
      const lat = order.latitude;
      const lng = order.longitude;
      const key = 'LWQBZ-SLH6F-VNOJD-N2ZI5-DA3YE-CKBR2';
      // 分享卡片地图上只显示基础地址（取前8个字以内）
      const addressLabel = order.address ? order.address.substring(0, 8) : '地址';
      // 使用红色定位标记 + 黑色地址文字
      const random = Math.floor(Math.random() * 10000);
      imageUrl = `https://apis.map.qq.com/ws/staticmap/v2/?center=${lat},${lng}&zoom=15&size=600*300&markers=size:large|color:0xFF0000|${lat},${lng}&labels=size:16|color:0x000000|anchor:3|${addressLabel}|${lat},${lng}&key=${key}&_r=${random}`;
    }

    return {
      title: title,
      path: `/pages/orderDetail/orderDetail?id=${order._id || order.orderId}`,
      imageUrl: imageUrl
    };
  }
});
