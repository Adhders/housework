// pages/dispatcher/stats/stats.js
const app = getApp();
const CloudStorage = require('../../../utils/cloudStorage');

Page({
  data: {
    loading: true,
    currentTab: 'daily', // daily: 日数据, monthly: 月数据
    selectedDate: '', // 选择的日期
    startDate: '', // 开始日期
    endDate: '', // 结束日期
    dateRange: 30, // 日期范围：7, 15, 30, 90
    stats: {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      completionRate: 0,
      avgDaily: 0
    },
    dailyStats: [], // 近30天的统计数据
    monthlyStats: [], // 近12个月的统计数据
    trendData: [], // 趋势数据
    orders: [],
    showDatePicker: false,
    exportLoading: false
  },

  onLoad() {
    this.initDate();
    this.loadData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadData();
  },

  // 初始化日期
  initDate() {
    const today = new Date();
    const endDate = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');
    
    const startDateObj = new Date(today);
    startDateObj.setDate(startDateObj.getDate() - 29);
    const startDate = startDateObj.getFullYear() + '-' + 
                     String(startDateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(startDateObj.getDate()).padStart(2, '0');
    
    this.setData({ 
      selectedDate: endDate,
      startDate: startDate,
      endDate: endDate
    });
  },

  // 加载统计数据
  async loadData() {
    try {
      wx.showLoading({ title: '加载中...' });

      const userId = app.globalData.userId;
      // 获取当前派单员的所有订单
      const orders = await CloudStorage.getOrdersByDispatcher(userId);
      
      // 计算统计数据
      const stats = this.calculateStats(orders);
      const dailyStats = this.calculateDailyStats(orders);
      const monthlyStats = this.calculateMonthlyStats(orders);
      const trendData = this.calculateTrendData(dailyStats);

      this.setData({
        orders,
        stats,
        dailyStats,
        monthlyStats,
        trendData,
        loading: false
      });

      wx.hideLoading();
    } catch (e) {
      console.error('加载统计数据失败:', e);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 计算总体统计
  calculateStats(orders) {
    const stats = {
      total: orders.length,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      completionRate: 0,
      avgDaily: 0
    };

    orders.forEach(order => {
      if (order.status === 'pending') stats.pending++;
      else if (order.status === 'accepted') stats.accepted++;
      else if (order.status === 'completed') stats.completed++;
      else if (order.status === 'cancelled') stats.cancelled++;
    });

    // 计算完成率
    const finishedOrders = stats.completed + stats.cancelled;
    stats.completionRate = stats.total > 0 ? ((finishedOrders / stats.total) * 100).toFixed(2) : 0;
    
    // 计算平均每天订单数
    stats.avgDaily = this.data.dateRange > 0 ? (stats.total / this.data.dateRange).toFixed(2) : 0;

    return stats;
  },

  // 计算每日统计（近30天）
  calculateDailyStats(orders) {
    const dailyMap = {};
    const today = new Date();

    // 初始化近30天的数据
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.getFullYear() + '-' + 
                     String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(date.getDate()).padStart(2, '0');
      dailyMap[dateStr] = {
        date: dateStr,
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        cancelled: 0
      };
    }

    // 统计订单
    orders.forEach(order => {
      const createDate = order.createTime ? new Date(order.createTime).toISOString().split('T')[0] : null;
      if (createDate && dailyMap[createDate]) {
        dailyMap[createDate].total++;
        if (order.status === 'pending') dailyMap[createDate].pending++;
        else if (order.status === 'accepted') dailyMap[createDate].accepted++;
        else if (order.status === 'completed') dailyMap[createDate].completed++;
        else if (order.status === 'cancelled') dailyMap[createDate].cancelled++;
      }
    });

    return Object.values(dailyMap);
  },

  // 计算月度统计（近12个月）
  calculateMonthlyStats(orders) {
    const monthlyMap = {};
    const today = new Date();

    // 初始化近12个月的数据
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      monthlyMap[monthStr] = {
        month: monthStr,
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        cancelled: 0
      };
    }

    // 统计订单
    orders.forEach(order => {
      if (order.createTime) {
        const date = new Date(order.createTime);
        const monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (monthlyMap[monthStr]) {
          monthlyMap[monthStr].total++;
          if (order.status === 'pending') monthlyMap[monthStr].pending++;
          else if (order.status === 'accepted') monthlyMap[monthStr].accepted++;
          else if (order.status === 'completed') monthlyMap[monthStr].completed++;
          else if (order.status === 'cancelled') monthlyMap[monthStr].cancelled++;
        }
      }
    });

    return Object.values(monthlyMap);
  },

  // 计算趋势数据（用于更详细的分析）
  calculateTrendData(dailyStats) {
    return dailyStats.map(day => ({
      date: day.date,
      total: day.total,
      completed: day.completed,
      rate: day.total > 0 ? ((day.completed / day.total) * 100).toFixed(2) : 0
    }));
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 选择日期范围
  selectDateRange(e) {
    const range = parseInt(e.currentTarget.dataset.range);
    const today = new Date();
    const endDate = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');
    
    const startDateObj = new Date(today);
    startDateObj.setDate(startDateObj.getDate() - (range - 1));
    const startDate = startDateObj.getFullYear() + '-' + 
                     String(startDateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(startDateObj.getDate()).padStart(2, '0');
    
    this.setData({ 
      dateRange: range,
      startDate: startDate,
      endDate: endDate
    });
    this.loadData();
  },

  // 导出为 CSV
  exportAsCSV() {
    const { stats, dailyStats, monthlyStats, currentTab } = this.data;
    
    // 使用 currentTab 避免未使用变量警告
    console.log('当前标签:', currentTab);
    
    let csv = '';
    
    // 添加统计摘要
    csv += '派单统计数据导出\n';
    csv += `导出时间,${new Date().toLocaleString('zh-CN')}\n\n`;
    csv += '统计摘要\n';
    csv += `总订单数,${stats.total}\n`;
    csv += `待接单,${stats.pending}\n`;
    csv += `进行中,${stats.accepted}\n`;
    csv += `已完成,${stats.completed}\n`;
    csv += `已取消,${stats.cancelled}\n`;
    csv += `完成率,${stats.completionRate}%\n`;
    csv += `平均每日订单数,${stats.avgDaily}\n\n`;

    if (currentTab === 'daily') {
      csv += '日数据详情\n';
      csv += '日期,总数,待接,进行中,已完成,已取消\n';
      dailyStats.forEach(day => {
        csv += `${day.date},${day.total},${day.pending},${day.accepted},${day.completed},${day.cancelled}\n`;
      });
    } else {
      csv += '月数据详情\n';
      csv += '月份,总数,待接,进行中,已完成,已取消\n';
      monthlyStats.forEach(month => {
        csv += `${month.month},${month.total},${month.pending},${month.accepted},${month.completed},${month.cancelled}\n`;
      });
    }

    return csv;
  },

  // 导出数据
  exportData() {
    const { stats, currentTab } = this.data;
    
    wx.showActionSheet({
      itemList: ['复制到剪贴板', '分享到微信', '保存为文件'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 复制到剪贴板
          const content = `派单统计数据\n\n` +
                         `总订单数: ${stats.total}\n` +
                         `待接单: ${stats.pending}\n` +
                         `进行中: ${stats.accepted}\n` +
                         `已完成: ${stats.completed}\n` +
                         `已取消: ${stats.cancelled}\n` +
                         `完成率: ${stats.completionRate}%\n` +
                         `平均每日订单: ${stats.avgDaily}`;
          
          wx.setClipboardData({
            data: content,
            success: () => {
              wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
            }
          });
        } else if (res.tapIndex === 1) {
          // 分享到微信
          this.shareData();
        } else if (res.tapIndex === 2) {
          // 保存为文件
          this.saveDataAsFile();
        }
      }
    });
  },

  // 分享数据
  shareData() {
    const { stats } = this.data;
    const shareText = `我的派单数据统计：总订单${stats.total}个，已完成${stats.completed}个，完成率${stats.completionRate}%`;
    
    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showToast({ title: '分享内容已复制', icon: 'success' });
      }
    });
  },

  // 保存为文件
  saveDataAsFile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 刷新数据
  refreshData() {
    this.loadData();
  },

  // 查看详情
  viewDetails(e) {
    const date = e.currentTarget.dataset.date;
    const { dailyStats } = this.data;
    const dayData = dailyStats.find(d => d.date === date);
    
    if (!dayData) return;

    const content = `${date}\n\n` +
                   `总订单: ${dayData.total}\n` +
                   `待接单: ${dayData.pending}\n` +
                   `进行中: ${dayData.accepted}\n` +
                   `已完成: ${dayData.completed}\n` +
                   `已取消: ${dayData.cancelled}`;

    wx.showModal({
      title: '日数据详情',
      content: content,
      showCancel: false
    });
  }
});
