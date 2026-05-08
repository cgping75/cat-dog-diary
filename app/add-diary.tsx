import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { diaryRepository, DiaryDraft } from '@/lib/diaryRepository';
import { pickImages, uploadImages, deleteImages } from '@/lib/diaryImageUtils';
import { useAuth } from '@/components/AuthProvider';
import { colors, borderRadius, spacing } from '@/lib/theme';

const MAX_IMAGES = 9;
const IMG_SIZE = (Dimensions.get('window').width - spacing.lg * 2 - spacing.sm * 2) / 3;

export default function AddDiaryScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ diaryId?: string }>();
  const editId = params.diaryId ? Number(params.diaryId) : null;
  const isEdit = editId !== null;

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && user) {
      diaryRepository.getById(editId!, user.id).then((diary) => {
        if (diary) {
          setContent(diary.content);
          setImages(diary.images);
          setOriginalImages(diary.images);
        }
      });
    }
  }, [isEdit, editId, user]);

  const handlePickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      Alert.alert('提示', `最多选择 ${MAX_IMAGES} 张图片`);
      return;
    }
    const picked = await pickImages(remaining);
    if (picked.length > 0) {
      setImages([...images, ...picked].slice(0, MAX_IMAGES));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('提示', '请输入日记内容或添加图片');
      return;
    }
    if (!user) {
      Alert.alert('错误', '请先登录');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();

    try {
      const existingSet = new Set(originalImages);
      const newUris = images.filter((uri) => !existingSet.has(uri));
      const uploadedUrls = newUris.length > 0 ? await uploadImages(user.id, newUris) : [];

      const finalImages: string[] = [];
      images.forEach((uri) => {
        if (existingSet.has(uri)) {
          finalImages.push(uri);
        }
      });
      finalImages.push(...uploadedUrls);

      if (isEdit) {
        const removedImages = originalImages.filter((uri) => !images.includes(uri));
        if (removedImages.length > 0) {
          await deleteImages(removedImages);
        }
      }

      const draft: DiaryDraft = {
        content: content.trim(),
        images: finalImages,
      };

      if (isEdit) {
        await diaryRepository.update(editId!, draft);
      } else {
        await diaryRepository.save(user.id, draft);
      }

      router.back();
    } catch {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? '编辑日记' : '写日记'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.saveBtnText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="记录今天和毛孩子的故事..."
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.imageGrid}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
                <TouchableOpacity style={styles.imageRemove} onPress={() => handleRemoveImage(idx)}>
                  <MaterialCommunityIcons name="close-circle" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < MAX_IMAGES && (
              <TouchableOpacity style={styles.imageAdd} onPress={handlePickImages} activeOpacity={0.7}>
                <MaterialCommunityIcons name="plus" size={32} color={colors.textSecondary} />
                <Text style={styles.imageAddText}>{images.length}/{MAX_IMAGES}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  saveBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  body: { flex: 1, padding: spacing.lg },
  textInput: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 150,
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: spacing.lg,
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  imageWrap: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: borderRadius.sm, overflow: 'hidden' },
  imageThumb: { width: '100%', height: '100%' },
  imageRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 11,
  },
  imageAdd: {
    width: IMG_SIZE,
    height: IMG_SIZE,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  imageAddText: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
