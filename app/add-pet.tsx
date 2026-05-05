import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, PetDraft } from '@/lib/petRepository';
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
      }
    }
  }, []);

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
    };

    if (isEdit) {
      petRepository.update(editId!, draft);
    } else {
      petRepository.save(draft);
    }
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={sharedStyles.sectionLabel}>宠物类型 *</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, petType === 'cat' && styles.typeBtnActive]}
            onPress={() => setPetType('cat')}
          >
            <MaterialCommunityIcons name="cat" size={32} color={petType === 'cat' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeBtnText, petType === 'cat' && styles.typeBtnTextActive]}>猫咪</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, petType === 'dog' && styles.typeBtnActive]}
            onPress={() => setPetType('dog')}
          >
            <MaterialCommunityIcons name="dog" size={32} color={petType === 'dog' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.typeBtnText, petType === 'dog' && styles.typeBtnTextActive]}>狗狗</Text>
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
        <TextInput
          style={sharedStyles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="如：英短、柯基"
          placeholderTextColor={colors.textSecondary}
        />

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
});
