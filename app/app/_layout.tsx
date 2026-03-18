import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useThemeContext } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/hooks/useAuth';

const queryClient = new QueryClient();

function AppContent() {
  const { isDarkTheme, theme, isLoading: themeLoading } = useThemeContext();
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log('AppContent - isDarkTheme:', isDarkTheme, 'themeLoading:', themeLoading);
  console.log('AppContent - theme colors:', theme.colors.background);

  useEffect(() => {
    if (!isLoading && !themeLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, themeLoading, router]);

  if (isLoading || themeLoading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
    </PaperProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}