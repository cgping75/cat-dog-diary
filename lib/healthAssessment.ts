import { Pet } from './petRepository';

export type HealthStatus = 'too-thin' | 'thin' | 'normal' | 'overweight' | 'obese';

export type HealthResult = {
  status: HealthStatus;
  label: string;
  icon: string;
  color: string;
  suggestion: string;
  currentWeight: number;
  idealMin: number;
  idealMax: number;
};

// 品种理想体重范围(kg)，未列出的品种用默认值
const breedWeightRanges: Record<string, { cat?: [number, number]; dog?: [number, number] }> = {
  // 猫咪品种
  '英短': { cat: [3.5, 5.5] },
  '英国短毛猫': { cat: [3.5, 5.5] },
  '美短': { cat: [3.5, 5.5] },
  '美国短毛猫': { cat: [3.5, 5.5] },
  '布偶': { cat: [4.5, 9] },
  '布偶猫': { cat: [4.5, 9] },
  '波斯': { cat: [3.5, 5.5] },
  '波斯猫': { cat: [3.5, 5.5] },
  '暹罗': { cat: [2.5, 4.5] },
  '暹罗猫': { cat: [2.5, 4.5] },
  '加菲': { cat: [3, 5.5] },
  '异国短毛猫': { cat: [3, 5.5] },
  '缅因': { cat: [5, 11] },
  '缅因猫': { cat: [5, 11] },
  '苏格兰折耳猫': { cat: [3, 5.5] },
  '折耳': { cat: [3, 5.5] },
  '蓝猫': { cat: [3.5, 5.5] },
  '橘猫': { cat: [4, 7] },
  '狸花猫': { cat: [3.5, 5.5] },
  '中华田园猫': { cat: [3.5, 5.5] },

  // 狗狗品种
  '金毛': { dog: [25, 34] },
  '金毛寻回犬': { dog: [25, 34] },
  '拉布拉多': { dog: [25, 36] },
  '拉布拉多寻回犬': { dog: [25, 36] },
  '哈士奇': { dog: [16, 27] },
  '阿拉斯加': { dog: [34, 50] },
  '萨摩耶': { dog: [20, 30] },
  '边牧': { dog: [14, 20] },
  '边境牧羊犬': { dog: [14, 20] },
  '德牧': { dog: [22, 40] },
  '德国牧羊犬': { dog: [22, 40] },
  '泰迪': { dog: [3, 6] },
  '贵宾': { dog: [3, 6] },
  '博美': { dog: [1.5, 3.5] },
  '比熊': { dog: [3, 5] },
  '柯基': { dog: [10, 14] },
  '威尔士柯基': { dog: [10, 14] },
  '法斗': { dog: [8, 13] },
  '法国斗牛犬': { dog: [8, 13] },
  '英斗': { dog: [20, 25] },
  '英国斗牛犬': { dog: [20, 25] },
  '吉娃娃': { dog: [1.5, 3] },
  '约克夏': { dog: [2, 3.5] },
  '约克夏梗': { dog: [2, 3.5] },
  '柴犬': { dog: [8, 11] },
  '秋田': { dog: [25, 40] },
  '中华田园犬': { dog: [10, 25] },
  '土狗': { dog: [10, 25] },
};

// 按宠物类型和体型分类的默认体重范围
const defaultWeightRanges: Record<string, [number, number]> = {
  'cat-small': [2.5, 4],
  'cat-medium': [3.5, 5.5],
  'cat-large': [4.5, 8],
  'dog-toy': [1, 5],
  'dog-small': [5, 10],
  'dog-medium': [10, 25],
  'dog-large': [25, 40],
  'dog-giant': [40, 70],
};

function getIdealRange(pet: Pet): [number, number] | null {
  const weight = parseWeight(pet.weight);
  if (weight === null) return null;

  // 优先按品种匹配
  if (pet.breed) {
    for (const [key, ranges] of Object.entries(breedWeightRanges)) {
      if (pet.breed.includes(key)) {
        const range = pet.pet_type === 'cat' ? ranges.cat : ranges.dog;
        if (range) return range;
      }
    }
  }

  // 按宠物类型+体重推断体型
  if (pet.pet_type === 'cat') {
    if (weight < 3) return defaultWeightRanges['cat-small'];
    if (weight < 5.5) return defaultWeightRanges['cat-medium'];
    return defaultWeightRanges['cat-large'];
  } else {
    if (weight < 5) return defaultWeightRanges['dog-toy'];
    if (weight < 10) return defaultWeightRanges['dog-small'];
    if (weight < 25) return defaultWeightRanges['dog-medium'];
    if (weight < 40) return defaultWeightRanges['dog-large'];
    return defaultWeightRanges['dog-giant'];
  }
}

function parseWeight(weightText: string): number | null {
  if (!weightText) return null;
  const match = weightText.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export function assessHealth(pet: Pet): HealthResult | null {
  const weight = parseWeight(pet.weight);
  if (weight === null || weight <= 0) return null;

  const ideal = getIdealRange(pet);
  if (!ideal) return null;

  const [min, max] = ideal;
  const midpoint = (min + max) / 2;
  const deviation = (weight - midpoint) / midpoint;

  let status: HealthStatus;
  let label: string;
  let icon: string;
  let color: string;
  let suggestion: string;

  if (deviation < -0.25) {
    status = 'too-thin';
    label = '太瘦';
    icon = 'alert-circle';
    color = '#EF5350';
    suggestion = '体重严重偏低，建议尽快就医检查，增加高蛋白食物摄入';
  } else if (deviation < -0.1) {
    status = 'thin';
    label = '偏瘦';
    icon = 'arrow-down-circle';
    color = '#FF9800';
    suggestion = '体重略低于理想范围，可适当增加喂食量，选择高营养食谱';
  } else if (deviation <= 0.1) {
    status = 'normal';
    label = '正常';
    icon = 'check-circle';
    color = '#66BB6A';
    suggestion = '体重在理想范围内，请继续保持当前饮食和运动习惯';
  } else if (deviation <= 0.25) {
    status = 'overweight';
    label = '偏胖';
    icon = 'arrow-up-circle';
    color = '#FF9800';
    suggestion = '体重略高于理想范围，建议控制食量，增加运动量';
  } else {
    status = 'obese';
    label = '太胖';
    icon = 'alert-circle';
    color = '#EF5350';
    suggestion = '体重严重超标，建议就医制定减肥计划，严格控制饮食';
  }

  return {
    status,
    label,
    icon,
    color,
    suggestion,
    currentWeight: weight,
    idealMin: min,
    idealMax: max,
  };
}
