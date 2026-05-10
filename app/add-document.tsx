import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { documentRepository, DocumentDraft, DocType, docTypeLabels } from '@/lib/documentRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';

const typeOptions: { value: DocType; label: string; icon: string; color: string }[] = [
  { value: 'registration', ...docTypeLabels.registration },
  { value: 'immunization', ...docTypeLabels.immunization },
  { value: 'other', ...docTypeLabels.other },
];

export default function AddDocumentScreen() {
  const params = useLocalSearchParams<{ petId: string; docId?: string }>();
  const petId = Number(params.petId);
  const editId = params.docId ? Number(params.docId) : null;
  const isEdit = editId !== null;

  const [docType, setDocType] = useState<DocType>('registration');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (isEdit) {
      const doc = documentRepository.getById(editId!);
      if (doc) {
        setDocType(doc.doc_type);
        setName(doc.name);
        setNote(doc.note || '');
        setImageUri(doc.image_uri || '');
        setIssueDate(doc.issue_date || '');
        setExpiryDate(doc.expiry_date || '');
      }
    }
  }, [isEdit, editId]);

  const typeColor = docTypeLabels[docType].color;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请选择证件名称');
      return;
    }
    const draft: DocumentDraft = {
      doc_type: docType,
      name: name.trim(),
      note: note.trim(),
      image_uri: imageUri,
      issue_date: issueDate.trim(),
      expiry_date: expiryDate.trim(),
    };
    if (isEdit) {
      documentRepository.update(editId!, draft);
    } else {
      documentRepository.save(draft, petId);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('删除证件', '确定要删除这个证件吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive',
        onPress: () => {
          documentRepository.delete(editId!);
          router.back();
        },
      },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type selector */}
        <Text style={styles.label}>证件类型</Text>
        <View style={styles.typeRow}>
          {typeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.typeBtn,
                docType === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '15' },
              ]}
              onPress={() => setDocType(opt.value)}
            >
              <MaterialCommunityIcons
                name={opt.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={22}
                color={docType === opt.value ? opt.color : colors.textSecondary}
              />
              <Text style={[styles.typeBtnText, docType === opt.value && { color: opt.color }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text style={styles.label}>证件名称 *</Text>
        <View style={styles.nameChipRow}>
          {['养犬登记证', '狂犬免疫证', '免疫证明', '芯片登记证', '绝育证明', '保险单', '其他'].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.nameChip, name === n && { backgroundColor: typeColor + '18', borderColor: typeColor }]}
              onPress={() => setName(name === n ? '' : n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.nameChipText, name === n && { color: typeColor, fontWeight: '700' }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>签发日期</Text>
            <TextInput
              style={styles.input}
              value={issueDate}
              onChangeText={setIssueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>有效期至</Text>
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Image */}
        <Text style={styles.label}>证件照片</Text>
        <TouchableOpacity style={styles.imageBtn} onPress={handlePickImage} activeOpacity={0.7}>
          {imageUri ? (
            <Text style={styles.imageBtnText}>已选择图片 ✓</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.imageBtnText}>拍照或从相册选择</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Note */}
        <Text style={styles.label}>备注</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={note}
          onChangeText={setNote}
          placeholder="补充说明（可选）..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <MaterialCommunityIcons name="check" size={20} color={colors.card} />
          <Text style={styles.saveBtnText}>{isEdit ? '保存修改' : '添加证件'}</Text>
        </TouchableOpacity>

        {/* Delete */}
        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
            <Text style={styles.deleteBtnText}>删除证件</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text,
  },
  textArea: { minHeight: 80 },
  dateRow: { flexDirection: 'row', gap: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card,
  },
  typeBtnText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  nameChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  nameChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card,
  },
  nameChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  imageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingVertical: spacing.lg,
  },
  imageBtnText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, marginTop: spacing.xl,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: colors.card, fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: spacing.md, marginTop: spacing.md,
  },
  deleteBtnText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});
