import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recordRepository, RecordType, RecordDraft } from '@/lib/recordRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { sharedStyles } from '@/lib/sharedStyles';
import Card from '@/components/Card';

const typeOptions: { value: RecordType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
  { value: 'vaccine', label: '疫苗', icon: 'needle', color: colors.vaccine },
  { value: 'deworm', label: '驱虫', icon: 'pill', color: colors.deworm },
  { value: 'weight', label: '体重', icon: 'scale-bathroom', color: colors.weight },
  { value: 'issue', label: '问题', icon: 'alert-circle-outline', color: colors.issue },
  { value: 'feeding', label: '喂食', icon: 'food-outline', color: colors.feeding },
  { value: 'checkup', label: '体检', icon: 'stethoscope', color: colors.checkup },
  { value: 'dental', label: '洁牙', icon: 'tooth-outline', color: colors.dental },
  { value: 'bath', label: '洗澡', icon: 'shower-head', color: colors.bath },
  { value: 'grooming', label: '毛发修剪', icon: 'content-cut', color: colors.grooming },
  { value: 'nail', label: '剪指甲', icon: 'hand-back-right-outline', color: colors.nail },
  { value: 'period', label: '经期', icon: 'water', color: colors.period },
  { value: 'heat', label: '发情期', icon: 'heart-pulse', color: colors.heat },
  { value: 'body_size', label: '体型', icon: 'human', color: colors.bodySize },
];

type RecordPreset = {
  guide: string;
  titleLabel: string;
  titleOptions: string[];
  valueLabel: string;
  valueOptions: string[];
  valueInputMode?: 'number'; // 体重用数字输入
};

const recordPresets: Record<RecordType, RecordPreset> = {
  vaccine: {
    guide: '记录疫苗名称、接种针次，方便查看下次接种时间',
    titleLabel: '疫苗名称', titleOptions: ['狂犬疫苗', '猫三联', '犬四联', '犬六联', '犬八联', '猫五联', '其他'],
    valueLabel: '接种针次', valueOptions: ['第1针', '第2针', '第3针', '加强针', '年度接种'],
  },
  deworm: {
    guide: '记录驱虫药名称和用量，系统会提醒下次驱虫时间',
    titleLabel: '驱虫类型', titleOptions: ['体内驱虫', '体外驱虫', '内外同驱'],
    valueLabel: '驱虫药品', valueOptions: ['拜耳', '大宠爱', '博来恩', '福来恩', '海乐妙', '其他'],
  },
  weight: {
    guide: '记录体重变化趋势，建议每周或每月记录一次',
    titleLabel: '称重场景', titleOptions: ['月度称重', '季度称重', '随机记录'],
    valueLabel: '体重（kg）', valueOptions: [], valueInputMode: 'number',
  },
  issue: {
    guide: '记录异常症状，方便就医时向医生描述',
    titleLabel: '症状类型', titleOptions: ['呕吐', '拉稀', '打喷嚏', '咳嗽', '皮肤问题', '食欲下降', '精神萎靡', '眼部分泌物', '耳部问题', '跛行', '其他'],
    valueLabel: '严重程度', valueOptions: ['轻微', '中等', '严重', '已就医', '已好转'],
  },
  feeding: {
    guide: '记录饮食变化，观察是否引起过敏或不适',
    titleLabel: '喂食类型', titleOptions: ['更换主粮', '加零食', '新食物尝试', '食量调整', '补充营养品'],
    valueLabel: '进食状态', valueOptions: ['正常进食', '食欲好', '食欲差', '拒食'],
  },
  checkup: {
    guide: '记录体检项目和结果，保存健康档案',
    titleLabel: '体检项目', titleOptions: ['年度体检', '血常规', '尿检', '便检', 'X光', 'B超', '心脏检查', '其他'],
    valueLabel: '检查结果', valueOptions: ['结果正常', '有异常需复查', '已复查正常'],
  },
  dental: {
    guide: '记录洁牙情况和牙齿健康状态',
    titleLabel: '洁牙类型', titleOptions: ['日常刷牙', '超声波洁牙', '牙齿检查', '拔牙'],
    valueLabel: '牙齿状况', valueOptions: ['正常', '轻度牙结石', '中度牙结石', '重度牙结石', '牙龈红肿'],
  },
  bath: {
    guide: '记录洗澡后皮肤状态，是否有红疹或脱毛',
    titleLabel: '洗澡类型', titleOptions: ['日常洗澡', '药浴', '局部清洁'],
    valueLabel: '皮肤状况', valueOptions: ['无异常', '皮肤干燥', '有红疹', '脱毛', '有跳蚤'],
  },
  grooming: {
    guide: '记录毛发修剪类型和美容情况',
    titleLabel: '修剪类型', titleOptions: ['全身修剪', '修脚毛', '修脸毛', '剃毛', '梳毛'],
    valueLabel: '毛发状况', valueOptions: ['正常', '打结', '脱毛严重'],
  },
  nail: {
    guide: '记录剪指甲情况，观察是否有劈裂或过长',
    titleLabel: '操作类型', titleOptions: ['常规剪指甲', '磨甲'],
    valueLabel: '指甲状态', valueOptions: ['正常', '过长', '劈裂', '已处理'],
  },
  period: {
    guide: '记录母宠生理期状态，注意保暖和卫生',
    titleLabel: '生理期阶段', titleOptions: ['生理期开始', '生理期中', '生理期结束'],
    valueLabel: '状态', valueOptions: ['量少', '量正常', '量多', '食欲下降', '精神萎靡'],
  },
  heat: {
    guide: '记录发情期行为变化，注意防止意外配种',
    titleLabel: '发情阶段', titleOptions: ['发情期开始', '发情期中', '发情期结束'],
    valueLabel: '行为变化', valueOptions: ['食欲下降', '频繁叫唤', '躁动不安', '标记行为', '正常'],
  },
  body_size: {
    guide: '记录胸围、腰围等体围数据，观察体型变化',
    titleLabel: '记录类型', titleOptions: ['围度测量', '体型评估'],
    valueLabel: '体型判断', valueOptions: ['太瘦', '偏瘦', '正常', '偏胖', '太胖'],
  },
};

export default function AddRecordScreen() {
  const params = useLocalSearchParams<{ petId: string; recordType?: string; recordId?: string }>();
  const petId = Number(params.petId);
  const editId = params.recordId ? Number(params.recordId) : null;
  const isEdit = editId !== null;

  const [recordType, setRecordType] = useState<RecordType>((params.recordType as RecordType) || 'vaccine');
  const [title, setTitle] = useState('');
  const [valueText, setValueText] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isEdit) {
      const record = recordRepository.getById(editId!);
      if (record) {
        setRecordType(record.record_type);
        setTitle(record.title);
        setValueText(record.value_text || '');
        setNote(record.note || '');
      }
    }
  }, [isEdit, editId]);

  // 切换类型时重置标题和值
  const handleTypeChange = (type: RecordType) => {
    if (type !== recordType) {
      setRecordType(type);
      setTitle('');
      setValueText('');
    }
  };

  const handleSave = () => {
    if (!petId && !isEdit) {
      Alert.alert('错误', '未指定宠物');
      return;
    }
    if (!title.trim()) {
      Alert.alert('提示', '请选择标题');
      return;
    }

    const draft: RecordDraft = {
      record_type: recordType,
      title: title.trim(),
      note: note.trim(),
      value_text: valueText.trim(),
    };

    if (isEdit) {
      recordRepository.update(editId!, draft);
    } else {
      recordRepository.save(draft, petId);
    }
    router.back();
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const preset = recordPresets[recordType];
  const typeColor = typeOptions.find((o) => o.value === recordType)?.color || colors.primary;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={sharedStyles.sectionLabel}>记录类型</Text>
        <View style={styles.typeGrid}>
          {typeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.typeBtn, recordType === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '15' }]}
              onPress={() => handleTypeChange(opt.value)}
            >
              <MaterialCommunityIcons name={opt.icon} size={24} color={recordType === opt.value ? opt.color : colors.textSecondary} />
              <Text style={[styles.typeBtnText, recordType === opt.value && { color: opt.color }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={sharedStyles.sectionLabel}>记录详情</Text>
        <View style={styles.guideBox}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary} />
          <Text style={styles.guideText}>{preset.guide}</Text>
        </View>

        <Text style={sharedStyles.label}>日期</Text>
        <Text style={styles.dateText}>{dateStr}</Text>

        {/* Title selector */}
        <Text style={sharedStyles.label}>{preset.titleLabel}</Text>
        <View style={styles.chipRow}>
          {preset.titleOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, title === opt && { backgroundColor: typeColor + '18', borderColor: typeColor }]}
              onPress={() => setTitle(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, title === opt && { color: typeColor, fontWeight: '700' }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Value selector */}
        <Text style={sharedStyles.label}>{preset.valueLabel}</Text>
        {preset.valueInputMode === 'number' ? (
          <View style={styles.numberRow}>
            <TextInput
              style={[styles.numberInput]}
              value={valueText}
              onChangeText={(t) => setValueText(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unitText}>kg</Text>
          </View>
        ) : (
          <View style={styles.chipRow}>
            {preset.valueOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, valueText === opt && { backgroundColor: typeColor + '18', borderColor: typeColor }]}
                onPress={() => setValueText(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, valueText === opt && { color: typeColor, fontWeight: '700' }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Note */}
        <Text style={sharedStyles.label}>备注</Text>
        <TextInput
          style={[sharedStyles.input, styles.textArea]}
          value={note}
          onChangeText={setNote}
          placeholder="补充说明（可选）..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Card>

      <TouchableOpacity style={sharedStyles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <MaterialCommunityIcons name="check" size={20} color={colors.card} />
        <Text style={sharedStyles.saveBtnText}>保存</Text>
      </TouchableOpacity>
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeBtn: {
    width: '23%', alignItems: 'center', gap: 4, paddingVertical: spacing.md,
    marginBottom: spacing.sm, borderRadius: borderRadius.md,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
  },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  guideBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.primaryLight, borderRadius: 12,
    padding: spacing.sm, marginBottom: spacing.md,
  },
  guideText: { fontSize: 12, color: colors.text, lineHeight: 18, flex: 1 },
  dateText: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  numberRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md,
  },
  numberInput: {
    flex: 1, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center',
  },
  unitText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  textArea: { minHeight: 80 },
});
