// pages/index/index.js
const app = getApp();
const CloudStorage = require('../../utils/cloudStorage');
const Util = require('../../utils/util');

Page({
  data: {
    userRole: null,
    currentFilter: 'all',
    currentCategory: 'all',
    currentCategoryColor: '#4CAF50',
    orders: [],
    filteredOrders: [],
    searchKeyword: '',
    searchHistory: [],
    statusText: Util.orderStatusMap,
    statusColor: Util.orderStatusColor,
    categories: Util.serviceCategories,
    showFilterBar: false, // 是否显示状态筛选栏（派单员显示，家政阿姨不显示）
    // 排序相关
    sortType: 'time', // time: 按时间, distance: 按距离
    sortTypeName: '按预约时间',
    showSortPopup: false,
    userLatitude: '',
    userLongitude: ''
  },

  onLoad() {
    this.loadSearchHistory();
    this.getUserLocation();
    // 初始化默认分类颜色
    this.setData({
      currentCategoryColor: '#4CAF50'
    });
  },

  // 显示排序选项
  showSortOptions() {
    this.setData({ showSortPopup: true });
  },

  // 隐藏排序选项
  hideSortOptions() {
    this.setData({ showSortPopup: false });
  },

  // 选择排序方式
  selectSort(e) {
    const type = e.currentTarget.dataset.type;
    const typeName = type === 'time' ? '按预约时间' : '按距离远近';
    this.setData({
      sortType: type,
      sortTypeName: typeName,
      showSortPopup: false
    }, () => {
      this.filterOrders();
    });
  },

  // 计算两点间距离（公里）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const radLat1 = lat1 * Math.PI / 180.0;
    const radLat2 = lat2 * Math.PI / 180.0;
    const a = radLat1 - radLat2;
    const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // 地球半径
    s = Math.round(s * 10000) / 10000;
    return s;
  },

  onShow() {
    this.loadOrders();
  },

  // 获取用户地理位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          userLatitude: res.latitude,
          userLongitude: res.longitude
        });
      },
      fail: () => {
        console.log('获取位置失败');
      }
    });
  },

  // 加载订单
  async loadOrders() {
    try {
      if (!app.globalData.userInfo || !app.globalData.userRole) {
        wx.redirectTo({
          url: '/pages/login/login'
        });
        return;
      }

      this.setData({ userRole: app.globalData.userRole });

      let orders = [];
      let showFilterBar = false;
      let defaultFilter = 'all';

      if (app.globalData.userRole === 'dispatcher') {
        // 派单员看所有订单，显示状态筛选栏
        orders = await CloudStorage.getDispatcherOrders(app.globalData.userId);
        // 只保留待接单状态的订单
        orders = orders.filter(order => order.status === 'pending');
        showFilterBar = true;
      } else {
        // 家政阿姨只看待接单订单，不显示状态筛选栏
        orders = await CloudStorage.getAvailableOrders();
        // 只保留待接单状态的订单
        orders = orders.filter(order => order.status === 'pending');
        showFilterBar = false;
        defaultFilter = 'pending'; // 默认只显示待接单
      }

      const formattedOrders = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        formattedOrders.push({
          orderId: order.orderId,
          serviceType: order.serviceType,
          serviceTypeName: Util.serviceTypeMap[order.serviceType] || order.serviceType,
          price: order.price,
          duration: order.duration,
          serviceDate: order.serviceDate,
          serviceTime: order.serviceTime,
          address: order.address,
          city: order.city,
          latitude: order.latitude,
          longitude: order.longitude,
          contactName: order.contactName,
          contactPhone: order.contactPhone,
          requirements: order.requirements,
          status: order.status,
          grabTime: order.grabTime,
          dispatcherId: order.dispatcherId,
          dispatcherName: order.dispatcherName,
          workerId: order.workerId,
          workerName: order.workerName,
          workerPhone: order.workerPhone,
          createTime: order.createTime,
          updateTime: order.updateTime
        });
      }

      this.setData({ 
        orders: formattedOrders,
        showFilterBar: showFilterBar,
        currentFilter: defaultFilter
      }, () => {
        this.filterOrders();
      });
    } catch (e) {
      console.error('加载订单失败:', e);
    }
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter }, () => {
      this.filterOrders();
    });
  },

  // 切换业务分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    const categoryColor = this.data.categories[category]?.color || '#4CAF50';
    this.setData({ 
      currentCategory: category,
      currentCategoryColor: categoryColor
    }, () => {
      this.filterOrders();
    });
  },

  // 筛选订单
  filterOrders() {
    const { orders, currentFilter, searchKeyword, currentCategory, showFilterBar, sortType, userLatitude, userLongitude } = this.data;

    let filteredOrders = [...orders];

    // 按业务分类筛选
    if (currentCategory !== 'all') {
      const categoryTypes = this.data.categories[currentCategory]?.types || [];
      filteredOrders = filteredOrders.filter(order =>
        categoryTypes.includes(order.serviceType)
      );
    }

    // 派单员才需要按状态筛选，家政阿姨只看待接单的，无需状态筛选
    if (showFilterBar && currentFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === currentFilter);
    }

    // 按关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase().trim();
      filteredOrders = filteredOrders.filter(order => {
        return (order.address && order.address.toLowerCase().includes(keyword)) ||
               (order.contactName && order.contactName.toLowerCase().includes(keyword)) ||
               (order.contactPhone && order.contactPhone.includes(keyword)) ||
               (order.serviceTypeName && order.serviceTypeName.toLowerCase().includes(keyword));
      });
    }

    // 排序
    if (sortType === 'time') {
      // 按预约时间排序（最近的在前）
      filteredOrders.sort((a, b) => {
        const timeA = a.serviceTime ? new Date(a.serviceTime.replace(/-/g, '/')).getTime() : 0;
        const timeB = b.serviceTime ? new Date(b.serviceTime.replace(/-/g, '/')).getTime() : 0;
        return timeA - timeB;
      });
    } else if (sortType === 'distance' && userLatitude && userLongitude) {
      // 按距离排序（最近的在前）
      filteredOrders.sort((a, b) => {
        const distA = this.calculateDistance(userLatitude, userLongitude, a.latitude, a.longitude);
        const distB = this.calculateDistance(userLatitude, userLongitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    this.setData({ filteredOrders });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    const { searchKeyword } = this.data;
    if (searchKeyword && searchKeyword.trim()) {
      this.saveSearchHistory(searchKeyword.trim());
    }
    this.filterOrders();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchKeyword: '' }, () => {
      this.filterOrders();
    });
  },

  // 加载搜索历史
  loadSearchHistory() {
    try {
      const history = wx.getStorageSync('searchHistory') || [];
      this.setData({ searchHistory: history });
    } catch (e) {
      console.error('加载搜索历史失败:', e);
    }
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    let history = this.data.searchHistory || [];
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到开头
    history.unshift(keyword);
    
    // 最多保存10条
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    this.setData({ searchHistory: history });
    
    try {
      wx.setStorageSync('searchHistory', history);
    } catch (e) {
      console.error('保存搜索历史失败:', e);
    }
  },

  // 清空搜索历史
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] });
          try {
            wx.removeStorageSync('searchHistory');
          } catch (e) {
            console.error('清空搜索历史失败:', e);
          }
        }
      }
    });
  },

  // 点击搜索历史项
  searchHistoryItem(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword }, () => {
      this.filterOrders();
    });
  },

  // 查看详情
  viewDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${orderId}`
    });
  },

  // 抢单（家政阿姨）
  async grabOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    // 显示警告提示弹窗
    wx.showModal({
      title: '⚠️ 接单须知',
      content: '接单后请务必按时上门服务！\n\n多次接单后不上门服务，系统将限制您的接单权限。',
      confirmText: '我知道了',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认后，再次确认抢单
          this.confirmGrabOrder(orderId);
        }
      }
    });
  },

  // 确认抢单
  async confirmGrabOrder(orderId) {
    wx.showModal({
      title: '确认抢单',
      content: '确定要接这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '抢单中...' });
          
          const result = await CloudStorage.grabOrder(orderId, {
            workerId: app.globalData.userId,
            workerName: app.globalData.userInfo.name,
            workerPhone: app.globalData.userInfo.phone || ''
          });
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '抢单成功',
              icon: 'success'
            });
            this.loadOrders();
          } else {
            wx.showToast({
              title: result.message || '抢单失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 取消订单（派单员）
  async cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });
          
          const result = await CloudStorage.cancelOrder(orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.loadOrders();
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

  // 完成订单（派单员）
  async completeOrder(e) {
    const orderId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认完成',
      content: '确定要标记这个订单为已完成吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          const result = await CloudStorage.completeOrder(orderId);
          
          wx.hideLoading();

          if (result.success) {
            wx.showToast({
              title: '完成成功',
              icon: 'success'
            });
            this.loadOrders();
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

  // 阻止事件冒泡（供 catchtap 绑定使用）
  stopPropagation() {},

  // 拨打电话
  makeCall(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  // 隐藏电话号码
  hidePhone(phone) {
    if (!phone || phone.length < 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
  },

  // 记录当前要分享的订单（用于 onShareAppMessage 获取）
  onShareBtnTap(e) {
    // 将点击的订单存储，供 onShareAppMessage 使用
    this._shareOrder = e.currentTarget.dataset.order;
  },

  // 微信转发分享（右上角菜单 & 分享按钮均会触发）
  // 微信转发分享（右上角菜单 & 分享按钮均会触发）
  onShareAppMessage(res) {
    console.log('onShareAppMessage called from index.js', res);
    let order = null;
    // 从按钮的 dataset 中获取订单数据
    if (res.from === 'button' && res.target.dataset.order) {
      order = res.target.dataset.order;
    } else if (this._shareOrder) {
      // 兼容非按钮分享（如右上角菜单）
      order = this._shareOrder;
      this._shareOrder = null;
    }

    console.log('Order data for sharing:', order);

    if (order) {
      // 构造分享内容：只显示订单信息
      const title = `【家政招单】${order.serviceTypeName}｜¥${order.price}`;
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
        console.log('Tencent Static Map URL (index.js):', imageUrl);
        console.log('Latitude (index.js):', lat, 'Longitude (index.js):', lng);
      } else {
        console.log('Latitude or Longitude is missing for order in index.js. Latitude:', order.latitude, 'Longitude:', order.longitude);
      }
      console.log('Final imageUrl for sharing:', imageUrl); // Add this log
      return {
        title: title,
        path: `/pages/orderDetail/orderDetail?id=${order.orderId}`,
        imageUrl: imageUrl
      };
    }

    // 默认分享整个首页
    return {
      title: '家政服务招单 — 快来抢单！',
      path: '/pages/index/index',
      imageUrl: ''
    };
  },

  // 分享按钮点击事件（如果需要做额外处理）
  onShareBtnTap(e) {
    // 如果 onShareAppMessage 已经直接从 dataset 获取数据，这里可以不做任何操作
    // 或者可以用于设置一个临时的全局变量，供非按钮分享使用
    // this._shareOrder = e.currentTarget.dataset.order;
    console.log('Share button tapped, order:', e.currentTarget.dataset.order);
    // 这里的 console.log 是为了调试 onShareBtnTap 是否被调用
  },
});
