import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { petRepository, PetDraft } from '@/lib/petRepository';
import { getBreeds, BreedItem } from '@/lib/breedData';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { sharedStyles } from '@/lib/sharedStyles';
import Card from '@/components/Card';

export default function AddPetScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const editId = params.petId ? Number(params.petId) : null;
  const isEdit = editId !== null;

  const [petType, setPetType] = useState<'cat' | 'dog' | ''>('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown' | ''>('');
  const [ageText, setAgeText] = useState('');
  const [isNeutered, setIsNeutered] = useState<'yes' | 'no' | ''>('');
  const [personality, setPersonality] = useState('');
  const [allergies, setAllergies] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [weight, setWeight] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const breedList = getBreeds(petType);

  useEffect(() => {
    if (isEdit) {
      const pet = petRepository.getById(editId!);
      if (pet) {
        setPetType(pet.pet_type || '');
        setName(pet.name);
        setBreed(pet.breed || '');
        setGender(pet.gender || '');
        setAgeText(pet.age_text || '');
        setIsNeutered(pet.is_neutered || '');
        setPersonality(pet.personality || '');
        setAllergies(pet.allergies || '');
        setSpecialNeeds(pet.special_needs || '');
        setWeight(pet.weight || '');
        setPhotoUri(pet.photo_uri || '');
      }
    }
  }, [isEdit, editId]);

  const takePhoto = async (source: 'camera' | 'library') => {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('提示', '需要相机权限才能拍照');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('提示', '需要相册权限才能选择图片');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('选择照片', '从哪里获取宠物照片？', [
      { text: '拍照', onPress: () => takePhoto('camera') },
      { text: '从相册选择', onPress: () => takePhoto('library') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入宠物名字');
      return;
    }
    if (!petType) {
      Alert.alert('提示', '请选择宠物类型');
      return;
    }

    const draft: PetDraft = {
      name: name.trim(),
      petType,
      breed: breed.trim(),
      gender: gender || 'unknown',
      ageText: ageText.trim(),
      isNeutered: isNeutered || 'no',
      personality: personality.trim(),
      allergies: allergies.trim(),
      specialNeeds: specialNeeds.trim(),
      weight: weight.trim(),
      photoUri: photoUri.trim(),
    };

    if (isEdit) {
      petRepository.update(editId!, draft);
    } else {
      petRepository.save(draft);
    }
    router.back();
  };

  const handleSelectBreed = (b: BreedItem) => {
    setBreed(b.nameCn);
    setShowBreedPicker(false);
  };

  const personalityOptions = [
    '活泼好动', '安静温顺', '胆小敏感', '独立自主',
    '粘人撒娇', '高冷傲娇', '友善亲人', '调皮捣蛋',
  ];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={sharedStyles.sectionLabel}>宠物类型 *</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, petType === 'cat' && styles.typeBtnActive]}
            onPress={() => { setPetType('cat'); setBreed(''); }}
          >
            <MaterialCommunityIcons name="cat" size={32} color={petType === 'cat' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeBtnText, petType === 'cat' && styles.typeBtnTextActive]}>猫咪</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, petType === 'dog' && styles.typeBtnActive]}
            onPress={() => { setPetType('dog'); setBreed(''); }}
          >
            <MaterialCommunityIcons name="dog" size={32} color={petType === 'dog' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeBtnText, petType === 'dog' && styles.typeBtnTextActive]}>狗狗</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 宠物照片 */}
      <Card style={{ marginTop: spacing.md }}>
        <Text style={sharedStyles.sectionLabel}>宠物照片</Text>
        <TouchableOpacity style={styles.photoWrap} activeOpacity={0.8} onPress={handlePickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="camera-plus-outline" size={36} color={colors.textSecondary} />
              <Text style={styles.photoHint}>点击拍照/选图</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoActionBtn} onPress={() => takePhoto('camera')}>
            <MaterialCommunityIcons name="camera" size={20} color={colors.primary} />
            <Text style={styles.photoActionText}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoActionBtn} onPress={() => takePhoto('library')}>
            <MaterialCommunityIcons name="image-multiple" size={20} color={colors.primary} />
            <Text style={styles.photoActionText}>相册</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={sharedStyles.sectionLabel}>基本信息</Text>

        <Text style={sharedStyles.label}>名字 *</Text>
        <TextInput
          style={sharedStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="给它起个名字吧"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>品种</Text>
        {breedList.length > 0 ? (
          <>
            <TouchableOpacity style={styles.breedSelector} onPress={() => setShowBreedPicker(!showBreedPicker)}>
              <Text style={breed ? styles.breedText : styles.breedPlaceholder}>
                {breed || '点击选择品种'}
              </Text>
              <MaterialCommunityIcons name={showBreedPicker ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {showBreedPicker && (
              <View style={styles.breedList}>
                {breedList.map((b) => (
                  <TouchableOpacity
                    key={b.name}
                    style={[styles.breedItem, breed === b.nameCn && styles.breedItemActive]}
                    onPress={() => handleSelectBreed(b)}
                  >
                    <Text style={[styles.breedItemText, breed === b.nameCn && styles.breedItemTextActive]}>
                      {b.nameCn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput
              style={[sharedStyles.input, { marginTop: spacing.xs }]}
              value={breed}
              onChangeText={setBreed}
              placeholder="或手动输入品种"
              placeholderTextColor={colors.textSecondary}
            />
          </>
        ) : (
          <TextInput
            style={sharedStyles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="请先选择宠物类型"
            placeholderTextColor={colors.textSecondary}
          />
        )}

        <Text style={sharedStyles.label}>性别</Text>
        <View style={styles.optionRow}>
          {([
            { value: 'male' as const, label: '公' },
            { value: 'female' as const, label: '母' },
            { value: 'unknown' as const, label: '未知' },
          ]).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionBtn, gender === opt.value && styles.optionBtnActive]}
              onPress={() => setGender(opt.value)}
            >
              <Text style={[styles.optionBtnText, gender === opt.value && styles.optionBtnTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={sharedStyles.label}>年龄</Text>
        <TextInput
          style={sharedStyles.input}
          value={ageText}
          onChangeText={setAgeText}
          placeholder="如：3岁、6个月"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>体重 (kg)</Text>
        <TextInput
          style={sharedStyles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="如：4.5"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
        />

        <Text style={sharedStyles.label}>是否绝育</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionBtn, isNeutered === 'yes' && styles.optionBtnActive]}
            onPress={() => setIsNeutered('yes')}
          >
            <Text style={[styles.optionBtnText, isNeutered === 'yes' && styles.optionBtnTextActive]}>已绝育</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionBtn, isNeutered === 'no' && styles.optionBtnActive]}
            onPress={() => setIsNeutered('no')}
          >
            <Text style={[styles.optionBtnText, isNeutered === 'no' && styles.optionBtnTextActive]}>未绝育</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 性格与特殊信息 */}
      <Card style={{ marginTop: spacing.md }}>
        <Text style={sharedStyles.sectionLabel}>性格与特殊信息</Text>

        <Text style={sharedStyles.label}>性格特点</Text>
        <View style={styles.personalityGrid}>
          {personalityOptions.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.personalityChip, personality === p && styles.personalityChipActive]}
              onPress={() => setPersonality(personality === p ? '' : p)}
            >
              <Text style={[styles.personalityChipText, personality === p && styles.personalityChipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[sharedStyles.input, { marginTop: spacing.xs }]}
          value={personality}
          onChangeText={setPersonality}
          placeholder="或自定义描述性格"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>过敏信息</Text>
        <TextInput
          style={sharedStyles.input}
          value={allergies}
          onChangeText={setAllergies}
          placeholder="如：鸡肉过敏、花粉过敏"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={sharedStyles.label}>特殊需求</Text>
        <TextInput
          style={[sharedStyles.input, { height: 80, textAlignVertical: 'top' }]}
          value={specialNeeds}
          onChangeText={setSpecialNeeds}
          placeholder="如：需要吃处方粮、行动不便等"
          placeholderTextColor={colors.textSecondary}
          multiline
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
  typeRow: { flexDirection: 'row', gap: spacing.md },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  optionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  optionBtnTextActive: { color: colors.primary },
  photoWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  photoHint: { fontSize: 12, color: colors.textSecondary },
  photoActions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.md },
  photoActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.sm },
  photoActionText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  breedSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  breedText: { fontSize: 15, color: colors.text },
  breedPlaceholder: { fontSize: 15, color: colors.textSecondary },
  breedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  breedItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  breedItemActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  breedItemText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  breedItemTextActive: { color: colors.primary },
  personalityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personalityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  personalityChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  personalityChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  personalityChipTextActive: { color: colors.primary },
});
