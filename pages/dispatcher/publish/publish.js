// pages/dispatcher/publish/publish.js
const app = getApp();
const CloudStorage = require('../../../utils/cloudStorage');
const Util = require('../../../utils/util');

Page({
  data: {
    serviceTypes: ['日常保洁', '深度清洁', '做饭服务', '老人护理', '儿童托管', '宠物护理', '其他服务'],
    serviceTypeIndex: -1,
    minDate: '',
    maxDate: '',
    cities: ['北京市', '天津市', '上海市', '重庆市', '石家庄市', '太原市', '呼和浩特市', '沈阳市', '大连市', '长春市', '哈尔滨市', '南京市', '苏州市', '杭州市', '宁波市', '合肥市', '福州市', '厦门市', '南昌市', '济南市', '青岛市', '郑州市', '武汉市', '长沙市', '广州市', '深圳市', '南宁市', '海口市', '成都市', '贵阳市', '昆明市', '拉萨市', '西安市', '兰州市', '西宁市', '银川市', '乌鲁木齐市', '唐山市', '秦皇岛市', '邯郸市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '无锡市', '徐州市', '常州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '莱芜市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市', '三亚市', '三沙市', '儋州市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '海东市', '石嘴山市', '吴忠市', '固原市', '中卫市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉市', '阜康市', '博乐市', '阿拉山口市', '库尔勒市', '阿克苏市', '阿图什市', '喀什市', '和田市', '伊宁市', '奎屯市', '霍尔果斯市', '塔城市', '乌苏市', '阿勒泰市', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市', '双河市', '可克达拉市', '昆玉市', '胡杨河市', '新星市'],
    cityIndex: 0,
    showCityPicker: false, // 是否显示城市选择器弹窗
    cityList: [], // 城市列表（按字母分组）
    cityLetters: [], // 字母列表
    selectedLetter: '', // 当前选中的字母
    canSubmit: false, // 是否可以提交
    isEditMode: false, // 是否为编辑模式
    editOrderId: null, // 编辑的订单ID
    formData: {
      serviceType: '',
      serviceTypeKey: '',
      price: '',
      duration: '',
      serviceDate: '',
      serviceTime: '',
      city: '',
      address: '',
      detailAddress: '',
      latitude: '',
      longitude: '',
      contactName: '',
      contactPhone: '',
      requirements: ''
    }
  },

  onLoad(options) {
    this.initDates();
    this.initCity();
    
    // 检查是否为编辑模式
    if (options.mode === 'edit' && options.orderId) {
      this.setData({
        isEditMode: true,
        editOrderId: options.orderId
      });
      this.loadOrderForEdit(options.orderId);
    }
  },

  // 加载订单数据进行编辑
  async loadOrderForEdit(orderId) {
    wx.showLoading({ title: '加载中...' });
    try {
      const order = await CloudStorage.getOrder(orderId);
      if (!order) {
        wx.showToast({ title: '订单不存在', icon: 'none' });
        return;
      }
      
      // 找到服务类型索引
      const serviceTypeIndex = this.data.serviceTypes.indexOf(order.serviceTypeName);
      
      // 提取时间
      let serviceTime = '';
      if (order.serviceTime) {
        const timeMatch = order.serviceTime.match(/\d{2}:\d{2}/);
        serviceTime = timeMatch ? timeMatch[0] : '';
      }
      
      this.setData({
        serviceTypeIndex: serviceTypeIndex,
        'formData.serviceType': order.serviceTypeName || '',
        'formData.serviceTypeKey': order.serviceType || '',
        'formData.price': order.price ? String(order.price) : '',
        'formData.duration': order.duration ? String(order.duration) : '',
        'formData.serviceDate': order.serviceDate || '',
        'formData.serviceTime': serviceTime,
        'formData.city': order.city ? order.city + '市' : '',
        'formData.address': order.address || '',
        'formData.detailAddress': order.detailAddress || '',
        'formData.latitude': order.latitude || '',
        'formData.longitude': order.longitude || '',
        'formData.contactName': order.contactName || '',
        'formData.contactPhone': order.contactPhone || '',
        'formData.requirements': order.requirements || ''
      }, () => {
        this.updateCanSubmit();
      });
      
      wx.setNavigationBarTitle({ title: '编辑订单' });
    } catch (e) {
      console.error('加载订单失败:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 初始化城市 - 使用用户当前城市
  initCity() {
    const userCity = app.globalData.userInfo && app.globalData.userInfo.city ? app.globalData.userInfo.city : '北京市';
    
    // 使用用户当前城市，如果用户城市不在列表中则使用北京
    const defaultCity = this.data.cities.includes(userCity) ? userCity : '北京市';
    
    this.setData({
      'formData.city': defaultCity
    }, () => {
      this.updateCanSubmit();
    });
  },

  // 更新是否可以提交
  updateCanSubmit() {
    const { formData } = this.data;
    const canSubmit = formData.serviceType && 
                     formData.serviceDate &&
                     formData.serviceTime &&
                     formData.address &&
                     formData.city;
    this.setData({ canSubmit });
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
      'formData.city': city,
      showCityPicker: false
    }, () => {
      this.updateCanSubmit();
    });
  },

  // 初始化日期选择范围
  initDates() {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    
    this.setData({ minDate, maxDate });
  },

  // 服务类型选择
  onServiceTypeChange(e) {
    const index = parseInt(e.detail.value);
    const serviceTypes = ['cleaning', 'deep_clean', 'cooking', 'elder_care', 'child_care', 'pet_care', 'other'];
    
    this.setData({
      serviceTypeIndex: index,
      'formData.serviceType': this.data.serviceTypes[index],
      'formData.serviceTypeKey': serviceTypes[index]
    }, () => {
      this.updateCanSubmit();
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'formData.serviceDate': e.detail.value
    }, () => {
      this.updateCanSubmit();
    });
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      'formData.serviceTime': e.detail.value
    }, () => {
      this.updateCanSubmit();
    });
  },

  // 表单输入
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    const formDataKey = 'formData.' + field;
    const dataObj = {};
    dataObj[formDataKey] = value;
    this.setData(dataObj, () => {
      this.updateCanSubmit();
    });
  },

  // 计算是否可以提交
  canSubmit() {
    const { formData } = this.data;
    return formData.serviceType && 
           formData.serviceDate &&
           formData.serviceTime &&
           formData.address &&
           formData.city;
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        console.log('选择位置成功:', res);
        let city = '';
        const fullAddress = res.address + res.name; // Combine for better city detection

        // Try to find a matching city from the predefined list
        for (const c of this.data.cities) {
          if (fullAddress.includes(c)) {
            city = c;
            break;
          }
        }

        // Fallback: if no match found, try to extract from address string
        if (!city) {
          const match = fullAddress.match(/^(.{2,7}?[市州区县])/);
          if (match) {
            city = match[1];
          }
        }

        // 如果提取到了城市，更新城市字段
        if (city) {
          this.setData({
            'formData.city': city,
            'formData.address': res.name,
            'formData.latitude': res.latitude,
            'formData.longitude': res.longitude
          }, () => {
            this.updateCanSubmit();
            console.log('formData after chooseLocation (with city):', this.data.formData);
          });
        } else {
          // 没有提取到城市，只更新地址和经纬度，并提示用户手动选择城市
          wx.showToast({
            title: '未能自动识别城市，请手动选择',
            icon: 'none',
            duration: 2000
          });
          this.setData({
            'formData.address': res.name,
            'formData.latitude': res.latitude,
            'formData.longitude': res.longitude
          }, () => {
            this.updateCanSubmit();
            console.log('formData after chooseLocation (no city):', this.data.formData);
          });
        }
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
        if (err.errMsg.includes('permission')) {
          wx.showModal({
            title: '位置权限',
            content: '需要获取位置权限来选择地址，请前往设置开启',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else if (err.errMsg.includes('auth deny')) {
          wx.showToast({
            title: '已拒绝位置权限',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '选择位置失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 提交表单
  async handleSubmit(e) {
    const { formData, serviceTypeIndex, isEditMode, editOrderId } = this.data;

    if (!this.canSubmit()) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const actionText = isEditMode ? '保存中...' : '发布中...';
    const successText = isEditMode ? '保存成功' : '发布成功';
    const failText = isEditMode ? '保存失败' : '发布失败';

    wx.showLoading({ title: actionText });

    // 使用选择的城市，去掉末尾的"市"字统一格式
    const city = (formData.city || this.data.cities[0]).replace(/市$/, '');

    // 构建订单数据
    const orderData = {
      serviceType: formData.serviceTypeKey,
      serviceTypeName: formData.serviceType,
      price: formData.price ? parseFloat(formData.price) : 0,
      duration: formData.duration ? parseInt(formData.duration) : 0,
      serviceDate: formData.serviceDate,
      serviceTime: `${formData.serviceDate} ${formData.serviceTime}`,
      address: formData.address,
      detailAddress: formData.detailAddress,
      city: city,
      latitude: formData.latitude,
      longitude: formData.longitude,
      contactName: formData.contactName || app.globalData.userInfo.name,
      contactPhone: formData.contactPhone || app.globalData.userInfo.phone,
      requirements: formData.requirements,
      updateTime: Date.now()
    };

    let success;
    if (isEditMode) {
      // 编辑模式：更新订单
      success = await CloudStorage.updateOrder(editOrderId, orderData);
    } else {
      // 新增模式：创建订单
      orderData.dispatcherId = app.globalData.userId;
      orderData.dispatcherName = app.globalData.userInfo.name;
      orderData.createTime = Date.now();
      success = await CloudStorage.addOrder(orderData);
    }
    
    wx.hideLoading();

    if (success) {
      wx.showToast({
        title: successText,
        icon: 'success',
        duration: 1500
      });

      // 编辑模式保存成功，设置刷新标志
      if (isEditMode) {
        // 使用全局变量标记订单需要刷新
        const app = getApp();
        if (!app.globalData.needRefreshOrders) {
          app.globalData.needRefreshOrders = {};
        }
        app.globalData.needRefreshOrders[editOrderId] = true;
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } else {
      wx.showToast({
        title: failText,
        icon: 'none'
      });
    }
  }
});
