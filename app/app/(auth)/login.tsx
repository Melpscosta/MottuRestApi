import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useTheme, 
  Card, 
  Title, 
  Button, 
  TextInput, 
  Text,
  ActivityIndicator 
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { loginSchema } from '@/src/utils/validators';

type LoginForm = {
  username: string;
  password: string;
};

export default function LoginScreen() {
  const theme = useTheme();
  const { login, loginWithoutApi } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('Tentando login com:', data.username);
    setLoading(true);
    setError('');

    try {
      await login(data.username, data.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Erro no onSubmit de login:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const onDemoLogin = async () => {
    console.log('Tentando login demo');
    setDemoLoading(true);
    setError('');

    try {
      await loginWithoutApi();
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Erro no login demo:', err);
      setError(err.message || 'Erro ao fazer login demo');
    } finally {
      setDemoLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    card: {
      padding: 24,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 32,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    button: {
      marginTop: 16,
      paddingVertical: 8,
    },
    error: {
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    linkContainer: {
      marginTop: 24,
      alignItems: 'center',
    },
    linkText: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <Title style={styles.title}>Mottu</Title>
            <Text style={styles.subtitle}>Pátio Digital</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Usuário"
                  mode="outlined"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  error={!!errors.username}
                  style={styles.input}
                />
              )}
            />
            {errors.username && (
              <Text style={styles.error}>{errors.username.message}</Text>
            )}

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Senha"
                  mode="outlined"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.password}
                  style={styles.input}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              style={styles.button}
            >
              {loading ? <ActivityIndicator color={theme.colors.onPrimary} /> : 'Entrar'}
            </Button>

            <Button
              mode="outlined"
              onPress={onDemoLogin}
              disabled={demoLoading || loading}
              style={[styles.button, { marginTop: 8 }]}
            >
              {demoLoading ? <ActivityIndicator color={theme.colors.primary} /> : 'Entrar sem requisição da API'}
            </Button>

            <View style={styles.linkContainer}>
              <Link href="/(auth)/cadastro">
                <Text style={styles.linkText}>
                  Não tem conta? Cadastre-se
                </Text>
              </Link>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}