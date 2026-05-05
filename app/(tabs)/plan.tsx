import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository, PetRecord } from '@/lib/recordRepository';
import { quizRepository } from '@/lib/quizRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import { daysBetween, formatDate, VACCINE_INTERVAL_DAYS, DEWORM_INTERVAL_DAYS, CHECKUP_INTERVAL_DAYS, DENTAL_INTERVAL_DAYS, BATH_INTERVAL_DAYS, GROOMING_INTERVAL_DAYS, NAIL_INTERVAL_DAYS } from '@/lib/dateUtils';
import Card from '@/components/Card';
import PetSwitcher from '@/components/PetSwitcher';
import EmptyState from '@/components/EmptyState';

export default function PlanScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetId, setCurrentPetId] = useState<number>(0);
  const [hasPassed, setHasPassed] = useState(false);
  const [latestVaccine, setLatestVaccine] = useState<PetRecord | null>(null);
  const [latestDeworm, setLatestDeworm] = useState<PetRecord | null>(null);
  const [latestCheckup, setLatestCheckup] = useState<PetRecord | null>(null);
  const [latestDental, setLatestDental] = useState<PetRecord | null>(null);
  const [latestBath, setLatestBath] = useState<PetRecord | null>(null);
  const [latestGrooming, setLatestGrooming] = useState<PetRecord | null>(null);
  const [latestNail, setLatestNail] = useState<PetRecord | null>(null);

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);
    setHasPassed(quizRepository.hasPassed());

    if (allPets.length > 0) {
      const exists = allPets.find((p) => p.id === currentPetId);
      const targetId = exists ? currentPetId : allPets[0].id;
      setCurrentPetId(targetId);

      const vaccines = recordRepository.getByPetIdAndType(targetId, 'vaccine');
      setLatestVaccine(vaccines.length > 0 ? vaccines[0] : null);

      const deworms = recordRepository.getByPetIdAndType(targetId, 'deworm');
      setLatestDeworm(deworms.length > 0 ? deworms[0] : null);

      const checkups = recordRepository.getByPetIdAndType(targetId, 'checkup');
      setLatestCheckup(checkups.length > 0 ? checkups[0] : null);

      const dentals = recordRepository.getByPetIdAndType(targetId, 'dental');
      setLatestDental(dentals.length > 0 ? dentals[0] : null);

      const baths = recordRepository.getByPetIdAndType(targetId, 'bath');
      setLatestBath(baths.length > 0 ? baths[0] : null);

      const groomings = recordRepository.getByPetIdAndType(targetId, 'grooming');
      setLatestGrooming(groomings.length > 0 ? groomings[0] : null);

      const nails = recordRepository.getByPetIdAndType(targetId, 'nail');
      setLatestNail(nails.length > 0 ? nails[0] : null);
    } else {
      setCurrentPetId(0);
      setLatestVaccine(null);
      setLatestDeworm(null);
      setLatestCheckup(null);
      setLatestDental(null);
      setLatestBath(null);
      setLatestGrooming(null);
      setLatestNail(null);
    }
  }, [currentPetId]);

  useFocusEffect(loadData);

  const now = new Date();
  const vaccineDays = latestVaccine ? daysBetween(new Date(latestVaccine.recorded_at), now) : null;
  const dewormDays = latestDeworm ? daysBetween(new Date(latestDeworm.recorded_at), now) : null;
  const checkupDays = latestCheckup ? daysBetween(new Date(latestCheckup.recorded_at), now) : null;
  const dentalDays = latestDental ? daysBetween(new Date(latestDental.recorded_at), now) : null;
  const bathDays = latestBath ? daysBetween(new Date(latestBath.recorded_at), now) : null;
  const groomingDays = latestGrooming ? daysBetween(new Date(latestGrooming.recorded_at), now) : null;
  const nailDays = latestNail ? daysBetween(new Date(latestNail.recorded_at), now) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PetSwitcher pets={pets} selectedId={currentPetId} onSelect={setCurrentPetId} />

      <Card style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <View style={styles.quizIconWrap}>
            <MaterialCommunityIcons name="school" size={32} color={hasPassed ? colors.success : colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quizTitle}>养宠知识考核</Text>
            <Text style={styles.quizSub}>
              {hasPassed ? '已通过' : '测试你的养宠知识'}
            </Text>
          </View>
          {hasPassed && (
            <MaterialCommunityIcons name="check-circle" size={28} color={colors.success} />
          )}
        </View>
        <TouchableOpacity
          style={[styles.quizBtn, hasPassed && styles.quizBtnOutline]}
          onPress={() => router.push('/quiz')}
          activeOpacity={0.8}
        >
          <Text style={[styles.quizBtnText, hasPassed && styles.quizBtnTextOutline]}>
            {hasPassed ? '重新考核' : '开始考核'}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={hasPassed ? colors.primary : colors.card}
          />
        </TouchableOpacity>
      </Card>

      {currentPetId > 0 && (
        <>
          <Text style={styles.sectionTitle}>健康计划提醒</Text>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="needle" size={22} color={colors.vaccine} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>疫苗</Text>
                {latestVaccine ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestVaccine.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: vaccineDays! > VACCINE_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {vaccineDays! > VACCINE_INTERVAL_DAYS
                        ? `已过 ${vaccineDays} 天，建议补打`
                        : `${VACCINE_INTERVAL_DAYS - vaccineDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无疫苗记录</Text>
                )}
              </View>
            </View>
          </Card>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="pill" size={22} color={colors.deworm} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>驱虫</Text>
                {latestDeworm ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestDeworm.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: dewormDays! > DEWORM_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {dewormDays! > DEWORM_INTERVAL_DAYS
                        ? `已过 ${dewormDays} 天，建议驱虫`
                        : `${DEWORM_INTERVAL_DAYS - dewormDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无驱虫记录</Text>
                )}
              </View>
            </View>
          </Card>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="stethoscope" size={22} color={colors.checkup} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>体检</Text>
                {latestCheckup ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestCheckup.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: checkupDays! > CHECKUP_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {checkupDays! > CHECKUP_INTERVAL_DAYS
                        ? `已过 ${checkupDays} 天，建议体检`
                        : `${CHECKUP_INTERVAL_DAYS - checkupDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无体检记录</Text>
                )}
              </View>
            </View>
          </Card>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="tooth-outline" size={22} color={colors.dental} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>洁牙</Text>
                {latestDental ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestDental.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: dentalDays! > DENTAL_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {dentalDays! > DENTAL_INTERVAL_DAYS
                        ? `已过 ${dentalDays} 天，建议洁牙`
                        : `${DENTAL_INTERVAL_DAYS - dentalDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无洁牙记录</Text>
                )}
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>卫生周期提醒</Text>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="shower-head" size={22} color={colors.bath} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>洗澡</Text>
                {latestBath ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestBath.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: bathDays! > BATH_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {bathDays! > BATH_INTERVAL_DAYS
                        ? `已过 ${bathDays} 天，建议洗澡`
                        : `${BATH_INTERVAL_DAYS - bathDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无洗澡记录</Text>
                )}
              </View>
            </View>
          </Card>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="content-cut" size={22} color={colors.grooming} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>毛发修剪</Text>
                {latestGrooming ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestGrooming.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: groomingDays! > GROOMING_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {groomingDays! > GROOMING_INTERVAL_DAYS
                        ? `已过 ${groomingDays} 天，建议修剪`
                        : `${GROOMING_INTERVAL_DAYS - groomingDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无毛发修剪记录</Text>
                )}
              </View>
            </View>
          </Card>

          <Card style={styles.planCard}>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="hand-back-right-outline" size={22} color={colors.nail} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planLabel}>剪指甲</Text>
                {latestNail ? (
                  <>
                    <Text style={styles.planDetail}>上次：{formatDate(latestNail.recorded_at)}</Text>
                    <Text style={[styles.planStatus, { color: nailDays! > NAIL_INTERVAL_DAYS ? colors.error : colors.success }]}>
                      {nailDays! > NAIL_INTERVAL_DAYS
                        ? `已过 ${nailDays} 天，建议剪指甲`
                        : `${NAIL_INTERVAL_DAYS - nailDays!} 天后到期`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planHint}>暂无剪指甲记录</Text>
                )}
              </View>
            </View>
          </Card>
        </>
      )}

      {pets.length === 0 && (
        <EmptyState icon="calendar-blank" title="暂无计划" subtitle="添加宠物后可查看健康计划提醒" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  quizCard: { marginTop: spacing.sm, backgroundColor: colors.card },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  quizIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  quizSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  quizBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  quizBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  quizBtnText: { color: colors.card, fontSize: 15, fontWeight: '700' },
  quizBtnTextOutline: { color: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  planCard: { marginBottom: spacing.sm },
  planRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  planLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  planDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  planStatus: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  planHint: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
