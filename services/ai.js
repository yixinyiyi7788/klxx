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
    },
    {
      question: '三角形的面积计算公式有哪些？',
      answer: '1. S = 1/2 * 底 * 高\n2. 海伦公式：S = √[p(p-a)(p-b)(p-c)]，其中 p=(a+b+c)/2\n3. S = 1/2 * ab * sinC',
      tip: '基础题用底高公式，已知三边用海伦公式，已知两边一夹角用正弦公式'
    },
    {
      question: '勾股定理的内容是什么？',
      answer: '在直角三角形中，两直角边的平方和等于斜边的平方：a² + b² = c²',
      tip: '常见勾股数：(3,4,5), (5,12,13), (6,8,10)'
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
    },
    {
      question: '现在完成时 (Present Perfect) 的构成？',
      answer: 'have/has + 过去分词 (done)',
      tip: '常与 already, yet, ever, never, just, before 等词连用'
    }
  ],
  '历史': [
    {
      question: '秦始皇统一六国的时间？',
      answer: '公元前 221 年',
      tip: '秦朝是中国历史上第一个统一的中央集权的封建国家'
    },
    {
      question: '洋务运动的口号是什么？',
      answer: '自强、求富',
      tip: '前期口号“自强”，后期口号“求富”'
    }
  ],
  '通用': [
    {
      question: '如何高效管理时间？',
      answer: '1. 列出任务清单 (To-Do List)\n2. 使用番茄工作法 (25分钟专注+5分钟休息)\n3. 区分“重要”与“紧急”任务',
      tip: '要事第一，拒绝拖延'
    },
    {
      question: '什么是批判性思维？',
      answer: '一种理性的、清晰的思维方式，不盲从权威，善于独立思考、分析证据并得出结论。',
      tip: '多问“为什么”、“证据是什么”、“有没有其他可能性”'
    },
    {
      question: '光合作用的反应式？',
      answer: 'CO₂ + H₂O + 光能 -> (叶绿体) -> (CH₂O) + O₂',
      tip: '产物是有机物和氧气，场所是叶绿体，条件是光'
    }
  ]
};

const MOTIVATIONAL_QUOTES = [
  '世上无难事，只要肯登攀。',
  '学而不思则罔，思而不学则殆。',
  '知之者不如好之者，好之者不如乐之者。',
  '书山有路勤为径，学海无涯苦作舟。'
];

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
      try {
        const { topic, count } = params;
        let resultList = [];
        
        // 简单的关键词匹配 Mock 数据
        let sourceList;
        if (topic.includes('数学') || topic.includes('几何') || topic.includes('函数')) {
          sourceList = MOCK_KNOWLEDGE_BASE['数学'];
        } else if (topic.includes('英语') || topic.includes('单词') || topic.includes('语法')) {
          sourceList = MOCK_KNOWLEDGE_BASE['英语'];
        } else {
          // 2. 模糊/默认匹配：混合所有题库 + 通用库，确保返回有意义的内容
          //    不再使用机械模板，而是随机展示高质量真题，模拟 AI "联想" 到的相关或拓展知识
          const allTopics = Object.keys(MOCK_KNOWLEDGE_BASE).reduce((acc, key) => {
            return acc.concat(MOCK_KNOWLEDGE_BASE[key]);
          }, []);
          sourceList = allTopics;
        }
        
        // 生成指定数量的卡片
        for (let i = 0; i < count; i++) {
          const item = sourceList[i % sourceList.length];
          const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
          
          resultList.push({
            id: i + 1,
            question: item.question, // 实际场景下 AI 会根据 topic 生成不同问题
            answer: item.answer,
            tip: item.tip,
            quote: randomQuote, // 随机励志语录
            isFlipped: false // 前端状态：是否翻转
          });
        }
  
        resolve({
          success: true,
          data: resultList
        });
      } catch (e) {
        reject(e);
      }
    }, 1500);
  });
};
