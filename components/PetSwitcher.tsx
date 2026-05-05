import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pet } from '@/lib/petRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';

type PetSwitcherProps = {
  pets: Pet[];
  selectedId: number;
  onSelect: (id: number) => void;
};

export default function PetSwitcher({ pets, selectedId, onSelect }: PetSwitcherProps) {
  if (pets.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {pets.map((pet) => {
        const isSelected = pet.id === selectedId;
        return (
          <TouchableOpacity
            key={pet.id}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect(pet.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
              <MaterialCommunityIcons
                name={pet.pet_type === 'cat' ? 'cat' : 'dog'}
                size={24}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
              {pet.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.6,
  },
  itemSelected: {
    opacity: 1,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconWrapSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  name: {
    fontSize: 12,
    color: colors.textSecondary,
    maxWidth: 60,
    textAlign: 'center',
  },
  nameSelected: {
    color: colors.text,
    fontWeight: '600',
  },
});
