export type BreedItem = { name: string; nameCn: string };

export const catBreeds: BreedItem[] = [
  { name: 'British Shorthair', nameCn: '英国短毛猫' },
  { name: 'Scottish Fold', nameCn: '苏格兰折耳猫' },
  { name: 'Ragdoll', nameCn: '布偶猫' },
  { name: 'Siamese', nameCn: '暹罗猫' },
  { name: 'Persian', nameCn: '波斯猫' },
  { name: 'Maine Coon', nameCn: '缅因猫' },
  { name: 'Bengal', nameCn: '豹猫' },
  { name: 'Exotic Shorthair', nameCn: '异国短毛猫' },
  { name: 'Russian Blue', nameCn: '俄罗斯蓝猫' },
  { name: 'Abyssinian', nameCn: '阿比西尼亚猫' },
  { name: 'Munchkin', nameCn: '曼基康矮脚猫' },
  { name: 'Sphynx', nameCn: '斯芬克斯无毛猫' },
  { name: 'American Shorthair', nameCn: '美国短毛猫' },
  { name: 'Norwegian Forest', nameCn: '挪威森林猫' },
  { name: 'Burmese', nameCn: '缅甸猫' },
  { name: 'Oriental Shorthair', nameCn: '东方短毛猫' },
  { name: 'Birman', nameCn: '伯曼猫' },
  { name: 'Devon Rex', nameCn: '德文卷毛猫' },
  { name: 'Turkish Angora', nameCn: '土耳其安哥拉猫' },
  { name: 'Domestic', nameCn: '中华田园猫' },
];

export const dogBreeds: BreedItem[] = [
  { name: 'Golden Retriever', nameCn: '金毛寻回犬' },
  { name: 'Labrador Retriever', nameCn: '拉布拉多' },
  { name: 'Corgi', nameCn: '柯基' },
  { name: 'French Bulldog', nameCn: '法国斗牛犬' },
  { name: 'Poodle', nameCn: '贵宾犬/泰迪' },
  { name: 'Husky', nameCn: '哈士奇' },
  { name: 'Samoyed', nameCn: '萨摩耶' },
  { name: 'Shiba Inu', nameCn: '柴犬' },
  { name: 'Border Collie', nameCn: '边境牧羊犬' },
  { name: 'German Shepherd', nameCn: '德国牧羊犬' },
  { name: 'Pomeranian', nameCn: '博美犬' },
  { name: 'Chihuahua', nameCn: '吉娃娃' },
  { name: 'Maltese', nameCn: '马尔济斯' },
  { name: 'Yorkshire Terrier', nameCn: '约克夏梗' },
  { name: 'Dachshund', nameCn: '腊肠犬' },
  { name: 'Bichon Frise', nameCn: '比熊犬' },
  { name: 'Shih Tzu', nameCn: '西施犬' },
  { name: 'Beagle', nameCn: '比格犬' },
  { name: 'Dalmatian', nameCn: '斑点狗' },
  { name: 'Akita', nameCn: '秋田犬' },
  { name: 'Alaskan Malamute', nameCn: '阿拉斯加犬' },
  { name: 'Chinese Rural', nameCn: '中华田园犬' },
];

export function getBreeds(petType: 'cat' | 'dog' | ''): BreedItem[] {
  if (petType === 'cat') return catBreeds;
  if (petType === 'dog') return dogBreeds;
  return [];
}
