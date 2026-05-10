import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { documentRepository, Document, DocType, docTypeLabels } from '@/lib/documentRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';

const docTypes: DocType[] = ['registration', 'immunization', 'other'];

export default function DocumentsScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState(0);
  const [docs, setDocs] = useState<Document[]>([]);

  useFocusEffect(
    useCallback(() => {
      const allPets = petRepository.getAll();
      setPets(allPets);
      if (allPets.length === 0) return;

      const id = petId ? Number(petId) : allPets[0].id;
      const exists = allPets.find((p) => p.id === id);
      const targetId = exists ? id : allPets[0].id;
      setCurrentPetId(targetId);
      setDocs(documentRepository.getByPetId(targetId));
    }, [petId])
  );

  const grouped = docTypes.map((type) => ({
    type,
    ...docTypeLabels[type],
    items: docs.filter((d) => d.doc_type === type),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>证件管理</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/add-document', params: { petId: String(currentPetId) } })}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Pet tabs */}
      {pets.length > 1 && (
        <View style={styles.petTabs}>
          {pets.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.petTab, p.id === currentPetId && styles.petTabActive]}
              onPress={() => {
                setCurrentPetId(p.id);
                setDocs(documentRepository.getByPetId(p.id));
              }}
            >
              <Text style={[styles.petTabText, p.id === currentPetId && styles.petTabTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {docs.length === 0 ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="file-certificate-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>暂无证件</Text>
            <Text style={styles.emptyText}>点击右上角 + 添加宠物证件</Text>
          </View>
        ) : (
          grouped.map((g) =>
            g.items.length > 0 ? (
              <View key={g.type} style={styles.group}>
                <View style={styles.groupHeader}>
                  <MaterialCommunityIcons name={g.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={18} color={g.color} />
                  <Text style={[styles.groupTitle, { color: g.color }]}>{g.label}</Text>
                  <Text style={styles.groupCount}>{g.items.length}</Text>
                </View>
                {g.items.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.docCard}
                    onPress={() => router.push({ pathname: '/add-document', params: { petId: String(currentPetId), docId: String(doc.id) } })}
                    activeOpacity={0.7}
                  >
                    {doc.image_uri ? (
                      <Image source={{ uri: doc.image_uri }} style={styles.docThumb} />
                    ) : (
                      <View style={[styles.docThumb, styles.docThumbPlaceholder]}>
                        <MaterialCommunityIcons name={g.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color={g.color} />
                      </View>
                    )}
                    <View style={styles.docInfo}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      {doc.expiry_date ? (
                        <Text style={styles.docMeta}>有效期至 {doc.expiry_date}</Text>
                      ) : doc.issue_date ? (
                        <Text style={styles.docMeta}>签发 {doc.issue_date}</Text>
                      ) : null}
                      {doc.note ? <Text style={styles.docNote} numberOfLines={1}>{doc.note}</Text> : null}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 48, paddingBottom: 8, paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text, flex: 1 },
  addBtn: { padding: 4 },
  petTabs: {
    flexDirection: 'row', gap: 6, paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  petTab: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
  },
  petTabActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  petTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  petTabTextActive: { color: colors.primary },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  group: { marginBottom: spacing.lg },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  groupTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  groupCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: 18, padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#FF7EB3', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 1,
  },
  docThumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.background },
  docThumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '600', color: colors.text },
  docMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  docNote: { fontSize: 12, color: '#BBBBBB', marginTop: 2 },
});
