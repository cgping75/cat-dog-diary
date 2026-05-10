import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCityName, setCityName } from '@/lib/interactionData';
import { colors, borderRadius, spacing } from '@/lib/theme';
import Card from '@/components/Card';

export default function CalendarSettingsScreen() {
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');

  const loadData = useCallback(() => {
    getCityName().then((c) => {
      setCity(c);
      setCityInput(c);
    });
  }, []);

  useFocusEffect(loadData);

  const handlePickBg = () => {
    Alert.alert('日历底图', '选择日历背景图片', [
      { text: '从相册选择', onPress: async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
        if (!result.canceled && result.assets[0]) {
          AsyncStorage.setItem('calendar_bg_uri', result.assets[0].uri);
          Alert.alert('成功', '日历底图已更新，返回今日页面查看');
        }
      }},
      { text: '恢复默认白底', style: 'destructive', onPress: () => {
        AsyncStorage.removeItem('calendar_bg_uri');
        Alert.alert('成功', '已恢复默认白底');
      }},
      { text: '取消', style: 'cancel' },
    ]);
  };

  const handleSaveCity = async () => {
    const trimmed = cityInput.trim();
    await setCityName(trimmed);
    setCity(trimmed);
    Alert.alert('成功', trimmed ? `城市已设置为「${trimmed}」` : '已清除城市设置');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>日历设置</Text>
      </View>

      {/* Calendar bg */}
      <Card>
        <Text style={styles.sectionLabel}>日历底图</Text>
        <TouchableOpacity style={styles.bgRow} onPress={handlePickBg} activeOpacity={0.7}>
          <MaterialCommunityIcons name="image-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bgText}>更换日历背景图</Text>
            <Text style={styles.bgHint}>从相册选择图片作为日历窗口底图</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      {/* City setting */}
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionLabel}>所在城市</Text>
        <Text style={styles.bgHint}>设置城市后日历卡片将显示当地天气</Text>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={cityInput}
            onChangeText={setCityInput}
            placeholder="输入城市名，如：上海"
            placeholderTextColor={colors.textSecondary}
            maxLength={20}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleSaveCity}>
            <MaterialCommunityIcons name="check" size={18} color={colors.card} />
          </TouchableOpacity>
        </View>
        {city !== '' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm }}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.text }}>当前：{city}</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  sectionLabel: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: spacing.md },
  bgRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  bgText: { fontSize: 15, fontWeight: '600', color: colors.text },
  bgHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  addInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.text, backgroundColor: colors.background,
  },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});
