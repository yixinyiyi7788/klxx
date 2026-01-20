// pages/index/index.js
Page({
  data: {
    topic: '',
    subjects: ['小学', '初中', '高中', '大学', '考证'],
    subjectIndex: 2, // 默认高中
    difficulties: ['基础', '进阶', '冲刺'],
    difficulty: '基础',
    count: 10
  },

  handleTopicInput(e) {
    this.setData({
      topic: e.detail.value
    });
  },

  bindSubjectChange(e) {
    this.setData({
      subjectIndex: e.detail.value
    });
  },

  selectDifficulty(e) {
    this.setData({
      difficulty: e.currentTarget.dataset.value
    });
  },

  handleCountChange(e) {
    this.setData({
      count: e.detail.value
    });
  },

  generateCards() {
    if (!this.data.topic) {
      wx.showToast({
        title: '请输入学习主题',
        icon: 'none'
      });
      return;
    }

    const params = {
      topic: this.data.topic,
      subject: this.data.subjects[this.data.subjectIndex],
      difficulty: this.data.difficulty,
      count: this.data.count
    };

    // 存储参数到本地，供卡片页使用
    wx.setStorageSync('cardParams', params);

    wx.navigateTo({
      url: '/pages/cards/cards',
    });
  }
});
