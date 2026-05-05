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
];

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

        <Text style={sharedStyles.label}>日期</Text>
        <Text style={styles.dateText}>{dateStr}</Text>

        <Text style={sharedStyles.label}>标题 *</Text>
        <TextInput
          style={sharedStyles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={recordType === 'weight' ? '如：月度称重' : '如：狂犬疫苗'}
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>数值</Text>
        <TextInput
          style={sharedStyles.input}
          value={valueText}
          onChangeText={setValueText}
          placeholder={recordType === 'weight' ? '如：4.5kg' : '可选'}
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>详细说明</Text>
        <TextInput
          style={[sharedStyles.input, styles.textArea]}
          value={note}
          onChangeText={setNote}
          placeholder="补充说明..."
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
  typeGrid: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  dateText: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  textArea: { minHeight: 80 },
});
