import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-pet" options={{ title: '添加宠物' }} />
      <Stack.Screen name="add-record" options={{ title: '添加记录' }} />
      <Stack.Screen name="quiz" options={{ title: '养宠知识考核' }} />
      <Stack.Screen name="quiz-result" options={{ title: '考核结果', headerBackVisible: false }} />
    </Stack>
  );
}
