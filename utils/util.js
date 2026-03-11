// utils/util.js
// 工具函数

const Util = {
  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 格式化日期
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // 订单状态映射
  orderStatusMap: {
    'pending': '待接单',
    'accepted': '已接单',
    'completed': '已完成',
    'cancelled': '已取消'
  },

  // 订单状态颜色
  orderStatusColor: {
    'pending': '#ff9800',
    'accepted': '#2196F3',
    'completed': '#4CAF50',
    'cancelled': '#999'
  },

  // 服务类型映射
  serviceTypeMap: {
    // 保洁类
    'cleaning': '日常保洁',
    'deep_clean': '深度清洁',
    'appliance_clean': '家电清洗',
    // 护理类
    'elder_care': '老人护理',
    'child_care': '儿童托管',
    'confinement_nurse': '保姆月嫂',
    'matron': '育婴师',
    // 家政类
    'cooking': '做饭服务',
    'pet_care': '宠物护理',
    'housekeeping': '家政整理',
    // 其他
    'other': '其他服务'
  },

  // 服务类型分类（用于筛选）
  serviceCategories: {
    'cleaning': {
      name: '保洁服务',
      types: ['cleaning', 'deep_clean', 'appliance_clean'],
      icon: '🧹',
      color: '#4CAF50'
    },
    'care': {
      name: '护理服务',
      types: ['elder_care', 'child_care', 'confinement_nurse', 'matron'],
      icon: '👶',
      color: '#2196F3'
    },
    'housekeeping': {
      name: '家政服务',
      types: ['cooking', 'pet_care', 'housekeeping'],
      icon: '🏠',
      color: '#FF9800'
    },
    'other': {
      name: '其他服务',
      types: ['other'],
      icon: '📦',
      color: '#999'
    }
  },

  // 计算距离（简化版）
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径 km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  }
};

module.exports = Util;
