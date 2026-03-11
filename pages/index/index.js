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
    currentCity: '北京市',
    orders: [],
    filteredOrders: [],
    searchKeyword: '',
    searchHistory: [],
    statusText: Util.orderStatusMap,
    statusColor: Util.orderStatusColor,
    categories: Util.serviceCategories,
    showFilterBar: false, // 是否显示状态筛选栏（派单员显示，家政阿姨不显示）
    cities: ['北京市', '天津市', '上海市', '重庆市', '石家庄市', '太原市', '呼和浩特市', '沈阳市', '大连市', '长春市', '哈尔滨市', '南京市', '苏州市', '杭州市', '宁波市', '合肥市', '福州市', '厦门市', '南昌市', '济南市', '青岛市', '郑州市', '武汉市', '长沙市', '广州市', '深圳市', '南宁市', '海口市', '成都市', '贵阳市', '昆明市', '拉萨市', '西安市', '兰州市', '西宁市', '银川市', '乌鲁木齐市', '唐山市', '秦皇岛市', '邯郸市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '无锡市', '徐州市', '常州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '莱芜市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市', '三亚市', '三沙市', '儋州市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '海东市', '石嘴山市', '吴忠市', '固原市', '中卫市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉市', '阜康市', '博乐市', '阿拉山口市', '库尔勒市', '阿克苏市', '阿图什市', '喀什市', '和田市', '伊宁市', '奎屯市', '霍尔果斯市', '塔城市', '乌苏市', '阿勒泰市', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市', '双河市', '可克达拉市', '昆玉市', '胡杨河市', '新星市'],
    userCity: '', // 用户当前所在城市
    locationLoaded: false // 定位是否完成
  },

  onLoad() {
    this.loadSearchHistory();
    this.getUserLocation();
    // 初始化默认分类颜色
    this.setData({
      currentCategoryColor: '#4CAF50'
    });
  },

  onShow() {
    this.loadOrders();
  },

  // 获取用户地理位置
  getUserLocation() {
    // 使用腾讯地图SDK或微信位置API获取城市信息
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 使用微信内置的逆地址解析获取城市
        this.reverseGeocoder(res.latitude, res.longitude);
      },
      fail: () => {
        // 获取位置失败，使用默认城市
        this.setData({
          userCity: '北京市',
          currentCity: '北京市',
          locationLoaded: true
        }, () => {
          this.loadOrders();
        });
      }
    });
  },

  // 逆地址解析获取城市
  reverseGeocoder(latitude, longitude) {
    // 注意：这里需要申请腾讯地图API密钥
    // 临时方案：根据坐标范围粗略判断城市
    // 正式环境请申请密钥：https://lbs.qq.com/
    
    // 简单根据经纬度判断主要城市（示例）
    let city = '北京市'; // 默认值
    
    // 北京范围
    if (latitude >= 39.4 && latitude <= 41.1 && longitude >= 115.7 && longitude <= 117.4) {
      city = '北京市';
    }
    // 上海范围
    else if (latitude >= 30.7 && latitude <= 31.9 && longitude >= 120.9 && longitude <= 122.2) {
      city = '上海市';
    }
    // 广州范围
    else if (latitude >= 22.5 && latitude <= 23.8 && longitude >= 112.9 && longitude <= 114.1) {
      city = '广州市';
    }
    // 深圳范围
    else if (latitude >= 22.5 && latitude <= 22.9 && longitude >= 113.8 && longitude <= 114.6) {
      city = '深圳市';
    }
    // 其他城市可以继续添加...
    
    this.setData({
      userCity: city,
      currentCity: city,
      locationLoaded: true
    }, () => {
      this.loadOrders();
    });
  },

  // 显示城市选择器
  showCityPicker() {
    this.setData({ showCityPicker: true });
  },

  // 隐藏城市选择器
  hideCityPicker() {
    this.setData({ showCityPicker: false });
  },

  // 城市选择器回调
  onCitySelect(e) {
    const city = e.detail.city;
    this.setData({
      currentCity: city,
      showCityPicker: false
    }, () => {
      this.filterOrders();
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

      // 获取用户所在城市，默认使用用户资料中的城市
      let userCity = app.globalData.userInfo && app.globalData.userInfo.city ? app.globalData.userInfo.city : '北京市';
      // 统一城市格式，去掉"市"字
      userCity = userCity.replace('市', '');
      
      // 设置当前城市为用户所在城市
      this.setData({
        currentCity: userCity,
        userCity: userCity
      });

      if (app.globalData.userRole === 'dispatcher') {
        // 派单员看所有订单，显示状态筛选栏
        orders = await CloudStorage.getDispatcherOrders(app.globalData.userId);
        // 只保留待接单状态的订单
        orders = orders.filter(order => order.status === 'pending');
        showFilterBar = true;
      } else {
        // 家政阿姨只看待接单订单，不显示状态筛选栏
        // 只显示阿姨所在城市的订单
        orders = await CloudStorage.getAvailableOrders(userCity);
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
    const { orders, currentFilter, searchKeyword, currentCategory, showFilterBar, currentCity, userRole } = this.data;

    let filteredOrders = orders;

    // 按城市筛选 - 必须选择具体城市
    if (userRole === 'worker') {
      // 家政阿姨按选择的城市筛选订单
      const selectedCity = currentCity.replace(/市$/, '');
      filteredOrders = filteredOrders.filter(order => {
        // 使用订单的city字段进行匹配
        const orderCity = order.city ? order.city.replace(/市$/, '') : '';
        return orderCity === selectedCity;
      });
    }
    // 派单员不按城市筛选，查看所有城市的订单

    // 再按业务分类筛选
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

    // 最后按关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase().trim();
      filteredOrders = filteredOrders.filter(order => {
        return (order.address && order.address.toLowerCase().includes(keyword)) ||
               (order.contactName && order.contactName.toLowerCase().includes(keyword)) ||
               (order.contactPhone && order.contactPhone.includes(keyword)) ||
               (order.serviceTypeName && order.serviceTypeName.toLowerCase().includes(keyword));
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
  }
});
