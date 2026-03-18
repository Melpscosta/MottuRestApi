import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  DataTable,
  ActivityIndicator,
} from 'react-native-paper';
import { useApi } from '@/src/hooks/useApi';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';

interface MotoApi {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  status: number;
  zona: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Ativa',
  1: 'Em Uso',
  2: 'Manutenção',
  3: 'Baixada',
};

export default function RelatoriosScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const onUnauthorized = useMemo(() => () => router.replace('/(auth)/login'), [router]);
  const { makeAuthenticatedRequest, isLoading, error } = useApi({ onUnauthorized });

  const [dashboard, setDashboard] = useState<any>(null);
  const [motos, setMotos] = useState<MotoApi[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    const [dash, motosRes] = await Promise.all([
      makeAuthenticatedRequest<any>('/api/dashboard'),
      makeAuthenticatedRequest<MotoApi[]>('/api/motos'),
    ]);
    if (dash) setDashboard(dash);
    if (Array.isArray(motosRes)) setMotos(motosRes);
  }, [isAuthenticated, makeAuthenticatedRequest]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const porStatus = dashboard?.porStatus ?? {};
  const porZona = dashboard?.porZona ?? {};
  const total = dashboard?.totalMotos ?? 0;
  const maxStatus = Math.max(1, porStatus.ativas + porStatus.emUso + porStatus.manutencao + porStatus.baixadas);
  const maxZona = Math.max(1, (porZona.zonaA ?? 0) + (porZona.zonaB ?? 0) + (porZona.zonaC ?? 0));

  const statusBars = [
    { label: 'Ativas', value: porStatus.ativas ?? 0, color: theme.colors.primary },
    { label: 'Em Uso', value: porStatus.emUso ?? 0, color: theme.colors.secondary },
    { label: 'Manutenção', value: porStatus.manutencao ?? 0, color: '#FF9800' },
    { label: 'Baixadas', value: porStatus.baixadas ?? 0, color: theme.colors.onSurfaceVariant },
  ];
  const zonaBars = [
    { label: 'Zona A', value: porZona.zonaA ?? 0, color: '#81c784' },
    { label: 'Zona B', value: porZona.zonaB ?? 0, color: '#64b5f6' },
    { label: 'Zona C', value: porZona.zonaC ?? 0, color: '#ffb74d' },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16 },
    header: { marginBottom: 20 },
    title: { color: theme.colors.onBackground, fontSize: 24, fontWeight: '700' },
    subtitle: { color: theme.colors.onSurfaceVariant, fontSize: 14, marginTop: 4 },
    card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', elevation: 2 },
    cardContent: { padding: 16 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface, marginBottom: 12 },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
    metricItem: { width: '50%', padding: 6, alignItems: 'center' },
    metricValue: { fontSize: 22, fontWeight: '700', color: theme.colors.primary },
    metricLabel: { fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 2 },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    barLabel: { width: 72, fontSize: 12, color: theme.colors.onSurfaceVariant },
    barTrack: { flex: 1, height: 18, backgroundColor: theme.colors.surfaceVariant, borderRadius: 9, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 9 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
          <Text style={styles.subtitle}>Métricas e inventário do pátio</Text>
        </View>

        {error ? (
          <Paragraph style={{ color: theme.colors.error, marginBottom: 12 }}>{error}</Paragraph>
        ) : null}

        {isLoading && !dashboard ? (
          <Card style={styles.card}><Card.Content style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator /></Card.Content></Card>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Resumo geral</Text>
                <View style={styles.metricGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{total}</Text>
                    <Text style={styles.metricLabel}>Total de motos</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{dashboard?.alertasNaoLidos ?? 0}</Text>
                    <Text style={styles.metricLabel}>Alertas ativos</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Por status</Text>
                {statusBars.map((bar, i) => (
                  <View key={i} style={styles.barRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>{bar.label}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(bar.value / maxStatus) * 100}%`, backgroundColor: bar.color }]} />
                    </View>
                    <Text style={{ fontSize: 12, marginLeft: 8, minWidth: 20 }}>{bar.value}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Por zona</Text>
                {zonaBars.map((bar, i) => (
                  <View key={i} style={styles.barRow}>
                    <Text style={styles.barLabel}>{bar.label}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(bar.value / maxZona) * 100}%`, backgroundColor: bar.color }]} />
                    </View>
                    <Text style={{ fontSize: 12, marginLeft: 8, minWidth: 20 }}>{bar.value}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Inventário de motos</Text>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Placa</DataTable.Title>
                    <DataTable.Title>Modelo</DataTable.Title>
                    <DataTable.Title>Zona</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                  </DataTable.Header>
                  {motos.length === 0 ? (
                    <DataTable.Row><DataTable.Cell>Nenhuma moto</DataTable.Cell></DataTable.Row>
                  ) : (
                    motos.slice(0, 20).map((m) => (
                      <DataTable.Row key={m.id}>
                        <DataTable.Cell>{m.placa}</DataTable.Cell>
                        <DataTable.Cell>{m.marca} {m.modelo}</DataTable.Cell>
                        <DataTable.Cell>{m.zona}</DataTable.Cell>
                        <DataTable.Cell>{STATUS_LABELS[m.status] ?? m.status}</DataTable.Cell>
                      </DataTable.Row>
                    ))
                  )}
                </DataTable>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
