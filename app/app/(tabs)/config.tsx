import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useTheme, 
  Card, 
  Title, 
  Paragraph,
  List, 
  Switch, 
  Button,
  TextInput,
  Chip
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/hooks/useAuth';
import { DEFAULT_BLE_CONFIG } from '@/src/utils/constants';
import { getStoredBleConfig, setStoredBleConfig } from '@/src/utils/bleConfigStorage';

export default function ConfigScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const { logout, user } = useAuth();
  
  const [bleConfig, setBleConfig] = useState(DEFAULT_BLE_CONFIG);

  useEffect(() => {
    getStoredBleConfig().then(setBleConfig);
  }, []);

  const handleSaveBLEConfig = async () => {
    await setStoredBleConfig(bleConfig);
  };

  const handleToggleTheme = () => toggleTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (_) {}
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      color: theme.colors.onBackground,
      fontSize: 24,
      fontWeight: 'bold',
    },
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    input: {
      marginBottom: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    logoutButton: {
      backgroundColor: theme.colors.error,
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Ajustes</Title>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Aparência</Title>
            <List.Item
              title="Tema Escuro"
              description="Alterar entre tema claro e escuro"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkTheme}
                  onValueChange={handleToggleTheme}
                  thumbColor={isDarkTheme ? theme.colors.primary : theme.colors.outline}
                  trackColor={{ 
                    false: theme.colors.surfaceVariant, 
                    true: theme.colors.primaryContainer 
                  }}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Simulação BLE (avançado)</Title>
            <Paragraph style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Parâmetros da simulação de beacons no mapa. Apenas para demonstração.
            </Paragraph>
            
            <TextInput
              label="TX Power (dBm)"
              value={String(bleConfig.txPower)}
              onChangeText={(text) => setBleConfig(prev => ({
                ...prev,
                txPower: parseInt(text) || -59
              }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Path Loss (n)"
              value={String(bleConfig.pathLoss)}
              onChangeText={(text) => setBleConfig(prev => ({
                ...prev,
                pathLoss: parseFloat(text) || 2.2
              }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Sigma (σ)"
              value={String(bleConfig.sigma)}
              onChangeText={(text) => setBleConfig(prev => ({
                ...prev,
                sigma: parseFloat(text) || 2
              }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Range Máximo (m)"
              value={String(bleConfig.rangeMax)}
              onChangeText={(text) => setBleConfig(prev => ({
                ...prev,
                rangeMax: parseInt(text) || 20
              }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Tick (ms)"
              value={String(bleConfig.tickMs)}
              onChangeText={(text) => setBleConfig(prev => ({
                ...prev,
                tickMs: parseInt(text, 10) || 4000
              }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Alpha (EMA)"
              value={String(bleConfig.alpha)}
              onChangeText={(text) => setBleConfig(prev => ({
                ...prev,
                alpha: parseFloat(text) || 0.25
              }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <Button mode="contained-tonal" onPress={handleSaveBLEConfig} style={{ marginTop: 8 }}>
              Aplicar
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Conta</Title>
            <List.Item
              title={user?.displayName || 'Usuário'}
              description={user?.email || user?.uid}
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor={theme.colors.error}
              textColor="#FFFFFF"
            >
              Sair da conta
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}