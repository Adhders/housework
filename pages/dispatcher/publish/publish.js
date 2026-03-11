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
    formData: {
      serviceType: '',
      serviceTypeKey: '',
      price: '',
      duration: '',
      serviceDate: '',
      serviceTime: '',
      city: '',
      address: '',
      contactName: '',
      contactPhone: '',
      requirements: ''
    }
  },

  onLoad() {
    this.initDates();
    this.initCity();
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

  // 从地址中提取城市
  extractCityFromAddress(address) {
    if (!address) return '';
    
    // 常见城市列表
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆', 
                    '天津', '苏州', '郑州', '长沙', '青岛', '大连', '厦门', '无锡', '福州', '济南'];
    
    for (let city of cities) {
      if (address.includes(city)) {
        return city;
      }
    }
    
    // 如果没有匹配到，尝试从地址开头提取（通常是省份+城市）
    const match = address.match(/^(.{2,7}?)[市区]/);
    if (match) {
      return match[1];
    }
    
    return '';
  },

  // 提交表单
  async handleSubmit(e) {
    const { formData, serviceTypeIndex } = this.data;

    if (!this.canSubmit()) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '发布中...' });

    // 使用选择的城市，去掉末尾的"市"字统一格式
    const city = (formData.city || this.data.cities[0]).replace(/市$/, '');

    // 构建订单数据
    const order = {
      dispatcherId: app.globalData.userId,
      dispatcherName: app.globalData.userInfo.name,
      serviceType: formData.serviceTypeKey,
      serviceTypeName: formData.serviceType,
      price: formData.price ? parseFloat(formData.price) : 0,
      duration: formData.duration ? parseInt(formData.duration) : 0,
      serviceDate: formData.serviceDate,
      serviceTime: `${formData.serviceDate} ${formData.serviceTime}`,
      address: formData.address,
      city: city,
      contactName: formData.contactName || app.globalData.userInfo.name,
      contactPhone: formData.contactPhone || app.globalData.userInfo.phone,
      requirements: formData.requirements,
      createTime: Date.now(),
      updateTime: Date.now()
    };

    // 保存订单到云数据库
    const success = await CloudStorage.addOrder(order);
    
    wx.hideLoading();

    if (success) {
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } else {
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  }
});
