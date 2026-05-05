export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: '猫三联疫苗主要预防以下哪些疾病？',
    options: ['猫瘟、猫杯状病毒、猫鼻支', '猫瘟、猫白血病、猫艾滋', '猫鼻支、猫传腹、猫杯状病毒', '猫瘟、猫传腹、猫白血病'],
    answer: 0,
    explanation: '猫三联预防猫瘟（猫泛白细胞减少症）、猫杯状病毒和猫疱疹病毒（猫鼻支）。',
  },
  {
    id: 2,
    question: '幼犬首次接种疫苗的最佳时间是？',
    options: ['出生后1周', '出生后6-8周', '出生后3个月', '出生后6个月'],
    answer: 1,
    explanation: '幼犬通常在6-8周龄时开始首次疫苗接种，此时母源抗体开始下降。',
  },
  {
    id: 3,
    question: '建议的体内外驱虫频率是？',
    options: ['每月一次', '每3个月一次', '每半年一次', '每年一次'],
    answer: 1,
    explanation: '一般建议每3个月进行一次体内驱虫，体外驱虫可根据季节和环境调整。',
  },
  {
    id: 4,
    question: '巧克力对狗的主要危害成分是？',
    options: ['咖啡因', '可可碱', '糖分', '脂肪'],
    answer: 1,
    explanation: '巧克力中的可可碱对狗有毒，狗代谢可可碱的速度很慢，会导致中毒。',
  },
  {
    id: 5,
    question: '以下哪种食物对猫是有毒的？',
    options: ['鸡肉', '葡萄', '三文鱼', '南瓜'],
    answer: 1,
    explanation: '葡萄和葡萄干对猫和狗都有毒性，可能导致急性肾衰竭。',
  },
  {
    id: 6,
    question: '发现宠物误食异物后，正确的做法是？',
    options: ['立即催吐', '先观察，不要自行处理，尽快就医', '喂大量水冲下去', '喂食让它排出来'],
    answer: 1,
    explanation: '误食异物后不应自行催吐，某些异物可能造成二次伤害，应尽快就医。',
  },
  {
    id: 7,
    question: '猫咪频繁过度舔毛可能是什么原因？',
    options: ['只是爱干净', '压力焦虑或皮肤问题', '正常换毛', '口渴'],
    answer: 1,
    explanation: '过度舔毛可能是压力、焦虑、皮肤病或疼痛的表现，需要关注。',
  },
  {
    id: 8,
    question: '如何正确判断宠物是否发烧？',
    options: ['摸耳朵感觉', '测量直肠温度', '看鼻子干湿', '看精神状态'],
    answer: 1,
    explanation: '最准确的方法是测量直肠温度。猫狗正常体温约38-39.2°C。',
  },
  {
    id: 9,
    question: '给宠物做绝育手术的好处不包括？',
    options: ['减少生殖系统疾病', '降低攻击性', '保证寿命延长', '避免意外怀孕'],
    answer: 2,
    explanation: '绝育可以减少疾病和行为问题，但不能保证寿命延长，只是降低某些疾病风险。',
  },
  {
    id: 10,
    question: '给猫洗澡的建议频率是？',
    options: ['每周一次', '每月一次', '不需要经常洗，几个月一次即可', '每天一次'],
    answer: 2,
    explanation: '猫会自己清洁，一般几个月洗一次或脏了再洗即可，频繁洗澡会破坏皮肤油脂。',
  },
  {
    id: 11,
    question: '宠物接种疫苗后应注意什么？',
    options: ['立即洗澡', '一周内避免洗澡和剧烈运动', '多喂食补充营养', '带它多运动增强体质'],
    answer: 1,
    explanation: '疫苗后一周内免疫力可能下降，应避免洗澡和剧烈运动，观察是否有不良反应。',
  },
  {
    id: 12,
    question: '以下哪种是常见的猫体内寄生虫？',
    options: ['蜱虫', '蛔虫', '跳蚤', '螨虫'],
    answer: 1,
    explanation: '蛔虫是常见的体内寄生虫。蜱虫、跳蚤和螨虫属于体外寄生虫。',
  },
  {
    id: 13,
    question: '幼猫（2-6个月）建议的喂食频率是？',
    options: ['每天1次', '每天2次', '每天3-4次', '随时有食物'],
    answer: 2,
    explanation: '幼猫消化系统尚未成熟，建议少食多餐，每天3-4次。',
  },
  {
    id: 14,
    question: '发现宠物中暑后，首先应该做什么？',
    options: ['用冰水浸泡', '移到阴凉处，用常温水降温', '喂冰水', '让它自己休息'],
    answer: 1,
    explanation: '应立即将宠物移到阴凉通风处，用常温水（非冰水）帮助降温，并尽快就医。',
  },
  {
    id: 15,
    question: '预防宠物口腔疾病的最佳方法是？',
    options: ['喂硬粮就行', '定期刷牙', '给洁牙棒', '不需要特别护理'],
    answer: 1,
    explanation: '定期刷牙是预防牙结石和牙龈疾病最有效的方法，建议每周至少刷2-3次。',
  },
];

export function getQuizSet(): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}
