import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthProvider';
import { colors, borderRadius, spacing } from '@/lib/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('登录失败', error);
    } else {
      router.replace('/(tabs)/today');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logoArea}>
          <MaterialCommunityIcons name="paw" size={64} color={colors.primary} />
          <Text style={styles.appName}>猫狗日记</Text>
          <Text style={styles.subtitle}>记录宠物的每一天</Text>
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
            placeholder="密码"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
            <Text style={styles.loginBtnText}>{loading ? '登录中...' : '登录'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
            <Text style={styles.linkText}>没有账号？<Text style={styles.linkHighlight}>注册</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  logoArea: { alignItems: 'center', marginBottom: 48 },
  appName: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text,
  },
  loginBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center', marginTop: spacing.sm,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { textAlign: 'center', fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  linkHighlight: { color: colors.primary, fontWeight: '600' },
});
