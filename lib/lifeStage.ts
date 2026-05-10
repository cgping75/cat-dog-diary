export type LifeStage = {
  key: string;
  name: string;
  icon: string;
  petType: 'cat' | 'dog';
  ageRange: [number, number]; // 月龄范围
  description: string;
  careTip: string;
};

const catStages: LifeStage[] = [
  {
    key: 'newborn', name: '新生期', icon: 'baby-face-outline', petType: 'cat',
    ageRange: [0, 0.5],
    description: '眼耳未完全打开，依赖母猫，不能自主调节体温',
    careTip: '保温、母乳/代乳、观察体重',
  },
  {
    key: 'nursing', name: '哺乳期', icon: 'baby-carriage', petType: 'cat',
    ageRange: [0.5, 1],
    description: '开眼、开始听见声音，活动能力增强',
    careTip: '保温、继续哺乳、轻度社交',
  },
  {
    key: 'weaning', name: '离乳期', icon: 'food-apple-outline', petType: 'cat',
    ageRange: [1, 2],
    description: '开始吃软食，学习排便、玩耍、社交',
    careTip: '逐步断奶、猫砂训练、驱虫准备',
  },
  {
    key: 'kitten', name: '幼猫期', icon: 'cat', petType: 'cat',
    ageRange: [2, 6],
    description: '快速生长，好奇心强，免疫系统建立',
    careTip: '疫苗、驱虫、营养、社会化训练',
  },
  {
    key: 'teen', name: '青少年期', icon: 'run-fast', petType: 'cat',
    ageRange: [6, 12],
    description: '接近性成熟，精力旺盛，可能发情',
    careTip: '绝育评估、行为训练、控制体重',
  },
  {
    key: 'young-adult', name: '青年成猫期', icon: 'shield-cat', petType: 'cat',
    ageRange: [12, 36],
    description: '身体成熟，活动量高，性格稳定',
    careTip: '年检、饮食管理、运动消耗',
  },
  {
    key: 'adult', name: '成年期', icon: 'paw', petType: 'cat',
    ageRange: [36, 84],
    description: '状态稳定，是猫咪的黄金阶段',
    careTip: '体重、牙齿、毛发、疫苗/驱虫维护',
  },
  {
    key: 'mature', name: '熟龄期', icon: 'timer-sand', petType: 'cat',
    ageRange: [84, 120],
    description: '代谢下降，开始出现早期老化',
    careTip: '增加体检频率、关注肾脏/牙齿/体重',
  },
  {
    key: 'senior', name: '老年期', icon: 'human-walker', petType: 'cat',
    ageRange: [120, 180],
    description: '活动减少，慢性病风险上升',
    careTip: '半年体检、关节、肾脏、心脏、饮食调整',
  },
  {
    key: 'geriatric', name: '高龄期', icon: 'heart-outline', petType: 'cat',
    ageRange: [180, 360],
    description: '衰老明显，可能有认知、行动、食欲问题',
    careTip: '舒适护理、疼痛管理、生活质量评估',
  },
];

const dogStages: LifeStage[] = [
  {
    key: 'newborn', name: '新生期', icon: 'baby-face-outline', petType: 'dog',
    ageRange: [0, 0.5],
    description: '眼耳未完全发育，依赖母犬，不能自主调节体温',
    careTip: '保温、母乳/代乳、观察体重',
  },
  {
    key: 'nursing', name: '哺乳期', icon: 'baby-carriage', petType: 'dog',
    ageRange: [0.5, 1],
    description: '开眼、听觉增强，开始爬行和互动',
    careTip: '保温、哺乳、轻度接触',
  },
  {
    key: 'weaning', name: '离乳期', icon: 'food-apple-outline', petType: 'dog',
    ageRange: [1, 2],
    description: '开始吃软食，学习排便、玩耍、社交',
    careTip: '断奶、驱虫、基础社会化',
  },
  {
    key: 'puppy', name: '幼犬期', icon: 'dog', petType: 'dog',
    ageRange: [2, 6],
    description: '快速生长，免疫系统建立，学习能力强',
    careTip: '疫苗、驱虫、训练、营养',
  },
  {
    key: 'teen', name: '青少年期', icon: 'run-fast', petType: 'dog',
    ageRange: [6, 12],
    description: '接近性成熟，精力旺盛，行为容易波动',
    careTip: '绝育评估、服从训练、运动管理',
  },
  {
    key: 'young-adult', name: '青年犬期', icon: 'shield-dog', petType: 'dog',
    ageRange: [12, 36],
    description: '身体成熟，活跃度高，性格逐渐稳定',
    careTip: '运动、体重控制、行为巩固',
  },
  {
    key: 'adult', name: '成年期', icon: 'paw', petType: 'dog',
    ageRange: [36, 84],
    description: '状态稳定，是犬只黄金阶段',
    careTip: '年检、牙齿护理、饮食管理',
  },
  {
    key: 'mature', name: '熟龄期', icon: 'timer-sand', petType: 'dog',
    ageRange: [84, 120],
    description: '代谢下降，体能开始变化',
    careTip: '增加体检、关注关节、牙齿、体重',
  },
  {
    key: 'senior', name: '老年期', icon: 'human-walker', petType: 'dog',
    ageRange: [120, 180],
    description: '慢性病风险上升，活动减少',
    careTip: '半年体检、心脏、肾脏、关节护理',
  },
  {
    key: 'geriatric', name: '高龄期', icon: 'heart-outline', petType: 'dog',
    ageRange: [180, 360],
    description: '衰老明显，可能有认知、行动、食欲问题',
    careTip: '舒适护理、疼痛管理、生活质量评估',
  },
];

export function parseAgeMonths(ageText: string): number | null {
  if (!ageText) return null;
  const yearMatch = ageText.match(/(\d+)\s*岁/);
  const monthMatch = ageText.match(/(\d+)\s*个?月/);
  let months = 0;
  if (yearMatch) months += parseInt(yearMatch[1]) * 12;
  if (monthMatch) months += parseInt(monthMatch[1]);
  if (months === 0 && !yearMatch && !monthMatch) {
    const num = parseInt(ageText);
    if (!isNaN(num)) months = num;
  }
  return months > 0 ? months : null;
}

export function getLifeStage(petType: 'cat' | 'dog', ageMonths: number | null): LifeStage | null {
  if (ageMonths === null) return null;
  const stages = petType === 'cat' ? catStages : dogStages;
  return stages.find((s) => ageMonths >= s.ageRange[0] && ageMonths <= s.ageRange[1]) || null;
}

export function getAllLifeStages(petType: 'cat' | 'dog'): LifeStage[] {
  return petType === 'cat' ? catStages : dogStages;
}
