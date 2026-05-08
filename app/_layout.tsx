import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import AuthProvider from '@/components/AuthProvider';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="add-pet" options={{ title: '添加宠物' }} />
      <Stack.Screen name="add-record" options={{ title: '添加记录' }} />
      <Stack.Screen name="quiz" options={{ title: '养宠知识考核' }} />
      <Stack.Screen name="quiz-result" options={{ title: '考核结果', headerBackVisible: false }} />
      <Stack.Screen name="mood-tracker" options={{ title: '情绪追踪' }} />
      <Stack.Screen name="calendar-full" options={{ headerShown: false }} />
      <Stack.Screen name="calendar-settings" options={{ headerShown: false }} />
      <Stack.Screen name="diet-guide" options={{ title: '饮食指南' }} />
      <Stack.Screen name="add-diary" options={{ headerShown: false }} />
      <Stack.Screen name="diary-detail" options={{ headerShown: false }} />
      <Stack.Screen name="record-list" options={{ headerShown: false }} />
      <Stack.Screen name="account-settings" options={{ headerShown: false }} />
    </Stack>
    </AuthProvider>
  );
}
