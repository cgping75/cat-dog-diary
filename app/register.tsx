import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthProvider';
import { colors, borderRadius, spacing } from '@/lib/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少6位');
      return;
    }
    if (password !== confirm) {
      Alert.alert('提示', '两次密码不一致');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('注册失败', error);
    } else {
      Alert.alert('注册成功', '请查收邮箱中的验证链接，验证后即可登录', [
        { text: '去登录', onPress: () => router.replace('/login') },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerArea}>
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>注册后可以同步数据和反馈问题</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="邮箱"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="密码（至少6位）"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="确认密码"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.8} disabled={loading}>
            <Text style={styles.registerBtnText}>{loading ? '注册中...' : '注册'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
            <Text style={styles.linkText}>已有账号？<Text style={styles.linkHighlight}>去登录</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 60 },
  backBtn: { marginBottom: spacing.lg },
  headerArea: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text,
  },
  registerBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center', marginTop: spacing.sm,
  },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { textAlign: 'center', fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  linkHighlight: { color: colors.primary, fontWeight: '600' },
});
