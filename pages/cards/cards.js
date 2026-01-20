// pages/cards/cards.js
import { generateCardsAI } from '../../services/ai';

Page({
  data: {
    loading: true,
    cards: [],
    currentIndex: 0,
    topic: ''
  },

  onLoad(options) {
    this.loadCards();
  },

  async loadCards() {
    let params = wx.getStorageSync('cardParams');
    
    // 调试模式：如果参数丢失，自动补充默认参数
    if (!params) {
      console.warn('参数丢失，使用默认调试参数');
      params = {
        topic: '默认测试主题',
        subject: '通用',
        difficulty: '基础',
        count: 5
      };
      // 提示用户但不阻断，方便调试
      wx.showToast({ title: '使用调试数据', icon: 'none' });
    }

    this.setData({ topic: params.topic });

    try {
      const res = await generateCardsAI(params);
      if (res.success) {
        this.setData({
          cards: res.data,
          loading: false
        });
      } else {
         throw new Error('API 返回失败');
      }
    } catch (err) {
      console.error('生成卡片失败:', err);
      wx.showToast({ title: '生成失败，请重试', icon: 'none' });
      // 确保 Loading 状态结束，防止界面卡死
      this.setData({ loading: false });
      
      // 延迟返回，让用户看到提示
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  toggleFlip() {
    const index = this.data.currentIndex;
    const key = `cards[${index}].isFlipped`;
    this.setData({
      [key]: !this.data.cards[index].isFlipped
    });
  },

  nextCard() {
    if (this.data.currentIndex < this.data.cards.length - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      });
    }
  },

  prevCard() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      });
    }
  },

  // 处理图片加载错误
  handleImageError(e) {
    console.warn('引流图片加载失败，请确保 images/gzh.png 存在', e);
  },

  // 保存当前卡片为图片
  saveCardImage() {
    wx.showLoading({ title: '正在生成图片...' });
    
    const query = wx.createSelectorQuery();
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 创建图片对象并加载
        const img = canvas.createImage();
        img.src = '/images/gzh.png';
        
        img.onload = () => {
          // 图片加载成功，传入 drawCard
          this.drawCard(ctx, res[0].width, res[0].height, img, () => {
            this.saveCanvasToFile(canvas);
          });
        };

        img.onerror = () => {
          // 图片加载失败，依然绘制但不带图片
          console.warn('Canvas 图片加载失败');
          this.drawCard(ctx, res[0].width, res[0].height, null, () => {
             this.saveCanvasToFile(canvas);
          });
        };
      });
  },

  saveCanvasToFile(canvas) {
    wx.canvasToTempFilePath({
      canvas,
      success: (fileRes) => {
        wx.saveImageToPhotosAlbum({
          filePath: fileRes.tempFilePath,
          success: () => {
            wx.hideLoading();
            wx.showToast({ title: '已保存到相册', icon: 'success' });
          },
          fail: (err) => {
            wx.hideLoading();
            // 用户授权失败处理
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '提示',
                content: '需要保存到相册权限',
                success: (modalRes) => {
                  if (modalRes.confirm) wx.openSetting();
                }
              });
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' });
            }
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '导出失败', icon: 'none' });
      }
    });
  },

  drawCard(ctx, width, height, promoImg, callback) {
    const card = this.data.cards[this.data.currentIndex];
    const isFlipped = card.isFlipped;

    // 背景
    ctx.fillStyle = '#FFFBE6'; // 保持和页面背景一致的暖色
    ctx.fillRect(0, 0, width, height);
    
    // 卡片区域（绘制一个圆角矩形）
    const cardX = 20;
    const cardY = 20;
    const cardW = width - 40;
    const cardH = height - 180; // 留出底部给图片

    ctx.fillStyle = '#FFFFFF';
    // 绘制圆角矩形路径
    ctx.beginPath();
    const r = 20;
    ctx.moveTo(cardX + r, cardY);
    ctx.lineTo(cardX + cardW - r, cardY);
    ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + r, r);
    ctx.lineTo(cardX + cardW, cardY + cardH - r);
    ctx.arcTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH, r);
    ctx.lineTo(cardX + r, cardY + cardH);
    ctx.arcTo(cardX, cardY + cardH, cardX, cardY + cardH - r, r);
    ctx.lineTo(cardX, cardY + r);
    ctx.arcTo(cardX, cardY, cardX + r, cardY, r);
    ctx.closePath();
    
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fill();
    ctx.shadowColor = "transparent"; // 重置阴影

    // 边框装饰 (根据正反面不同)
    ctx.strokeStyle = isFlipped ? '#E3FDFD' : '#FFE3E3';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('轻学闪卡', width / 2, 50);

    // 内容绘制
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 简单的自动换行处理
    const drawTextWrapped = (text, x, y, maxWidth, lineHeight, color = '#333', font = '20px sans-serif') => {
        ctx.fillStyle = color;
        ctx.font = font;
        const words = text.split('');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n];
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    };

    let startY = cardY + 60; // 标题下面
    const paddingX = cardX + 30;
    const contentWidth = cardW - 60;

    if (!isFlipped) {
        // 问题面
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('❓ Question', width / 2, startY);
        
        startY += 60;
        ctx.textAlign = 'left'; 
        drawTextWrapped(card.question, paddingX, startY, contentWidth, 36, '#333', '22px sans-serif');
        
        // 底部提示
        ctx.fillStyle = '#AAA';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('扫描下方二维码关注我们', width / 2, cardY + cardH - 40);

    } else {
        // 答案面
        ctx.fillStyle = '#4ECDC4';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✅ Answer', width / 2, startY);
        
        startY += 50;
        ctx.textAlign = 'left';
        let endY = drawTextWrapped(card.answer, paddingX, startY, contentWidth, 32, '#333', '20px sans-serif');
        
        // 问题回顾 (新增)
        startY = endY + 20;
        ctx.fillStyle = '#F7F9FC'; // 背景块
        ctx.fillRect(paddingX - 10, startY, contentWidth + 20, 60); // 简单估算高度
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#8898AA';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('回顾问题：', paddingX, startY + 10);
        
        // 限制问题回顾的显示长度，避免太长
        let questionReview = card.question;
        if (questionReview.length > 35) questionReview = questionReview.substring(0, 32) + '...';
        
        drawTextWrapped(questionReview, paddingX, startY + 35, contentWidth, 20, '#556270', '16px sans-serif');

        startY += 70; // 跳过回顾区域

        ctx.fillStyle = '#FF8E53';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('💡 Tips', width / 2, startY);
        
        startY += 30;
        ctx.textAlign = 'left';
        endY = drawTextWrapped(card.tip, paddingX, startY, contentWidth, 28, '#666', 'italic 18px sans-serif');

        // 励志语录 (新增)
        if (card.quote) {
             startY = cardY + cardH - 50; // 底部位置
             ctx.textAlign = 'center';
             ctx.fillStyle = '#FF6B6B';
             ctx.font = 'italic 16px "Times New Roman", serif';
             ctx.fillText(`“${card.quote}”`, width / 2, startY);
        }
    }

    // 绘制底部引流图片
    if (promoImg) {
        // 图片宽高比
        const imgRatio = promoImg.width / promoImg.height;
        const targetW = width - 40; // 左右各留 20 边距
        const targetH = targetW / imgRatio;
        
        // 限制最大高度
        const maxH = 150;
        let finalW = targetW;
        let finalH = targetH;
        
        if (targetH > maxH) {
            finalH = maxH;
            finalW = finalH * imgRatio;
        }

        const imgX = (width - finalW) / 2;
        const imgY = height - finalH - 20; // 距离底部 20
        
        ctx.drawImage(promoImg, imgX, imgY, finalW, finalH);
    } else {
        // 没有图片时绘制文字占位
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('更多资讯请关注公众号：技术人个人品牌训练营', width / 2, height - 50);
    }

    if (callback) callback();
  }
});
