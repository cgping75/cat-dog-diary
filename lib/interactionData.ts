import { Pet } from './petRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'cold' | 'hot' | 'windy';

export type InteractionSuggestion = {
  title: string;
  content: string;
  icon: string;
};

const CITY_KEY = 'user_city';

let cachedCity = '';

export async function getCityName(): Promise<string> {
  if (cachedCity) return cachedCity;
  try {
    const stored = await AsyncStorage.getItem(CITY_KEY);
    if (stored) cachedCity = stored;
  } catch {}
  return cachedCity;
}

export async function setCityName(city: string): Promise<void> {
  cachedCity = city;
  await AsyncStorage.setItem(CITY_KEY, city);
}

// Simple weather estimate based on month (no API needed)
export function estimateWeather(): { type: WeatherType; label: string; icon: string; temp: string } {
  const month = new Date().getMonth(); // 0-11
  const hour = new Date().getHours();

  if (month >= 5 && month <= 8) {
    if (hour >= 11 && hour <= 15) return { type: 'hot', label: '炎热', icon: 'weather-sunny', temp: '30°C+' };
    return { type: 'sunny', label: '晴朗', icon: 'weather-sunny', temp: '26°C' };
  }
  if (month >= 11 || month <= 1) {
    return { type: 'cold', label: '寒冷', icon: 'weather-snowy', temp: '5°C' };
  }
  if (month >= 2 && month <= 4) {
    if (hour % 3 === 0) return { type: 'rainy', label: '小雨', icon: 'weather-rainy', temp: '18°C' };
    return { type: 'cloudy', label: '多云', icon: 'weather-cloudy', temp: '20°C' };
  }
  if (hour % 4 === 0) return { type: 'windy', label: '有风', icon: 'weather-windy', temp: '16°C' };
  return { type: 'cloudy', label: '多云', icon: 'weather-cloudy', temp: '18°C' };
}

// Try to fetch real weather for a city (uses geocoding + Open-Meteo, no API key)
let cachedWeather: { type: WeatherType; label: string; icon: string; temp: string; city: string } | null = null;

const weatherCodeToType: Record<number, { type: WeatherType; label: string; icon: string }> = {
  0: { type: 'sunny', label: '晴朗', icon: 'weather-sunny' },
  1: { type: 'sunny', label: '晴', icon: 'weather-sunny' },
  2: { type: 'cloudy', label: '多云', icon: 'weather-cloudy' },
  3: { type: 'cloudy', label: '阴天', icon: 'weather-cloudy' },
  45: { type: 'cloudy', label: '有雾', icon: 'weather-fog' },
  51: { type: 'rainy', label: '小雨', icon: 'weather-rainy' },
  53: { type: 'rainy', label: '小雨', icon: 'weather-rainy' },
  55: { type: 'rainy', label: '大雨', icon: 'weather-pouring' },
  61: { type: 'rainy', label: '阵雨', icon: 'weather-rainy' },
  63: { type: 'rainy', label: '中雨', icon: 'weather-pouring' },
  65: { type: 'rainy', label: '大雨', icon: 'weather-pouring' },
  71: { type: 'cold', label: '小雪', icon: 'weather-snowy' },
  73: { type: 'cold', label: '中雪', icon: 'weather-snowy' },
  75: { type: 'cold', label: '大雪', icon: 'weather-snowy-heavy' },
  80: { type: 'rainy', label: '阵雨', icon: 'weather-rainy' },
  95: { type: 'rainy', label: '雷阵雨', icon: 'weather-lightning-rainy' },
};

export async function fetchWeatherForCity(city: string): Promise<{ type: WeatherType; label: string; icon: string; temp: string; city: string } | null> {
  if (!city) return null;
  if (cachedWeather && cachedWeather.city === city) return cachedWeather;
  try {
    // Step 1: Geocode city name to lat/lon using Open-Meteo geocoding
    const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`);
    const geoData = await geoResp.json();
    if (!geoData.results || geoData.results.length === 0) return null;
    const { latitude, longitude, name } = geoData.results[0];

    // Step 2: Fetch current weather from Open-Meteo
    const weatherResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`);
    const weatherData = await weatherResp.json();
    const current = weatherData.current;
    if (!current) return null;

    const code = current.weather_code as number;
    const mapped = weatherCodeToType[code] || { type: 'cloudy' as WeatherType, label: '未知', icon: 'weather-cloudy' };
    cachedWeather = {
      ...mapped,
      temp: `${Math.round(current.temperature_2m)}°C`,
      city: name,
    };
    return cachedWeather;
  } catch {
    return null;
  }
}

const catSuggestions: Record<WeatherType, InteractionSuggestion[]> = {
  sunny: [
    { title: '阳光浴', content: '打开窗帘让猫咪晒太阳，阳光有助于钙吸收和心情愉悦', icon: 'weather-sunny' },
    { title: '窗边观鸟', content: '在窗边放个猫窝，让它看窗外的小鸟，精神刺激很重要', icon: 'bird' },
  ],
  cloudy: [
    { title: '逗猫棒游戏', content: '用逗猫棒互动15分钟，满足猫咪的狩猎天性', icon: 'toy-brick' },
    { title: '纸箱探险', content: '放一个纸箱在地上，猫咪会开心地钻来钻去', icon: 'package-variant' },
  ],
  rainy: [
    { title: '室内追逐', content: '用激光笔或小球在室内陪猫咪追逐运动', icon: 'laser-pointer' },
    { title: '温柔梳毛', content: '雨天适合在家给猫咪梳毛，促进血液循环', icon: 'hair-dryer' },
  ],
  cold: [
    { title: '温暖陪伴', content: '在暖气旁铺个暖窝，和猫咪一起窝着取暖', icon: 'bed' },
    { title: '加热玩具', content: '把毛绒玩具稍微加热，给猫咪当暖宝宝抱着睡', icon: 'teddy-bear' },
  ],
  hot: [
    { title: '冰块游戏', content: '在水碗里放冰块，既能降温又能当玩具', icon: 'ice-pop' },
    { title: '避开午间', content: '避免中午活动，早晚凉爽时再互动', icon: 'clock-outline' },
  ],
  windy: [
    { title: '窗边看风', content: '安全地让猫咪在窗边感受风的声音和气味', icon: 'weather-windy' },
    { title: '藏食游戏', content: '把零食藏在各处让猫咪寻找，风天适合脑力活动', icon: 'food-variant' },
  ],
};

const dogSuggestions: Record<WeatherType, InteractionSuggestion[]> = {
  sunny: [
    { title: '户外散步', content: '带狗狗出门散步20-30分钟，注意避开滚烫的路面', icon: 'walk' },
    { title: '飞盘游戏', content: '在阴凉处玩飞盘，锻炼身体的同时增进感情', icon: 'disc' },
  ],
  cloudy: [
    { title: '探索散步', content: '多云天最适合遛狗，让狗狗自由嗅闻探索', icon: 'map-search' },
    { title: '服从训练', content: '利用凉爽天气做10分钟服从训练，零食奖励', icon: 'school' },
  ],
  rainy: [
    { title: '雨后散步', content: '雨停后带狗狗出门，它会很兴奋地闻雨后的气味', icon: 'weather-rainy' },
    { title: '室内寻宝', content: '在家藏零食让狗狗找，锻炼嗅觉和脑力', icon: 'food-variant' },
  ],
  cold: [
    { title: '保暖散步', content: '短毛犬穿保暖衣出门，缩短散步时间但保持频率', icon: 'tshirt-crew' },
    { title: '室内拔河', content: '用绳结玩具和狗狗玩拔河，消耗体力', icon: 'rope' },
  ],
  hot: [
    { title: '清晨/傍晚遛', content: '避开11-16点，选择清晨或傍晚凉爽时段出门', icon: 'clock-outline' },
    { title: '游泳降温', content: '有条件的话带狗狗去浅水区玩水降温', icon: 'pool' },
  ],
  windy: [
    { title: '逆风散步', content: '风天遛狗用短牵绳，注意安全，逆风出发顺风回', icon: 'weather-windy' },
    { title: '嗅觉游戏', content: '风天气味丰富，让狗狗在安全区域自由嗅闻', icon: 'nose' },
  ],
};

export function getInteractionSuggestion(pet: Pet | null): InteractionSuggestion {
  const weather = estimateWeather();
  const suggestions = pet?.pet_type === 'cat' ? catSuggestions : dogSuggestions;
  const list = suggestions[weather.type] || suggestions.sunny;
  // Pick based on hour to stay consistent within same hour
  const idx = new Date().getHours() % list.length;
  return list[idx];
}
