export type DietTip = {
  title: string;
  content: string;
};

export type DietGuide = {
  petType: 'cat' | 'dog';
  ageGroup: string;
  tips: DietTip[];
};

export const dietGuides: DietGuide[] = [
  // === 猫咪 ===
  {
    petType: 'cat',
    ageGroup: '幼猫（0-1岁）',
    tips: [
      { title: '喂食频率', content: '每天 3-4 次，少量多餐' },
      { title: '食物选择', content: '幼猫专用猫粮，蛋白质含量 ≥30%' },
      { title: '补充营养', content: '适量补充钙质和牛磺酸，促进骨骼和视力发育' },
      { title: '饮水', content: '保证充足清洁饮水，可使用流动饮水器增加饮水量' },
    ],
  },
  {
    petType: 'cat',
    ageGroup: '成猫（1-7岁）',
    tips: [
      { title: '喂食频率', content: '每天 2 次定时喂食，避免自由采食导致肥胖' },
      { title: '食物选择', content: '优质成猫粮，蛋白质含量 ≥26%，脂肪 10-15%' },
      { title: '湿粮搭配', content: '每周 2-3 次罐头或鲜食，补充水分' },
      { title: '禁忌食物', content: '巧克力、葡萄、洋葱、大蒜、生鸡蛋、牛奶（乳糖不耐受）' },
      { title: '体重管理', content: '理想体重 3.5-5kg，定期称重，及时调整喂食量' },
    ],
  },
  {
    petType: 'cat',
    ageGroup: '老猫（7岁以上）',
    tips: [
      { title: '食物选择', content: '老年猫专用粮，低磷低钠，易消化' },
      { title: '喂食频率', content: '每天 2-3 次，少量多餐更易消化' },
      { title: '关节保健', content: '补充关节保健品（葡萄糖胺+软骨素）' },
      { title: '肾脏护理', content: '控制磷摄入，保证充足饮水，定期检查肾功能' },
    ],
  },
  // === 狗狗 ===
  {
    petType: 'dog',
    ageGroup: '幼犬（0-1岁）',
    tips: [
      { title: '喂食频率', content: '2-3月龄每天 4 次；4-6月龄每天 3 次；6月龄以上每天 2 次' },
      { title: '食物选择', content: '幼犬专用粮，蛋白质含量 ≥28%，钙磷比 1.2:1' },
      { title: '补钙', content: '大型犬幼犬需适当补钙，防止骨骼发育问题' },
      { title: '禁忌食物', content: '巧克力、葡萄、洋葱、木糖醇、鸡骨头' },
    ],
  },
  {
    petType: 'dog',
    ageGroup: '成犬（1-7岁）',
    tips: [
      { title: '喂食频率', content: '每天 2 次定时喂食，避免饭后剧烈运动' },
      { title: '食物选择', content: '优质成犬粮，蛋白质 ≥22%，脂肪 8-15%' },
      { title: '零食控制', content: '零食不超过每日摄入量的 10%' },
      { title: '人类食物', content: '可少量喂食：煮熟的鸡胸肉、胡萝卜、南瓜、苹果（去籽）' },
      { title: '体重管理', content: '小型犬理想体重因品种而异，中型犬 10-25kg，大型犬 25-40kg' },
    ],
  },
  {
    petType: 'dog',
    ageGroup: '老犬（7岁以上）',
    tips: [
      { title: '食物选择', content: '老年犬专用粮，低脂高纤维，易消化' },
      { title: '喂食频率', content: '每天 2-3 次，少量多餐' },
      { title: '关节保护', content: '补充 Omega-3 脂肪酸和关节保健品' },
      { title: '心脏健康', content: '控制钠摄入，补充牛磺酸和左旋肉碱' },
    ],
  },
];

export function getDietGuides(petType: 'cat' | 'dog' | ''): DietGuide[] {
  return dietGuides.filter((g) => g.petType === petType);
}
