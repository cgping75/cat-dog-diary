import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { petRepository, Pet } from '@/lib/petRepository';
import { checkinRepository, CheckinItemWithStatus } from '@/lib/checkinRepository';
import { getCityName, setCityName } from '@/lib/interactionData';
import { colors, borderRadius, spacing } from '@/lib/theme';
import Card from '@/components/Card';

export default function CalendarSettingsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState<number>(0);
  const [checkinItems, setCheckinItems] = useState<CheckinItemWithStatus[]>([]);
  const [showAddCheckin, setShowAddCheckin] = useState(false);
  const [newCheckinLabel, setNewCheckinLabel] = useState('');
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);
    if (allPets.length > 0) {
      const exists = allPets.find((p) => p.id === currentPetId);
      const targetId = exists ? currentPetId : allPets[0].id;
      setCurrentPetId(targetId);
      setCheckinItems(checkinRepository.getItemsWithStatus(targetId));
    }
    getCityName().then((c) => {
      setCity(c);
      setCityInput(c);
    });
  }, [currentPetId]);

  useFocusEffect(loadData);

  const handleAddCheckin = () => {
    if (!newCheckinLabel.trim()) return;
    const ok = checkinRepository.addItem(currentPetId, newCheckinLabel.trim());
    if (!ok) {
      Alert.alert('提示', '自定义打卡项最多3个');
      return;
    }
    setNewCheckinLabel('');
    setShowAddCheckin(false);
    setCheckinItems(checkinRepository.getItemsWithStatus(currentPetId));
  };

  const handleRemoveCheckin = (itemId: number, label: string) => {
    Alert.alert('删除打卡项', `确定删除「${label}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        checkinRepository.removeItem(itemId);
        setCheckinItems(checkinRepository.getItemsWithStatus(currentPetId));
      }},
    ]);
  };

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

  const systemItems = checkinItems.filter((i) => i.is_system);
  const customItems = checkinItems.filter((i) => !i.is_system);

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

      {/* Pet selector for checkin items */}
      {pets.length > 1 && (
        <View style={styles.petRow}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petTab, pet.id === currentPetId && styles.petTabActive]}
              onPress={() => setCurrentPetId(pet.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.petTabText, pet.id === currentPetId && styles.petTabTextActive]}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Checkin items management */}
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.sectionLabel}>打卡项目管理</Text>

        <Text style={styles.subLabel}>固定项目（不可删除）</Text>
        {systemItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={20} color={colors.success} />
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.fixedTag}>固定</Text>
          </View>
        ))}

        <Text style={[styles.subLabel, { marginTop: spacing.md }]}>自定义项目（最多3个）</Text>
        {customItems.length === 0 && !showAddCheckin && (
          <Text style={styles.emptyHint}>暂无自定义打卡项</Text>
        )}
        {customItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.itemLabel}>{item.label}</Text>
            <TouchableOpacity onPress={() => handleRemoveCheckin(item.id, item.label)}>
              <MaterialCommunityIcons name="close-circle-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        {showAddCheckin ? (
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newCheckinLabel}
              onChangeText={setNewCheckinLabel}
              placeholder="输入打卡项名称"
              placeholderTextColor={colors.textSecondary}
              maxLength={10}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddCheckin}>
              <MaterialCommunityIcons name="check" size={18} color={colors.card} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAddCheckin(false); setNewCheckinLabel(''); }}>
              <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => setShowAddCheckin(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
            <Text style={styles.addMoreText}>添加自定义打卡项</Text>
          </TouchableOpacity>
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
  subLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  bgRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  bgText: { fontSize: 15, fontWeight: '600', color: colors.text },
  bgHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  petRow: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  petTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.full,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
  },
  petTabActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  petTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  petTabTextActive: { color: colors.primary },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  fixedTag: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  emptyHint: { fontSize: 13, color: colors.textSecondary, paddingVertical: spacing.sm },
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
  cancelBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: spacing.sm, marginTop: spacing.sm,
  },
  addMoreText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
