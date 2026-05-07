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

type FieldGuide = {
  titlePlaceholder: string;
  valuePlaceholder: string;
  valueLabel: string;
  guide: string;
};

const fieldGuides: Record<RecordType, FieldGuide> = {
  vaccine: {
    titlePlaceholder: '如：狂犬疫苗、猫三联',
    valuePlaceholder: '如：第2针',
    valueLabel: '针次/批次',
    guide: '记录疫苗名称、接种针次，方便查看下次接种时间',
  },
  deworm: {
    titlePlaceholder: '如：体内驱虫、体外驱虫',
    valuePlaceholder: '如：拜耳1片',
    valueLabel: '用量',
    guide: '记录驱虫药名称和用量，系统会提醒下次驱虫时间',
  },
  weight: {
    titlePlaceholder: '如：月度称重',
    valuePlaceholder: '如：4.5kg',
    valueLabel: '体重 *',
    guide: '记录体重变化趋势，建议每周或每月记录一次',
  },
  issue: {
    titlePlaceholder: '如：呕吐、拉稀、打喷嚏',
    valuePlaceholder: '如：1天2次',
    valueLabel: '频率/程度',
    guide: '记录异常症状，方便就医时向医生描述',
  },
  feeding: {
    titlePlaceholder: '如：更换猫粮、加零食',
    valuePlaceholder: '如：皇家K36 50g',
    valueLabel: '食物/用量',
    guide: '记录饮食变化，观察是否引起过敏或不适',
  },
  checkup: {
    titlePlaceholder: '如：年度体检、血常规',
    valuePlaceholder: '如：结果正常',
    valueLabel: '检查结果',
    guide: '记录体检项目和结果，保存健康档案',
  },
  dental: {
    titlePlaceholder: '如：超声波洁牙',
    valuePlaceholder: '如：轻度牙结石',
    valueLabel: '牙齿状况',
    guide: '记录洁牙情况和牙齿健康状态',
  },
  bath: {
    titlePlaceholder: '如：日常洗澡',
    valuePlaceholder: '如：无异常',
    valueLabel: '皮肤状况',
    guide: '记录洗澡后皮肤状态，是否有红疹或脱毛',
  },
  grooming: {
    titlePlaceholder: '如：全身修剪、修脚毛',
    valuePlaceholder: '如：造型修剪',
    valueLabel: '修剪项目',
    guide: '记录毛发修剪类型和美容情况',
  },
  nail: {
    titlePlaceholder: '如：常规剪指甲',
    valuePlaceholder: '如：正常',
    valueLabel: '指甲状态',
    guide: '记录剪指甲情况，观察是否有劈裂或过长',
  },
  period: {
    titlePlaceholder: '如：生理期第1天',
    valuePlaceholder: '如：量正常',
    valueLabel: '状态',
    guide: '记录母宠生理期状态，注意保暖和卫生',
  },
  heat: {
    titlePlaceholder: '如：发情期第2天',
    valuePlaceholder: '如：食欲下降',
    valueLabel: '行为变化',
    guide: '记录发情期行为变化，注意防止意外配种',
  },
  body_size: {
    titlePlaceholder: '如：围度测量',
    valuePlaceholder: '如：胸围45cm',
    valueLabel: '体围数据',
    guide: '记录胸围、腰围等体围数据，观察体型变化',
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
  }, []);

  const handleSave = () => {
    if (!petId && !isEdit) {
      Alert.alert('错误', '未指定宠物');
      return;
    }
    if (!title.trim()) {
      Alert.alert('提示', '请输入标题');
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
              onPress={() => setRecordType(opt.value)}
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
          <Text style={styles.guideText}>{fieldGuides[recordType].guide}</Text>
        </View>

        <Text style={sharedStyles.label}>日期</Text>
        <Text style={styles.dateText}>{dateStr}</Text>

        <Text style={sharedStyles.label}>标题 *</Text>
        <TextInput
          style={sharedStyles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={fieldGuides[recordType].titlePlaceholder}
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>{fieldGuides[recordType].valueLabel}</Text>
        <TextInput
          style={sharedStyles.input}
          value={valueText}
          onChangeText={setValueText}
          placeholder={fieldGuides[recordType].valuePlaceholder}
          placeholderTextColor={colors.textSecondary}
        />

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
    width: '23%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  guideBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.primaryLight, borderRadius: 12,
    padding: spacing.sm, marginBottom: spacing.md,
  },
  guideText: { fontSize: 12, color: colors.text, lineHeight: 18, flex: 1 },
  dateText: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  textArea: { minHeight: 80 },
});
