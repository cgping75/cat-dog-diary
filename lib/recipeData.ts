import { Pet } from './petRepository';
import { parseAgeMonths } from './lifeStage';

export type Recipe = {
  id: string;
  name: string;
  icon: string;
  petType: 'cat' | 'dog' | 'both';
  lifeStage: string;
  description: string;
  ingredients: string[];
  nutrition: {
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
    notes: string;
  };
  suitableFor: {
    ageRange?: [number, number];
    weightRange?: [number, number];
    breedKeywords?: string[];
  };
};

const recipes: Recipe[] = [
  // ==================== 猫咪食谱 ====================
  // 新生期 (0-2周)
  {
    id: 'cat-newborn-milk', name: '猫咪代乳', icon: 'baby-bottle-outline', petType: 'cat', lifeStage: 'newborn',
    description: '模拟母乳营养，无母猫时使用',
    ingredients: ['猫用奶粉 10g', '温水 30ml'],
    nutrition: { calories: '约20kcal', protein: '2g', fat: '1g', carbs: '0.5g', notes: '每2-3小时喂一次，温度保持38°C左右' },
    suitableFor: { ageRange: [0, 0.5] },
  },
  {
    id: 'cat-newborn-recovery', name: '新生猫营养液', icon: 'heart-pulse', petType: 'cat', lifeStage: 'newborn',
    description: '补充体力，适合体弱新生猫',
    ingredients: ['猫用奶粉 8g', '葡萄糖 1g', '温水 25ml'],
    nutrition: { calories: '约18kcal', protein: '1.5g', fat: '0.8g', carbs: '1.5g', notes: '体弱小猫专用，用注射器缓慢喂食' },
    suitableFor: { ageRange: [0, 0.5] },
  },
  // 哺乳期 (2-4周)
  {
    id: 'cat-nursing-supplement', name: '哺乳期营养糊', icon: 'food-apple-outline', petType: 'cat', lifeStage: 'nursing',
    description: '配合母乳补充营养',
    ingredients: ['猫用奶粉 12g', '幼猫罐头 15g', '温水 10ml'],
    nutrition: { calories: '约35kcal', protein: '4g', fat: '1.5g', carbs: '1g', notes: '开始尝试舔食，配合母乳喂养' },
    suitableFor: { ageRange: [0.5, 1] },
  },
  {
    id: 'cat-nursing-energy', name: '哺乳期能量汤', icon: 'bowl-mix', petType: 'cat', lifeStage: 'nursing',
    description: '流质好吸收，补充能量',
    ingredients: ['鸡胸肉 20g', '鸡汤（无盐）30ml', '猫用奶粉 5g'],
    nutrition: { calories: '约30kcal', protein: '4g', fat: '1g', carbs: '0.5g', notes: '鸡肉打成泥，混合鸡汤温热喂食' },
    suitableFor: { ageRange: [0.5, 1] },
  },
  // 离乳期 (4-8周)
  {
    id: 'cat-weaning-paste', name: '离乳期肉泥', icon: 'food-drumstick', petType: 'cat', lifeStage: 'weaning',
    description: '软烂好舔，过渡固体食物',
    ingredients: ['鸡胸肉 30g', '南瓜泥 10g', '温水 15ml', '羊奶粉 5g'],
    nutrition: { calories: '约50kcal', protein: '8g', fat: '1.5g', carbs: '1g', notes: '打成细腻泥状，每日4-5次' },
    suitableFor: { ageRange: [1, 2] },
  },
  {
    id: 'cat-weaning-fish', name: '离乳期鱼肉糊', icon: 'fish', petType: 'cat', lifeStage: 'weaning',
    description: '鱼肉细腻，富含DHA',
    ingredients: ['白肉鱼 25g', '胡萝卜泥 10g', '鱼油 1ml', '温水 10ml'],
    nutrition: { calories: '约45kcal', protein: '7g', fat: '2g', carbs: '0.5g', notes: '鱼肉去刺蒸熟打泥，适合离乳过渡' },
    suitableFor: { ageRange: [1, 2] },
  },
  // 幼猫期 (2-6个月)
  {
    id: 'cat-kitten-chicken', name: '幼猫鸡肉泥', icon: 'food-drumstick', petType: 'cat', lifeStage: 'kitten',
    description: '高蛋白易消化，适合幼猫成长',
    ingredients: ['鸡胸肉 50g', '鸡肝 10g', '温水 20ml', '羊奶粉 5g'],
    nutrition: { calories: '约75kcal', protein: '14g', fat: '2g', carbs: '0.5g', notes: '幼猫每日建议喂食3-4次，每次约30-40g' },
    suitableFor: { ageRange: [2, 6] },
  },
  {
    id: 'cat-kitten-egg', name: '幼猫蛋黄拌饭', icon: 'egg-outline', petType: 'cat', lifeStage: 'kitten',
    description: '卵磷脂促进大脑发育',
    ingredients: ['蛋黄 1个', '幼猫粮 20g', '鸡胸肉泥 20g'],
    nutrition: { calories: '约90kcal', protein: '12g', fat: '5g', carbs: '2g', notes: '蛋黄煮熟碾碎拌入，每周2-3次' },
    suitableFor: { ageRange: [2, 6] },
  },
  {
    id: 'cat-kitten-liver', name: '幼猫鸡肝补铁餐', icon: 'food-steak', petType: 'cat', lifeStage: 'kitten',
    description: '富含铁和维A，预防贫血',
    ingredients: ['鸡肝 30g', '鸡胸肉 20g', '南瓜泥 10g'],
    nutrition: { calories: '约70kcal', protein: '13g', fat: '2g', carbs: '1g', notes: '肝脏不宜过多，每周1-2次即可' },
    suitableFor: { ageRange: [2, 6] },
  },
  // 青少年期 (6-12个月)
  {
    id: 'cat-teen-salmon', name: '青少年猫三文鱼餐', icon: 'fish', petType: 'cat', lifeStage: 'teen',
    description: 'Omega-3促进骨骼和毛发发育',
    ingredients: ['三文鱼 50g', '西兰花泥 15g', '橄榄油 2ml'],
    nutrition: { calories: '约100kcal', protein: '15g', fat: '4g', carbs: '1g', notes: '三文鱼蒸熟去刺，每周2-3次' },
    suitableFor: { ageRange: [6, 12] },
  },
  {
    id: 'cat-teen-beef', name: '青少年猫牛肉餐', icon: 'food-steak', petType: 'cat', lifeStage: 'teen',
    description: '高蛋白支撑快速发育',
    ingredients: ['牛肉 50g', '胡萝卜泥 15g', '鱼油 2ml', '猫草粉 1g'],
    nutrition: { calories: '约110kcal', protein: '16g', fat: '5g', carbs: '1g', notes: '牛肉切小块煮熟，控制体重增长速度' },
    suitableFor: { ageRange: [6, 12] },
  },
  // 青年成猫期 (1-3岁)
  {
    id: 'cat-young-adult-salmon', name: '成猫三文鱼餐', icon: 'fish', petType: 'cat', lifeStage: 'young-adult',
    description: '富含Omega-3，毛发亮泽',
    ingredients: ['三文鱼 60g', '南瓜泥 15g', '橄榄油 2ml', '猫草粉 1g'],
    nutrition: { calories: '约110kcal', protein: '16g', fat: '5g', carbs: '1g', notes: '每周建议喂食2-3次，可搭配主粮使用' },
    suitableFor: { ageRange: [12, 36] },
  },
  {
    id: 'cat-young-adult-chicken', name: '成猫鸡肉南瓜餐', icon: 'food-drumstick', petType: 'cat', lifeStage: 'young-adult',
    description: '低脂高蛋白，维持体态',
    ingredients: ['鸡胸肉 60g', '南瓜泥 20g', '橄榄油 2ml'],
    nutrition: { calories: '约95kcal', protein: '15g', fat: '3g', carbs: '2g', notes: '适合活动量大的青年猫，每日1次' },
    suitableFor: { ageRange: [12, 36] },
  },
  {
    id: 'cat-young-adult-tuna', name: '成猫金枪鱼拌', icon: 'fish', petType: 'cat', lifeStage: 'young-adult',
    description: '适口性好，补充水分',
    ingredients: ['金枪鱼 50g', '鸡汤（无盐）30ml', '胡萝卜丁 10g'],
    nutrition: { calories: '约100kcal', protein: '16g', fat: '3g', carbs: '1g', notes: '金枪鱼含汞，不宜频繁喂食' },
    suitableFor: { ageRange: [12, 36] },
  },
  // 成年期 (3-7岁)
  {
    id: 'cat-adult-beef', name: '成猫牛肉拌饭', icon: 'food-steak', petType: 'cat', lifeStage: 'adult',
    description: '补铁补锌，增强体质',
    ingredients: ['牛肉 50g', '米饭 20g', '胡萝卜泥 10g', '鱼油 2ml'],
    nutrition: { calories: '约130kcal', protein: '15g', fat: '6g', carbs: '5g', notes: '适合偏瘦猫咪增重，每日1次搭配主粮' },
    suitableFor: { ageRange: [36, 84] },
  },
  {
    id: 'cat-adult-chicken-veg', name: '成猫鸡肉蔬菜拌', icon: 'food-drumstick', petType: 'cat', lifeStage: 'adult',
    description: '均衡营养，适合日常',
    ingredients: ['鸡胸肉 55g', '西兰花泥 15g', '南瓜泥 10g', '鱼油 2ml'],
    nutrition: { calories: '约100kcal', protein: '14g', fat: '4g', carbs: '2g', notes: '蔬菜打碎拌入肉中，增加膳食纤维' },
    suitableFor: { ageRange: [36, 84] },
  },
  {
    id: 'cat-adult-turkey', name: '成猫火鸡肉餐', icon: 'food-drumstick', petType: 'cat', lifeStage: 'adult',
    description: '低脂高蛋白，控制体重',
    ingredients: ['火鸡肉 55g', '红薯泥 15g', '橄榄油 2ml'],
    nutrition: { calories: '约95kcal', protein: '15g', fat: '3g', carbs: '3g', notes: '火鸡脂肪含量低，适合体重管理' },
    suitableFor: { ageRange: [36, 84] },
  },
  // 熟龄期 (7-10岁)
  {
    id: 'cat-mature-fish', name: '熟龄猫鱼肉餐', icon: 'fish', petType: 'cat', lifeStage: 'mature',
    description: '易消化低脂，减轻代谢负担',
    ingredients: ['鳕鱼 50g', '南瓜泥 20g', '关节营养粉 2g', '鱼油 3ml'],
    nutrition: { calories: '约80kcal', protein: '12g', fat: '3g', carbs: '2g', notes: '增加关节营养补充，关注肾脏健康' },
    suitableFor: { ageRange: [84, 120] },
  },
  {
    id: 'cat-mature-chicken-soup', name: '熟龄猫鸡汤餐', icon: 'bowl-mix', petType: 'cat', lifeStage: 'mature',
    description: '补充水分，呵护肾脏',
    ingredients: ['鸡胸肉 45g', '鸡汤（无盐）50ml', '南瓜泥 15g'],
    nutrition: { calories: '约70kcal', protein: '11g', fat: '2g', carbs: '2g', notes: '增加水分摄入对肾脏有益' },
    suitableFor: { ageRange: [84, 120] },
  },
  {
    id: 'cat-mature-rabbit', name: '熟龄猫兔肉餐', icon: 'food-variant', petType: 'cat', lifeStage: 'mature',
    description: '低敏低脂，肠胃友好',
    ingredients: ['兔肉 50g', '胡萝卜泥 15g', '鱼油 2ml', '益生菌 1包'],
    nutrition: { calories: '约75kcal', protein: '13g', fat: '2.5g', carbs: '1g', notes: '兔肉为低敏蛋白，适合肠胃敏感猫' },
    suitableFor: { ageRange: [84, 120] },
  },
  // 老年期 (10-15岁)
  {
    id: 'cat-senior-chicken-soup', name: '老年猫鸡汤流食', icon: 'bowl-mix', petType: 'cat', lifeStage: 'senior',
    description: '易咀嚼易吸收，补充水分',
    ingredients: ['鸡胸肉 40g', '鸡汤（无盐）60ml', '南瓜泥 15g', '关节营养粉 2g'],
    nutrition: { calories: '约65kcal', protein: '10g', fat: '2g', carbs: '2g', notes: '适合牙齿不好的老猫，可温热后喂食' },
    suitableFor: { ageRange: [120, 180] },
  },
  {
    id: 'cat-senior-fish-porridge', name: '老年猫鱼肉粥', icon: 'fish', petType: 'cat', lifeStage: 'senior',
    description: '软烂好吞咽，营养温和',
    ingredients: ['白肉鱼 40g', '大米粥 30ml', '鱼油 3ml', '牛磺酸 0.5g'],
    nutrition: { calories: '约60kcal', protein: '9g', fat: '2.5g', carbs: '2g', notes: '补充牛磺酸对老年猫心脏有益' },
    suitableFor: { ageRange: [120, 180] },
  },
  {
    id: 'cat-senior-liver-pate', name: '老年猫肝泥慕斯', icon: 'food-steak', petType: 'cat', lifeStage: 'senior',
    description: '口感细腻，刺激食欲',
    ingredients: ['鸡肝 25g', '鸡胸肉 25g', '鸡汤（无盐）30ml', '鱼油 2ml'],
    nutrition: { calories: '约55kcal', protein: '10g', fat: '2g', carbs: '0.5g', notes: '食欲差时可用，肝泥香味刺激进食' },
    suitableFor: { ageRange: [120, 180] },
  },
  // 高龄期 (15岁以上)
  {
    id: 'cat-geriatric-comfort', name: '高龄猫舒适糊', icon: 'heart-outline', petType: 'cat', lifeStage: 'geriatric',
    description: '超细腻口感，轻松进食',
    ingredients: ['鸡胸肉 35g', '鸡汤（无盐）50ml', '南瓜泥 10g', '关节营养粉 2g', '鱼油 2ml'],
    nutrition: { calories: '约50kcal', protein: '8g', fat: '2g', carbs: '1g', notes: '所有食材打成细腻糊状，温热喂食' },
    suitableFor: { ageRange: [180, 360] },
  },
  {
    id: 'cat-geriatric-hydration', name: '高龄猫补水餐', icon: 'water', petType: 'cat', lifeStage: 'geriatric',
    description: '高水分含量，预防脱水',
    ingredients: ['鳕鱼 30g', '鸡汤（无盐）70ml', '南瓜泥 10g', '电解质粉少许'],
    nutrition: { calories: '约40kcal', protein: '7g', fat: '1g', carbs: '1g', notes: '高龄猫容易脱水，此餐水分含量高' },
    suitableFor: { ageRange: [180, 360] },
  },

  // ==================== 狗狗食谱 ====================
  // 新生期 (0-2周)
  {
    id: 'dog-newborn-milk', name: '犬用代乳', icon: 'baby-bottle-outline', petType: 'dog', lifeStage: 'newborn',
    description: '无母犬时的人工喂养方案',
    ingredients: ['犬用奶粉 15g', '温水 40ml'],
    nutrition: { calories: '约30kcal', protein: '3g', fat: '1.5g', carbs: '1g', notes: '每2-3小时喂一次，保持38°C' },
    suitableFor: { ageRange: [0, 0.5] },
  },
  {
    id: 'dog-newborn-boost', name: '新生犬营养液', icon: 'heart-pulse', petType: 'dog', lifeStage: 'newborn',
    description: '补充体力，适合弱小仔犬',
    ingredients: ['犬用奶粉 12g', '蜂蜜 2g', '温水 35ml'],
    nutrition: { calories: '约25kcal', protein: '2.5g', fat: '1g', carbs: '2g', notes: '体弱仔犬专用，用奶瓶缓慢喂食' },
    suitableFor: { ageRange: [0, 0.5] },
  },
  // 哺乳期 (2-4周)
  {
    id: 'dog-nursing-supplement', name: '哺乳期营养糊', icon: 'food-apple-outline', petType: 'dog', lifeStage: 'nursing',
    description: '配合母乳的营养补充',
    ingredients: ['犬用奶粉 15g', '幼犬罐头 20g', '温水 15ml'],
    nutrition: { calories: '约50kcal', protein: '5g', fat: '2g', carbs: '2g', notes: '开始尝试舔食，配合母乳' },
    suitableFor: { ageRange: [0.5, 1] },
  },
  {
    id: 'dog-nursing-chicken', name: '哺乳期鸡肉汤', icon: 'bowl-mix', petType: 'dog', lifeStage: 'nursing',
    description: '流质好吸收，刺激食欲',
    ingredients: ['鸡胸肉 25g', '鸡汤（无盐）40ml', '犬用奶粉 8g'],
    nutrition: { calories: '约40kcal', protein: '5g', fat: '1.5g', carbs: '1g', notes: '鸡肉打成泥，混合温热喂食' },
    suitableFor: { ageRange: [0.5, 1] },
  },
  // 离乳期 (4-8周)
  {
    id: 'dog-weaning-porridge', name: '离乳期鸡肉粥', icon: 'food-drumstick', petType: 'dog', lifeStage: 'weaning',
    description: '软烂好消化，过渡固体食物',
    ingredients: ['鸡胸肉 35g', '大米粥 30g', '胡萝卜泥 10g'],
    nutrition: { calories: '约70kcal', protein: '10g', fat: '2g', carbs: '5g', notes: '粥要煮烂，肉要切碎，每日4-5次' },
    suitableFor: { ageRange: [1, 2] },
  },
  {
    id: 'dog-weaning-egg', name: '离乳期蛋黄米糊', icon: 'egg-outline', petType: 'dog', lifeStage: 'weaning',
    description: '卵磷脂促进神经发育',
    ingredients: ['蛋黄 1个', '大米粥 25g', '犬用奶粉 5g'],
    nutrition: { calories: '约60kcal', protein: '6g', fat: '3g', carbs: '4g', notes: '蛋黄碾碎拌入粥中，适合离乳过渡' },
    suitableFor: { ageRange: [1, 2] },
  },
  // 幼犬期 (2-6个月)
  {
    id: 'dog-puppy-chicken', name: '幼犬鸡肉粥', icon: 'food-drumstick', petType: 'dog', lifeStage: 'puppy',
    description: '软烂易消化，幼犬发育必备',
    ingredients: ['鸡胸肉 60g', '大米 30g', '胡萝卜丁 15g', '钙粉 2g'],
    nutrition: { calories: '约150kcal', protein: '18g', fat: '4g', carbs: '10g', notes: '幼犬每日3-4次，逐渐增加份量' },
    suitableFor: { ageRange: [2, 6] },
  },
  {
    id: 'dog-puppy-beef', name: '幼犬牛肉拌饭', icon: 'food-steak', petType: 'dog', lifeStage: 'puppy',
    description: '高铁高锌，支持快速生长',
    ingredients: ['牛肉 50g', '糙米饭 25g', '西兰花泥 10g', '钙粉 2g'],
    nutrition: { calories: '约140kcal', protein: '17g', fat: '5g', carbs: '8g', notes: '牛肉切小丁煮软，补充钙质' },
    suitableFor: { ageRange: [2, 6] },
  },
  {
    id: 'dog-puppy-fish', name: '幼犬鱼肉餐', icon: 'fish', petType: 'dog', lifeStage: 'puppy',
    description: 'DHA促进大脑和视力发育',
    ingredients: ['三文鱼 45g', '南瓜泥 15g', '米饭 20g', '鱼油 2ml'],
    nutrition: { calories: '约130kcal', protein: '15g', fat: '6g', carbs: '5g', notes: '三文鱼蒸熟去刺，每周2-3次' },
    suitableFor: { ageRange: [2, 6] },
  },
  // 青少年期 (6-12个月)
  {
    id: 'dog-teen-beef', name: '青少年犬牛肉餐', icon: 'food-steak', petType: 'dog', lifeStage: 'teen',
    description: '高蛋白支撑骨骼肌肉发育',
    ingredients: ['牛肉 70g', '红薯 30g', '西兰花 15g', '橄榄油 3ml'],
    nutrition: { calories: '约190kcal', protein: '20g', fat: '8g', carbs: '10g', notes: '运动量大时可增加份量' },
    suitableFor: { ageRange: [6, 12] },
  },
  {
    id: 'dog-teen-chicken', name: '青少年犬鸡肉拌', icon: 'food-drumstick', petType: 'dog', lifeStage: 'teen',
    description: '均衡营养，控制生长速度',
    ingredients: ['鸡胸肉 65g', '糙米饭 35g', '胡萝卜丁 15g', '蛋黄 1个'],
    nutrition: { calories: '约180kcal', protein: '19g', fat: '6g', carbs: '12g', notes: '大型犬注意控制生长速度，避免关节问题' },
    suitableFor: { ageRange: [6, 12] },
  },
  // 青年犬期 (1-3岁)
  {
    id: 'dog-young-adult-beef', name: '成犬牛肉蔬菜拌', icon: 'food-steak', petType: 'dog', lifeStage: 'young-adult',
    description: '均衡营养，活力满满',
    ingredients: ['牛肉 80g', '西兰花 20g', '红薯 30g', '橄榄油 3ml'],
    nutrition: { calories: '约220kcal', protein: '22g', fat: '9g', carbs: '12g', notes: '适合中大型犬，每日1-2次搭配狗粮' },
    suitableFor: { ageRange: [12, 36] },
  },
  {
    id: 'dog-young-adult-chicken', name: '成犬鸡肉拌饭', icon: 'rice', petType: 'dog', lifeStage: 'young-adult',
    description: '经典配方，肠胃友好',
    ingredients: ['鸡胸肉 70g', '糙米饭 40g', '胡萝卜丁 15g', '蛋黄 1个'],
    nutrition: { calories: '约200kcal', protein: '20g', fat: '7g', carbs: '14g', notes: '适合肠胃敏感的狗狗，食材需煮熟' },
    suitableFor: { ageRange: [12, 36] },
  },
  {
    id: 'dog-young-adult-turkey', name: '成犬火鸡餐', icon: 'food-drumstick', petType: 'dog', lifeStage: 'young-adult',
    description: '低脂高蛋白，维持理想体态',
    ingredients: ['火鸡肉 75g', '南瓜泥 20g', '糙米饭 25g', '橄榄油 2ml'],
    nutrition: { calories: '约180kcal', protein: '21g', fat: '5g', carbs: '10g', notes: '火鸡脂肪含量低，适合体重管理' },
    suitableFor: { ageRange: [12, 36] },
  },
  // 成年期 (3-7岁)
  {
    id: 'dog-adult-lamb', name: '成犬羊肉饭', icon: 'food-steak', petType: 'dog', lifeStage: 'adult',
    description: '温补营养，适合冬季',
    ingredients: ['羊肉 70g', '糙米饭 30g', '胡萝卜丁 15g', '橄榄油 2ml'],
    nutrition: { calories: '约210kcal', protein: '20g', fat: '10g', carbs: '10g', notes: '羊肉性温，适合体质偏寒的狗狗' },
    suitableFor: { ageRange: [36, 84] },
  },
  {
    id: 'dog-adult-fish', name: '成犬鱼肉蔬菜餐', icon: 'fish', petType: 'dog', lifeStage: 'adult',
    description: 'Omega-3丰富，毛发亮泽',
    ingredients: ['鳕鱼 70g', '西兰花 20g', '红薯 25g', '鱼油 3ml'],
    nutrition: { calories: '约180kcal', protein: '19g', fat: '7g', carbs: '8g', notes: '适合皮肤敏感的狗狗，每周2-3次' },
    suitableFor: { ageRange: [36, 84] },
  },
  {
    id: 'dog-adult-chicken-veg', name: '成犬鸡肉蔬菜拌', icon: 'food-drumstick', petType: 'dog', lifeStage: 'adult',
    description: '日常均衡餐，适合大多数犬种',
    ingredients: ['鸡胸肉 65g', '南瓜泥 20g', '糙米饭 25g', '橄榄油 2ml'],
    nutrition: { calories: '约190kcal', protein: '19g', fat: '6g', carbs: '12g', notes: '经典日常配方，营养均衡' },
    suitableFor: { ageRange: [36, 84] },
  },
  // 熟龄期 (7-10岁)
  {
    id: 'dog-mature-fish', name: '熟龄犬鱼肉餐', icon: 'fish', petType: 'dog', lifeStage: 'mature',
    description: '低脂高蛋白，关节养护',
    ingredients: ['鳕鱼 65g', '南瓜泥 20g', '红薯 20g', '关节营养粉 3g'],
    nutrition: { calories: '约140kcal', protein: '17g', fat: '3g', carbs: '10g', notes: '增加关节营养，减轻关节负担' },
    suitableFor: { ageRange: [84, 120] },
  },
  {
    id: 'dog-mature-chicken-soup', name: '熟龄犬鸡汤餐', icon: 'bowl-mix', petType: 'dog', lifeStage: 'mature',
    description: '补充水分，呵护肾脏',
    ingredients: ['鸡胸肉 55g', '鸡汤（无盐）50ml', '南瓜泥 15g', '关节营养粉 2g'],
    nutrition: { calories: '约120kcal', protein: '15g', fat: '3g', carbs: '4g', notes: '增加水分摄入，对肾脏有益' },
    suitableFor: { ageRange: [84, 120] },
  },
  {
    id: 'dog-mature-rabbit', name: '熟龄犬兔肉餐', icon: 'food-variant', petType: 'dog', lifeStage: 'mature',
    description: '低敏低脂，肠胃友好',
    ingredients: ['兔肉 60g', '胡萝卜泥 15g', '糙米饭 20g', '益生菌 1包'],
    nutrition: { calories: '约130kcal', protein: '16g', fat: '3.5g', carbs: '7g', notes: '兔肉为低敏蛋白，适合肠胃敏感犬' },
    suitableFor: { ageRange: [84, 120] },
  },
  // 老年期 (10-15岁)
  {
    id: 'dog-senior-fish', name: '老年犬鱼肉餐', icon: 'fish', petType: 'dog', lifeStage: 'senior',
    description: '低脂高蛋白，关节养护',
    ingredients: ['鳕鱼 70g', '南瓜泥 20g', '红薯 25g', '关节营养粉 3g'],
    nutrition: { calories: '约140kcal', protein: '18g', fat: '3g', carbs: '10g', notes: '适合8岁以上老犬，低脂减轻身体负担' },
    suitableFor: { ageRange: [120, 180] },
  },
  {
    id: 'dog-senior-chicken-porridge', name: '老年犬鸡肉粥', icon: 'food-drumstick', petType: 'dog', lifeStage: 'senior',
    description: '软烂好消化，温暖舒适',
    ingredients: ['鸡胸肉 50g', '大米粥 40ml', '南瓜泥 15g', '关节营养粉 2g'],
    nutrition: { calories: '约110kcal', protein: '14g', fat: '3g', carbs: '6g', notes: '粥要煮烂，适合牙齿不好的老犬' },
    suitableFor: { ageRange: [120, 180] },
  },
  {
    id: 'dog-senior-liver', name: '老年犬肝泥餐', icon: 'food-steak', petType: 'dog', lifeStage: 'senior',
    description: '口感细腻，刺激食欲',
    ingredients: ['鸡肝 30g', '鸡胸肉 30g', '鸡汤（无盐）30ml', '鱼油 2ml'],
    nutrition: { calories: '约95kcal', protein: '14g', fat: '3g', carbs: '1g', notes: '食欲差时可用，肝泥香味促进进食' },
    suitableFor: { ageRange: [120, 180] },
  },
  // 高龄期 (15岁以上)
  {
    id: 'dog-geriatric-comfort', name: '高龄犬舒适糊', icon: 'heart-outline', petType: 'dog', lifeStage: 'geriatric',
    description: '超细腻口感，轻松进食',
    ingredients: ['鸡胸肉 45g', '鸡汤（无盐）60ml', '南瓜泥 15g', '关节营养粉 2g'],
    nutrition: { calories: '约70kcal', protein: '10g', fat: '2g', carbs: '2g', notes: '所有食材打成细腻糊状，温热喂食' },
    suitableFor: { ageRange: [180, 360] },
  },
  {
    id: 'dog-geriatric-hydration', name: '高龄犬补水餐', icon: 'water', petType: 'dog', lifeStage: 'geriatric',
    description: '高水分，预防脱水',
    ingredients: ['鳕鱼 40g', '鸡汤（无盐）70ml', '南瓜泥 10g', '电解质粉少许'],
    nutrition: { calories: '约55kcal', protein: '9g', fat: '1.5g', carbs: '1g', notes: '高龄犬容易脱水，此餐水分含量高' },
    suitableFor: { ageRange: [180, 360] },
  },

  // ==================== 通用/品种特色 ====================
  {
    id: 'cat-persian-hairball', name: '波斯猫化毛餐', icon: 'leaf', petType: 'cat', lifeStage: 'young-adult',
    description: '粗纤维助排毛球，呵护肠胃',
    ingredients: ['鸡胸肉 40g', '南瓜泥 20g', '猫草粉 3g', '橄榄油 3ml'],
    nutrition: { calories: '约80kcal', protein: '11g', fat: '3.5g', carbs: '2g', notes: '换毛季节每周2-3次，帮助排出毛球' },
    suitableFor: { ageRange: [6, 180], breedKeywords: ['波斯', '英短', '布偶', '加菲', '喜马拉雅'] },
  },
  {
    id: 'dog-golden-hair', name: '金毛美毛餐', icon: 'leaf', petType: 'dog', lifeStage: 'young-adult',
    description: 'Omega-3丰富，毛发顺滑亮泽',
    ingredients: ['三文鱼 80g', '鸡蛋 1个', '西兰花 20g', '亚麻籽油 5ml'],
    nutrition: { calories: '约250kcal', protein: '24g', fat: '15g', carbs: '3g', notes: '换毛期每周2-3次，毛发明显改善' },
    suitableFor: { ageRange: [12, 120], breedKeywords: ['金毛', '拉布拉多', '萨摩耶', '哈士奇', '阿拉斯加', '边牧'] },
  },
  {
    id: 'dog-small-adult', name: '小型犬精致餐', icon: 'food-variant', petType: 'dog', lifeStage: 'young-adult',
    description: '小颗粒易入口，营养密度高',
    ingredients: ['鸡胸肉 40g', '鹌鹑蛋 2个', '南瓜泥 15g', '鱼油 2ml'],
    nutrition: { calories: '约120kcal', protein: '14g', fat: '6g', carbs: '3g', notes: '适合小型犬（5kg以下），控制份量避免肥胖' },
    suitableFor: { ageRange: [12, 120], weightRange: [1, 8], breedKeywords: ['泰迪', '博美', '吉娃娃', '约克夏', '比熊', '柯基'] },
  },
];

function parseWeight(weightText: string): number | null {
  if (!weightText) return null;
  const match = weightText.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function matchScore(recipe: Recipe, pet: Pet): number {
  let score = 0;

  if (recipe.petType === pet.pet_type || recipe.petType === 'both') {
    score += 10;
  } else {
    return -1;
  }

  const ageMonths = parseAgeMonths(pet.age_text);
  const weight = parseWeight(pet.weight);

  // Life stage match (highest priority)
  if (recipe.suitableFor.ageRange && ageMonths !== null) {
    const [min, max] = recipe.suitableFor.ageRange;
    if (ageMonths >= min && ageMonths <= max) {
      score += 6;
    }
  }

  // Weight range match
  if (recipe.suitableFor.weightRange && weight !== null) {
    const [min, max] = recipe.suitableFor.weightRange;
    if (weight >= min && weight <= max) {
      score += 5;
    }
  }

  // Breed keyword match
  if (recipe.suitableFor.breedKeywords && pet.breed) {
    const breedLower = pet.breed.toLowerCase();
    const matched = recipe.suitableFor.breedKeywords.some((kw) =>
      breedLower.includes(kw.toLowerCase())
    );
    if (matched) score += 8;
  }

  return score;
}

export function getRecommendedRecipes(pet: Pet | null): Recipe[] {
  if (!pet) return [];

  const scored = recipes
    .map((r) => ({ recipe: r, score: matchScore(r, pet) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.recipe);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}
