import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  List,
  Chip,
  Button,
  ActivityIndicator,
  Divider,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '@/src/hooks/useApi';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';

interface AlertaApi {
  id: number;
  titulo: string;
  descricao: string;
  gravidade: string;
  timestamp: string;
  lido: boolean;
  motoPlaca: string | null;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const onUnauthorized = useMemo(() => () => router.replace('/(auth)/login'), [router]);
  const { makeAuthenticatedRequest, isLoading: apiLoading, error: apiError } = useApi({
    onUnauthorized,
  });

  const [dashboard, setDashboard] = useState<any>(null);
  const [alertas, setAlertas] = useState<AlertaApi[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(false);
  const [marcandoTodos, setMarcandoTodos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(() => {
    if (!isAuthenticated) return;
    void makeAuthenticatedRequest<any>('/api/dashboard').then(setDashboard);
  }, [isAuthenticated, makeAuthenticatedRequest]);

  const fetchAlertas = useCallback(async () => {
    if (!isAuthenticated) return;
    setAlertasLoading(true);
    const res = await makeAuthenticatedRequest<AlertaApi[]>('/api/alertas');
    if (Array.isArray(res)) setAlertas(res);
    setAlertasLoading(false);
  }, [isAuthenticated, makeAuthenticatedRequest]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchDashboard();
  }, [isAuthenticated, fetchDashboard]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchAlertas();
  }, [isAuthenticated, fetchAlertas]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchAlertas()]);
    setRefreshing(false);
  }, [fetchDashboard, fetchAlertas]);

  const marcarTodosLidos = useCallback(async () => {
    setMarcandoTodos(true);
    await makeAuthenticatedRequest<{ message?: string }>('/api/alertas/marcar-todos-lidos', {
      method: 'PUT',
    });
    setMarcandoTodos(false);
    void fetchAlertas();
    void fetchDashboard();
  }, [makeAuthenticatedRequest, fetchAlertas, fetchDashboard]);

  const kpis = useMemo(() => {
    const porStatus = dashboard?.porStatus ?? {};
    const total = dashboard?.totalMotos ?? 0;
    return {
      totalMotos: total,
      ativas: porStatus.ativas ?? 0,
      emUso: porStatus.emUso ?? 0,
      manutencao: porStatus.manutencao ?? 0,
      baixadas: porStatus.baixadas ?? 0,
      alertasNaoLidos: dashboard?.alertasNaoLidos ?? 0,
      ultimosEventos: dashboard?.ultimosEventos ?? [],
    };
  }, [dashboard]);

  const maxStatus = useMemo(() => {
    const n = Math.max(1, kpis.ativas + kpis.emUso + kpis.manutencao + kpis.baixadas);
    return n;
  }, [kpis]);

  const statusBars = useMemo(() => [
    { label: 'Ativas', value: kpis.ativas, color: theme.colors.primary },
    { label: 'Em Uso', value: kpis.emUso, color: theme.colors.secondary },
    { label: 'Manutenção', value: kpis.manutencao, color: '#FF9800' },
    { label: 'Baixadas', value: kpis.baixadas, color: theme.colors.onSurfaceVariant },
  ], [kpis, theme.colors]);

  const getGravidadeColor = (g: string) => {
    if (g === 'Critico') return theme.colors.errorContainer;
    if (g === 'Aviso') return theme.colors.secondaryContainer;
    return theme.colors.primaryContainer;
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16 },
    header: { marginBottom: 20 },
    appTitle: { color: theme.colors.onBackground, fontSize: 26, fontWeight: '700' },
    appSubtitle: { color: theme.colors.onSurfaceVariant, fontSize: 14, marginTop: 4 },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 16 },
    kpiCard: {
      width: '50%',
      padding: 6,
    },
    kpiInner: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 14,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    kpiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    kpiValue: { fontSize: 22, fontWeight: '700', color: theme.colors.primary, marginLeft: 8 },
    kpiLabel: { fontSize: 12, color: theme.colors.onSurfaceVariant },
    card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', elevation: 2 },
    cardContent: { padding: 16 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface, marginBottom: 12 },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    barLabel: { width: 80, fontSize: 12, color: theme.colors.onSurfaceVariant },
    barTrack: { flex: 1, height: 20, backgroundColor: theme.colors.surfaceVariant, borderRadius: 10, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 10 },
    eventRow: { paddingVertical: 8 },
    alertaCard: { marginBottom: 10, borderRadius: 10, overflow: 'hidden', borderLeftWidth: 4 },
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
          <Text style={styles.appTitle}>Pátio Digital</Text>
          <Text style={styles.appSubtitle}>Visão geral da operação</Text>
        </View>

        {apiError ? (
          <Paragraph style={{ color: theme.colors.error, marginBottom: 12 }}>{apiError}</Paragraph>
        ) : null}

        {/* KPIs 2x2 */}
        <View style={styles.kpiGrid}>
          {[
            { icon: 'bicycle', value: kpis.totalMotos, label: 'Total de Motos' },
            { icon: 'checkmark-circle', value: kpis.ativas, label: 'Ativas' },
            { icon: 'navigate', value: kpis.emUso, label: 'Em Uso' },
            { icon: 'warning', value: kpis.alertasNaoLidos, label: 'Alertas' },
          ].map((item, i) => (
            <View key={i} style={styles.kpiCard}>
              <View style={styles.kpiInner}>
                <View style={styles.kpiRow}>
                  <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />
                  <Text style={styles.kpiValue}>{item.value}</Text>
                </View>
                <Text style={styles.kpiLabel}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Gráfico de status */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Status das motos</Text>
            {apiLoading && !dashboard ? (
              <ActivityIndicator size="small" style={{ marginVertical: 12 }} />
            ) : (
              statusBars.map((bar, i) => (
                <View key={i} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>{bar.label}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${(bar.value / maxStatus) * 100}%`,
                          backgroundColor: bar.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={{ fontSize: 12, marginLeft: 8, minWidth: 24 }}>{bar.value}</Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Últimos eventos */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Últimos eventos</Text>
            {(kpis.ultimosEventos as any[]).length === 0 ? (
              <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
                Nenhum evento recente. O simulador IoT gera eventos a cada ~60s.
              </Paragraph>
            ) : (
              (kpis.ultimosEventos as any[]).slice(0, 5).map((e: any) => (
                <View key={e.id} style={styles.eventRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="radio" size={14} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Paragraph style={{ flex: 1, fontSize: 13 }}>
                      {e.descricao} {e.motoPlaca ? ` · ${e.motoPlaca}` : ''}
                    </Paragraph>
                  </View>
                  <Divider style={{ marginTop: 6 }} />
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Alertas */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.cardTitle}>Alertas</Text>
              {alertas.some((a) => !a.lido) ? (
                <Button
                  mode="contained-tonal"
                  compact
                  loading={marcandoTodos}
                  disabled={marcandoTodos}
                  onPress={marcarTodosLidos}
                >
                  Marcar todos
                </Button>
              ) : null}
            </View>
            {alertasLoading ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : alertas.length === 0 ? (
              <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
                Nenhum alerta. Alertas são gerados quando uma moto entra na Zona C (restrita).
              </Paragraph>
            ) : (
              alertas.slice(0, 10).map((a) => (
                <View
                  key={a.id}
                  style={[
                    styles.alertaCard,
                    {
                      backgroundColor: getGravidadeColor(a.gravidade),
                      borderLeftColor: a.gravidade === 'Critico' ? theme.colors.error : theme.colors.primary,
                    },
                  ]}
                >
                  <View style={{ padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons
                        name={a.lido ? 'checkmark-circle' : 'alert-circle'}
                        size={18}
                        color={a.gravidade === 'Critico' ? theme.colors.error : theme.colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontWeight: '600', flex: 1 }}>{a.titulo}</Text>
                      <Chip compact style={{ backgroundColor: theme.colors.surface }}>{a.gravidade}</Chip>
                    </View>
                    <Paragraph style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                      {a.descricao}{a.motoPlaca ? ` · ${a.motoPlaca}` : ''}
                    </Paragraph>
                    <Text style={{ fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {formatDate(a.timestamp)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
