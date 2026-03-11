// 城市选择器组件
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    selectedCity: {
      type: String,
      value: ''
    }
  },

  data: {
    cityList: [],
    cityLetters: [],
    selectedLetter: '',
    scrollIntoView: '',
    cities: ['北京市', '天津市', '上海市', '重庆市', '石家庄市', '太原市', '呼和浩特市', '沈阳市', '大连市', '长春市', '哈尔滨市', '南京市', '苏州市', '杭州市', '宁波市', '合肥市', '福州市', '厦门市', '南昌市', '济南市', '青岛市', '郑州市', '武汉市', '长沙市', '广州市', '深圳市', '南宁市', '海口市', '成都市', '贵阳市', '昆明市', '拉萨市', '西安市', '兰州市', '西宁市', '银川市', '乌鲁木齐市', '唐山市', '秦皇岛市', '邯郸市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '无锡市', '徐州市', '常州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '莱芜市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市', '三亚市', '三沙市', '儋州市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '海东市', '石嘴山市', '吴忠市', '固原市', '中卫市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉市', '阜康市', '博乐市', '阿拉山口市', '库尔勒市', '阿克苏市', '阿图什市', '喀什市', '和田市', '伊宁市', '奎屯市', '霍尔果斯市', '塔城市', '乌苏市', '阿勒泰市', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市', '双河市', '可克达拉市', '昆玉市', '胡杨河市', '新星市']
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.buildCityData();
      }
    },
    'selectedCity': function(selectedCity) {
      // 当 selectedCity 变化时，不需要自动滚动
    }
  },

  methods: {
    // 构建城市数据（按字母分组）
    buildCityData() {
      const cities = this.data.cities;
      const map = {};
      const municipalities = ['北京市', '天津市', '上海市', '重庆市'];

      // 直辖市放最前面
      map['★'] = municipalities.filter(c => cities.includes(c));

      // 按首字母分组
      cities.forEach(city => {
        if (municipalities.includes(city)) return;
        const letter = this.getCityLetter(city);
        if (!map[letter]) map[letter] = [];
        map[letter].push(city);
      });

      // 排序
      Object.keys(map).forEach(k => {
        if (k !== '★') map[k].sort((a, b) => a.localeCompare(b, 'zh'));
      });

      const letters = Object.keys(map).sort((a, b) => {
        if (a === '★') return -1;
        if (b === '★') return 1;
        return a.localeCompare(b);
      });

      // 构建扁平列表
      const list = [];
      letters.forEach(letter => {
        list.push({ type: 'header', letter });
        map[letter].forEach(city => {
          list.push({ type: 'city', name: city, letter });
        });
      });

      this.setData({ 
        cityList: list, 
        cityLetters: letters, 
        selectedLetter: '',
        scrollIntoView: ''
      });
    },

    // 滚动到选中的城市
    scrollToSelectedCity(cityName, letter) {
      // 延迟执行，确保 DOM 已经渲染
      setTimeout(() => {
        this.setData({
          selectedLetter: letter,
          scrollIntoView: `city-${cityName}`
        });
        // 延迟清空 scroll-into-view，避免影响后续滚动
        setTimeout(() => {
          this.setData({ scrollIntoView: '' });
        }, 300);
      }, 100);
    },

    // 获取城市首字母
    getCityLetter(city) {
      const firstChar = city.charAt(0);
      
      // 常用汉字拼音首字母映射
      const pinyinMap = {
        '漯': 'L', '洛': 'L', '廊': 'L', '兰': 'L', '拉': 'L',
        '北': 'B', '天': 'T', '上': 'S', '重': 'C', '石': 'S',
        '太': 'T', '呼': 'H', '沈': 'S', '大': 'D', '长': 'C',
        '哈': 'H', '南': 'N', '苏': 'S', '杭': 'H', '宁': 'N',
        '合': 'H', '福': 'F', '厦': 'X', '南': 'N', '济': 'J',
        '青': 'Q', '郑': 'Z', '武': 'W', '长': 'C', '广': 'G',
        '深': 'S', '南': 'N', '海': 'H', '成': 'C', '贵': 'G',
        '昆': 'K', '拉': 'L', '西': 'X', '兰': 'L', '西': 'X',
        '银': 'Y', '乌': 'W', '唐': 'T', '秦': 'Q', '邯': 'H',
        '保': 'B', '张': 'Z', '承': 'C', '沧': 'C', '衡': 'H',
        '大': 'D', '阳': 'Y', '长': 'C', '晋': 'J', '朔': 'S',
        '运': 'Y', '忻': 'X', '临': 'L', '吕': 'L', '包': 'B',
        '乌': 'W', '赤': 'C', '通': 'T', '鄂': 'E', '呼': 'H',
        '巴': 'B', '乌': 'W', '鞍': 'A', '抚': 'F', '本': 'B',
        '丹': 'D', '锦': 'J', '营': 'Y', '阜': 'F', '辽': 'L',
        '盘': 'P', '铁': 'T', '朝': 'C', '葫': 'H', '吉': 'J',
        '四': 'S', '辽': 'L', '通': 'T', '白': 'B', '松': 'S',
        '齐': 'Q', '鸡': 'J', '鹤': 'H', '双': 'S', '大': 'D',
        '伊': 'Y', '佳': 'J', '七': 'Q', '牡': 'M', '黑': 'H',
        '绥': 'S', '无': 'W', '徐': 'X', '常': 'C', '南': 'N',
        '连': 'L', '淮': 'H', '盐': 'Y', '扬': 'Y', '镇': 'Z',
        '泰': 'T', '宿': 'S', '温': 'W', '嘉': 'J', '湖': 'H',
        '绍': 'S', '金': 'J', '衢': 'Q', '舟': 'Z', '台': 'T',
        '丽': 'L', '芜': 'W', '蚌': 'B', '淮': 'H', '马': 'M',
        '铜': 'T', '安': 'A', '黄': 'H', '滁': 'C', '阜': 'F',
        '六': 'L', '亳': 'B', '池': 'C', '宣': 'X', '莆': 'P',
        '三': 'S', '泉': 'Q', '漳': 'Z', '南': 'N', '龙': 'L',
        '宁': 'N', '景': 'J', '萍': 'P', '九': 'J', '新': 'X',
        '鹰': 'Y', '赣': 'G', '吉': 'J', '宜': 'Y', '抚': 'F',
        '上': 'S', '淄': 'Z', '枣': 'Z', '东': 'D', '烟': 'Y',
        '潍': 'W', '济': 'J', '泰': 'T', '威': 'W', '日': 'R',
        '莱': 'L', '临': 'L', '德': 'D', '聊': 'L', '滨': 'B',
        '菏': 'H', '开': 'K', '平': 'P', '安': 'A', '鹤': 'H',
        '新': 'X', '焦': 'J', '濮': 'P', '许': 'X', '三': 'S',
        '南': 'N', '商': 'S', '信': 'X', '周': 'Z', '驻': 'Z',
        '黄': 'H', '十': 'S', '宜': 'Y', '襄': 'X', '鄂': 'E',
        '荆': 'J', '孝': 'X', '咸': 'X', '随': 'S', '株': 'Z',
        '湘': 'X', '衡': 'H', '邵': 'S', '岳': 'Y', '常': 'C',
        '张': 'Z', '益': 'Y', '郴': 'C', '永': 'Y', '怀': 'H',
        '娄': 'L', '珠': 'Z', '汕': 'S', '佛': 'F', '韶': 'S',
        '湛': 'Z', '肇': 'Z', '江': 'J', '茂': 'M', '惠': 'H',
        '梅': 'M', '河': 'H', '阳': 'Y', '清': 'Q', '东': 'D',
        '中': 'Z', '潮': 'C', '揭': 'J', '云': 'Y', '柳': 'L',
        '桂': 'G', '梧': 'W', '北': 'B', '防': 'F', '钦': 'Q',
        '贵': 'G', '玉': 'Y', '百': 'B', '贺': 'H', '河': 'H',
        '来': 'L', '崇': 'C', '三': 'S', '儋': 'D', '自': 'Z',
        '攀': 'P', '泸': 'L', '德': 'D', '绵': 'M', '广': 'G',
        '遂': 'S', '内': 'N', '乐': 'L', '南': 'N', '眉': 'M',
        '宜': 'Y', '广': 'G', '达': 'D', '雅': 'Y', '巴': 'B',
        '资': 'Z', '六': 'L', '遵': 'Z', '安': 'A', '毕': 'B',
        '铜': 'T', '曲': 'Q', '玉': 'Y', '保': 'B', '昭': 'Z',
        '丽': 'L', '普': 'P', '临': 'L', '铜': 'T', '宝': 'B',
        '咸': 'X', '渭': 'W', '延': 'Y', '汉': 'H', '榆': 'Y',
        '安': 'A', '商': 'S', '嘉': 'J', '金': 'J', '白': 'B',
        '天': 'T', '武': 'W', '张': 'Z', '平': 'P', '酒': 'J',
        '庆': 'Q', '定': 'D', '陇': 'L', '海': 'H', '石': 'S',
        '吴': 'W', '固': 'G', '中': 'Z', '克': 'K', '吐': 'T',
        '哈': 'H', '昌': 'C', '阜': 'F', '博': 'B', '阿': 'A',
        '库': 'K', '阿': 'A', '阿': 'A', '喀': 'K', '和': 'H',
        '伊': 'Y', '奎': 'K', '霍': 'H', '塔': 'T', '乌': 'W',
        '阿': 'A', '石': 'S', '阿': 'A', '图': 'T', '五': 'W',
        '北': 'B', '铁': 'T', '双': 'S', '可': 'K', '昆': 'K',
        '胡': 'H', '新': 'X'
      };
      
      // 如果映射表中有，直接返回
      if (pinyinMap[firstChar]) {
        return pinyinMap[firstChar];
      }
      
      // 否则使用默认算法（使用完整字母表）
      const letterMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const index = Math.floor((firstChar.charCodeAt(0) - 0x4E00) / 200);
      return letterMap.charAt(Math.min(index, 25)) || 'Z';
    },

    // 选择城市
    handleCitySelect(e) {
      const city = e.currentTarget.dataset.city;
      this.triggerEvent('cityselect', { city });
      this.triggerEvent('close');
    },

    // 点击字母
    handleLetterTap(e) {
      const letter = e.currentTarget.dataset.letter;
      this.setData({
        selectedLetter: letter,
        scrollIntoView: `section-${letter}`
      });

      // 延迟清空scroll-into-view，避免影响后续滚动
      setTimeout(() => {
        this.setData({ scrollIntoView: '' });
      }, 300);
    },

    // 触摸字母（用于拖拽）
    handleTouchStart(e) {
      const letter = e.currentTarget.dataset.letter;
      this.setData({
        selectedLetter: letter,
        scrollIntoView: `section-${letter}`
      });
    },

    // 拖拽字母
    handleTouchMove(e) {
      if (!e || !e.touches || e.touches.length === 0) return;
      
      const touch = e.touches[0];
      const query = this.createSelectorQuery();
      query.selectAll('.letter-item').boundingClientRect();
      query.exec(res => {
        if (res && res[0] && res[0].length > 0) {
          res[0].forEach((item, index) => {
            if (touch.clientY >= item.top && touch.clientY <= item.bottom) {
              const letter = this.data.cityLetters[index];
              // 只有当 letter 有效且与当前选中的不同时才更新
              if (letter && letter !== this.data.selectedLetter) {
                this.setData({
                  selectedLetter: letter,
                  scrollIntoView: `section-${letter}`
                });
              }
            }
          });
        }
      });
    },

    // 关闭选择器
    handleClose() {
      this.triggerEvent('close');
    },

    // 点击遮罩关闭
    handleMaskTap() {
      this.triggerEvent('close');
    },

    // 阻止事件冒泡
    stopPropagation(e) {
      // 空方法，仅用于阻止事件冒泡
    }
  }
});
