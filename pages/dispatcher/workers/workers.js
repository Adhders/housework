// pages/dispatcher/workers/workers.js
const app = getApp();
const CloudStorage = require('../../../utils/cloudStorage');

Page({
  data: {
    workers: [],
    filteredWorkers: [],
    searchKey: '',
    avgRating: '5.0',
    totalOrders: 0,
    showEvaluateModal: false,
    currentWorker: {},
    evaluateForm: {
      attitude: 5,
      quality: 5,
      punctuality: 5,
      comment: ''
    }
  },

  onLoad() {
    this.loadWorkers();
  },

  onShow() {
    this.loadWorkers();
  },

  // 加载阿姨列表
  async loadWorkers() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 获取所有接单的阿姨
      const orders = await CloudStorage.getMyOrders(app.globalData.userId);
      
      // 提取阿姨信息并去重
      const workerMap = new Map();
      let totalOrders = 0;
      
      orders.forEach(order => {
        if (order.workerId && order.workerName) {
          if (!workerMap.has(order.workerId)) {
            workerMap.set(order.workerId, {
              _id: order.workerId,
              name: order.workerName,
              phone: order.workerPhone || '',
              avatar: order.workerAvatar || '',
              city: order.city || '',
              completedOrders: 0,
              rating: 5.0,
              joinTime: this.formatTime(order.createTime)
            });
          }
          
          const worker = workerMap.get(order.workerId);
          if (order.status === 'completed') {
            worker.completedOrders++;
            totalOrders++;
          }
        }
      });
      
      const workers = Array.from(workerMap.values());
      
      // 计算平均评分
      const avgRating = workers.length > 0 
        ? (workers.reduce((sum, w) => sum + w.rating, 0) / workers.length).toFixed(1)
        : '5.0';
      
      this.setData({
        workers,
        filteredWorkers: workers,
        avgRating,
        totalOrders
      });
    } catch (error) {
      console.error('加载阿姨列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value });
  },

  // 搜索
  onSearch() {
    const { workers, searchKey } = this.data;
    if (!searchKey) {
      this.setData({ filteredWorkers: workers });
      return;
    }
    
    const filtered = workers.filter(worker => 
      worker.name && worker.name.includes(searchKey)
    );
    this.setData({ filteredWorkers: filtered });
  },

  // 打开评价弹窗
  openEvaluateModal(e) {
    const worker = e.currentTarget.dataset.worker;
    this.setData({
      showEvaluateModal: true,
      currentWorker: worker,
      evaluateForm: {
        attitude: 5,
        quality: 5,
        punctuality: 5,
        comment: ''
      }
    });
  },

  // 关闭评价弹窗
  closeEvaluateModal() {
    this.setData({ showEvaluateModal: false });
  },

  // 设置评分
  setRating(e) {
    const { field, value } = e.currentTarget.dataset;
    this.setData({
      [`evaluateForm.${field}`]: parseInt(value)
    });
  },

  // 评价内容输入
  onCommentInput(e) {
    this.setData({
      'evaluateForm.comment': e.detail.value
    });
  },

  // 提交评价
  async submitEvaluate() {
    const { currentWorker, evaluateForm } = this.data;
    
    // 计算综合评分
    const avgScore = ((evaluateForm.attitude + evaluateForm.quality + evaluateForm.punctuality) / 3).toFixed(1);
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      // 保存评价到云数据库
      const evaluation = {
        workerId: currentWorker._id,
        workerName: currentWorker.name,
        dispatcherId: app.globalData.userId,
        dispatcherName: app.globalData.userInfo.name,
        attitude: evaluateForm.attitude,
        quality: evaluateForm.quality,
        punctuality: evaluateForm.punctuality,
        avgScore: parseFloat(avgScore),
        comment: evaluateForm.comment,
        createTime: Date.now()
      };
      
      // 调用云函数保存评价
      await wx.cloud.callFunction({
        name: 'workerManager',
        data: {
          action: 'addEvaluation',
          data: evaluation
        }
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '评价成功',
        icon: 'success'
      });
      
      this.closeEvaluateModal();
      this.loadWorkers();
    } catch (error) {
      console.error('提交评价失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '评价失败',
        icon: 'none'
      });
    }
  },

  // 查看历史订单
  viewHistory(e) {
    const worker = e.currentTarget.dataset.worker;
    wx.navigateTo({
      url: `/pages/dispatcher/workerOrders/workerOrders?workerId=${worker._id}&workerName=${worker.name}`
    });
  },

  // 跳转到阿姨详情
  goToWorkerDetail(e) {
    const workerId = e.currentTarget.dataset.id;
    // 后续可以扩展阿姨详情页
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }
});
