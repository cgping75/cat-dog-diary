import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, TextInput, Platform, Linking } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/components/AuthProvider';
import { petRepository, Pet } from '@/lib/petRepository';
import { recordRepository } from '@/lib/recordRepository';
import { quizRepository } from '@/lib/quizRepository';
import { colors, borderRadius, spacing } from '@/lib/theme';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';

export default function MineScreen() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasPassed, setHasPassed] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [screenshotUri, setScreenshotUri] = useState('');

  const feedbackTypes = [
    { key: 'bug', label: '闪退/BUG', icon: 'bug-outline' as const },
    { key: 'feature', label: '功能异常', icon: 'alert-circle-outline' as const },
    { key: 'suggest', label: '建议', icon: 'lightbulb-outline' as const },
    { key: 'other', label: '其他', icon: 'chat-outline' as const },
  ];

  const handlePickScreenshot = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('提示', '请填写反馈内容');
      return;
    }
    const typeLabel = feedbackTypes.find((t) => t.key === feedbackType)?.label || feedbackType;
    const subject = `[猫狗日记反馈] ${typeLabel}`;
    const body = `问题类型：${typeLabel}\n\n问题描述：\n${feedbackText.trim()}\n\n---\n设备：${Platform.OS} ${Platform.Version}\n时间：${new Date().toLocaleString()}`;

    const available = await MailComposer.isAvailableAsync();
    if (!available) {
      Alert.alert('提示', '设备未配置邮件客户端，建议使用「问题跟踪」在GitHub上反馈');
      return;
    }

    const mailOptions: MailComposer.MailComposerOptions = {
      recipients: ['3892767120@qq.com'],
      subject,
      body,
    };
    if (screenshotUri) {
      mailOptions.attachments = [screenshotUri];
    }

    await MailComposer.composeAsync(mailOptions);
    setFeedbackText('');
    setScreenshotUri('');
    setShowFeedback(false);
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/cgping75/cat-dog-diary/issues');
  };

  const loadData = useCallback(() => {
    const allPets = petRepository.getAll();
    setPets(allPets);
    let count = 0;
    allPets.forEach((p) => { count += recordRepository.getCountByPetId(p.id); });
    setTotalRecords(count);
    setHasPassed(quizRepository.hasPassed());
  }, []);

  useFocusEffect(loadData);

  const handleDelete = (pet: Pet) => {
    Alert.alert('删除宠物', `确定要删除「${pet.name}」吗？\n该宠物的所有记录也会被删除。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => { petRepository.delete(pet.id); loadData(); } },
    ]);
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <Card style={styles.petCard}>
      <View style={styles.petRow}>
        {item.photo_uri ? (
          <Image source={{ uri: item.photo_uri }} style={styles.petPhoto} />
        ) : (
          <View style={[styles.petIcon, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name={item.pet_type === 'cat' ? 'cat' : 'dog'} size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petMeta}>
            {item.breed || (item.pet_type === 'cat' ? '猫' : '狗')}
            {item.gender === 'male' ? ' · 公' : item.gender === 'female' ? ' · 母' : ''}
            {item.age_text ? ` · ${item.age_text}` : ''}
            {item.weight ? ` · ${item.weight}kg` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/add-pet', params: { petId: String(item.id) } })} style={styles.editBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.petDetails}>
        {item.personality ? <Text style={styles.petDetailText}>性格：{item.personality}</Text> : null}
        {item.allergies ? <Text style={styles.petDetailText}>过敏：{item.allergies}</Text> : null}
        {item.special_needs ? <Text style={styles.petDetailText}>特殊需求：{item.special_needs}</Text> : null}
        <TouchableOpacity
          style={styles.dietBtn}
          onPress={() => router.push({ pathname: '/diet-guide', params: { petType: item.pet_type, petName: item.name } })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="food-apple-outline" size={16} color={colors.primary} />
          <Text style={styles.dietBtnText}>饮食指南</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.headerArea}>
        <Text style={styles.title}>我的</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-pet')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.card} />
          <Text style={styles.addBtnText}>添加宠物</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        data={pets}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPet}
        ListHeaderComponent={
        <>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{pets.length}</Text>
              <Text style={styles.statLabel}>宠物</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{totalRecords}</Text>
              <Text style={styles.statLabel}>记录</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNumber, { color: hasPassed ? colors.success : colors.textSecondary }]}>
                {hasPassed ? '已通过' : '未完成'}
              </Text>
              <Text style={styles.statLabel}>考核</Text>
            </Card>
          </View>

          {/* Account settings */}
          {user && (
            <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/account-settings')} activeOpacity={0.7}>
              <View style={[styles.settingsIcon, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons name="account-circle-outline" size={20} color="#1976D2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsText}>账号设置</Text>
                <Text style={styles.settingsHint}>{user.email}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Record list entry */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/record-list')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: '#FCE4EC' }]}>
              <MaterialCommunityIcons name="notebook-heart" size={20} color="#E91E63" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsText}>查看记录</Text>
              <Text style={styles.settingsHint}>健康记录、疫苗、驱虫等</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Documents entry */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/documents')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="file-certificate" size={20} color="#66BB6A" />
            </View>
            <Text style={styles.settingsText}>证件管理</Text>
            <Text style={styles.settingsHint}>登记证 · 免疫证明 · 其他证件</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Vaccine archive entry */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/vaccine-archive')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="needle" size={20} color="#42A5F5" />
            </View>
            <Text style={styles.settingsText}>疫苗档案</Text>
            <Text style={styles.settingsHint}>接种记录 · 接种时间线 · 下次提醒</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Calendar settings entry */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/calendar-settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: colors.secondaryLight }]}>
              <MaterialCommunityIcons name="calendar-month" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.settingsText}>日历设置</Text>
            <Text style={styles.settingsHint}>更换底图 · 管理打卡项</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Feedback entry - in-app */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => setShowFeedback(!showFeedback)}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="message-alert-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.settingsText}>意见反馈</Text>
            <Text style={styles.settingsHint}>邮件反馈 · 可截图</Text>
            <MaterialCommunityIcons name={showFeedback ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showFeedback && (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={styles.feedbackLabel}>问题类型</Text>
              <View style={styles.feedbackTypeRow}>
                {feedbackTypes.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.feedbackTypeBtn, feedbackType === t.key && styles.feedbackTypeActive]}
                    onPress={() => setFeedbackType(t.key)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name={t.icon} size={16} color={feedbackType === t.key ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.feedbackTypeText, feedbackType === t.key && { color: colors.primary }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.feedbackInput}
                value={feedbackText}
                onChangeText={setFeedbackText}
                placeholder="请描述你遇到的问题或建议..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              {/* Screenshot attachment */}
              <TouchableOpacity style={styles.screenshotBtn} onPress={handlePickScreenshot} activeOpacity={0.7}>
                <MaterialCommunityIcons name="image-plus" size={20} color={colors.primary} />
                <Text style={styles.screenshotBtnText}>
                  {screenshotUri ? '已添加截图（点击更换）' : '添加截图（可选）'}
                </Text>
                {screenshotUri !== '' && (
                  <TouchableOpacity onPress={() => setScreenshotUri('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {screenshotUri !== '' && (
                <Image source={{ uri: screenshotUri }} style={styles.screenshotPreview} resizeMode="cover" />
              )}
              <TouchableOpacity style={styles.feedbackSubmit} onPress={handleSubmitFeedback} activeOpacity={0.8}>
                <Text style={styles.feedbackSubmitText}>发送反馈邮件</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* GitHub Issues entry - view only, no login needed */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleOpenGitHub}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, { backgroundColor: '#F3E5F5' }]}>
              <MaterialCommunityIcons name="github" size={20} color="#333" />
            </View>
            <Text style={styles.settingsText}>问题跟踪</Text>
            <Text style={styles.settingsHint}>查看已知问题和修复进度</Text>
            <MaterialCommunityIcons name="open-in-new" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {pets.length === 0 && (
            <EmptyState icon="paw-outline" title="还没有添加宠物" subtitle="点击上方按钮添加第一只宠物吧" />
          )}
        </>
      }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  headerArea: {
    backgroundColor: colors.background,
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  addBtnText: { color: colors.card, fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  petCard: { marginBottom: spacing.sm },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  petIcon: { width: 48, height: 48, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
  petPhoto: { width: 48, height: 48, borderRadius: borderRadius.full },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '700', color: colors.text },
  petMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  editBtn: { padding: spacing.sm },
  deleteBtn: { padding: spacing.sm },
  petDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  petDetailText: { fontSize: 12, color: colors.textSecondary },
  dietBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  dietBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#FF7EB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  settingsHint: { fontSize: 12, color: colors.textSecondary },
  feedbackLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  feedbackTypeRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  feedbackTypeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: borderRadius.full, backgroundColor: colors.background,
    borderWidth: 1.5, borderColor: colors.border,
  },
  feedbackTypeActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  feedbackTypeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  feedbackInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    padding: spacing.md, fontSize: 14, color: colors.text,
    backgroundColor: colors.background, minHeight: 100, marginBottom: spacing.md,
  },
  feedbackSubmit: {
    backgroundColor: colors.primary, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, alignItems: 'center',
  },
  feedbackSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  screenshotBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: spacing.sm, marginBottom: spacing.sm,
  },
  screenshotBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary, flex: 1 },
  screenshotPreview: {
    width: '100%', height: 160, borderRadius: 12, marginBottom: spacing.md,
  },
});
