// services/ai.js

// 模拟 AI 生成的知识库
const MOCK_KNOWLEDGE_BASE = {
  '数学': [
    {
      question: '二次函数 ax²+bx+c=0 的判别式是什么？',
      answer: 'Δ = b² - 4ac',
      tip: '记忆口诀：判别式 Δ=b²-4ac，大于零有两不同实根'
    },
    {
      question: '直线的倾斜角范围是多少？',
      answer: '[0, π)',
      tip: '注意：倾斜角为 90° 时斜率不存在'
    },
    {
      question: '等差数列通项公式？',
      answer: 'an = a1 + (n-1)d',
      tip: 'a1 为首项，d 为公差'
    }
  ],
  '英语': [
    {
      question: 'abandon 的中文含义？',
      answer: 'v. 放弃，遗弃；n. 放任',
      tip: '联想记忆：a band on (一支乐队在...) -> 放弃演出'
    },
    {
      question: '虚拟语气 if I were you 的用法？',
      answer: '表示与现在事实相反的假设',
      tip: '主句通常用 would/should/could/might + 动词原形'
    }
  ],
  'default': [
    {
      question: '示例问题：这是关于该主题的核心考点',
      answer: '核心答案：关键点1、关键点2',
      tip: '拓展提示：这里是记忆技巧或易错点提醒'
    }
  ]
};

/**
 * 模拟调用 AI 接口生成卡片
 * 
 * 真实对接 DeepSeek/智谱 API 时的 Prompt 建议：
 * System Prompt: "你是对应学段学科专家，围绕用户主题生成问答卡片，问题聚焦细分知识点，答案简洁准确，符合考纲/考点要求，避免超纲内容。请以 JSON 格式返回，包含 question, answer, tip 字段。"
 * User Prompt: "主题：{topic}，学科：{subject}，难度：{difficulty}，请生成 {count} 道题。"
 * 
 * @param {Object} params - { topic, subject, difficulty, count }
 * @returns {Promise}
 */
export const generateCardsAI = (params) => {
  return new Promise((resolve, reject) => {
    console.log('正在请求 AI 接口，参数：', params);
    
    // 模拟网络延迟 1.5s
    setTimeout(() => {
      const { topic, count } = params;
      let resultList = [];
      
      // 简单的关键词匹配 Mock 数据
      let sourceKey = 'default';
      if (topic.includes('数学') || topic.includes('几何') || topic.includes('函数')) {
        sourceKey = '数学';
      } else if (topic.includes('英语') || topic.includes('单词') || topic.includes('语法')) {
        sourceKey = '英语';
      }
      
      const sourceList = MOCK_KNOWLEDGE_BASE[sourceKey];
      
      // 生成指定数量的卡片
      for (let i = 0; i < count; i++) {
        const item = sourceList[i % sourceList.length];
        resultList.push({
          id: i + 1,
          question: item.question, // 实际场景下 AI 会根据 topic 生成不同问题
          answer: item.answer,
          tip: item.tip,
          isFlipped: false // 前端状态：是否翻转
        });
      }
      
      // 加上一些随机性，模拟 AI 针对特定主题的生成
      if (sourceKey === 'default') {
         resultList = resultList.map((item, index) => ({
           ...item,
           question: `[${topic}] 知识点 ${index + 1}：核心概念定义？`,
           answer: `关于 ${topic} 的关键要素 ${index + 1}`,
           tip: `掌握 ${topic} 的这个点很重要`
         }));
      }

      resolve({
        success: true,
        data: resultList
      });
    }, 1500);
  });
};
