import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl } from 'react-native';
import {
  useTheme,
  Card,
  Paragraph,
  List,
  Button,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/src/hooks/useApi';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';

const PAGE_SIZE = 20;

interface EventoApi {
  id: number;
  descricao: string;
  zonaOrigem: string;
  zonaDestino: string;
  tipo: string;
  timestamp: string;
  moto?: { id: number; placa: string; modelo: string; marca: string };
}

interface HistoricoResponse {
  total: number;
  page: number;
  pageSize: number;
  eventos: EventoApi[];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function HistoricoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const onUnauthorized = useMemo(() => () => router.replace('/(auth)/login'), [router]);
  const { makeAuthenticatedRequest, isLoading, error } = useApi({ onUnauthorized });

  const [data, setData] = useState<HistoricoResponse | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistorico = useCallback(async () => {
    const res = await makeAuthenticatedRequest<HistoricoResponse>(
      `/api/historico?page=${page}&pageSize=${PAGE_SIZE}`
    );
    if (res) setData(res);
  }, [page, makeAuthenticatedRequest]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchHistorico();
  }, [isAuthenticated, fetchHistorico]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistorico();
    setRefreshing(false);
  }, [fetchHistorico]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const eventos = data?.eventos ?? [];

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
      fontSize: 22,
      fontWeight: '700',
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      marginTop: 4,
    },
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    listItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
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
          <Text style={styles.title}>Eventos IoT</Text>
          <Paragraph style={styles.subtitle}>
            Histórico de movimentações no pátio
          </Paragraph>
        </View>

        {error ? (
          <Paragraph style={{ color: theme.colors.error, marginBottom: 16 }}>{error}</Paragraph>
        ) : null}

        {isLoading && !data ? (
          <Card style={styles.card}>
            <Card.Content style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" />
              <Paragraph style={{ marginTop: 12 }}>Carregando histórico...</Paragraph>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={{ color: theme.colors.onSurface, marginBottom: 12, fontSize: 16, fontWeight: '600' }}>
                Eventos
              </Text>
              {eventos.length === 0 ? (
                <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                  Nenhum evento no histórico. O simulador IoT da API gera eventos a cada ~60s.
                </Paragraph>
              ) : (
                eventos.map((e) => (
                  <List.Item
                    key={e.id}
                    title={e.descricao}
                    description={`${e.zonaOrigem} → ${e.zonaDestino} • ${e.tipo} • ${e.moto?.placa ?? '—'} • ${formatDate(e.timestamp)}`}
                    style={styles.listItem}
                    left={(props) => <List.Icon {...props} icon="history" />}
                    right={() => (
                      <Chip compact style={{ alignSelf: 'center' }}>
                        {e.tipo}
                      </Chip>
                    )}
                  />
                ))
              )}

              {data && data.total > PAGE_SIZE ? (
                <View style={styles.pagination}>
                  <Button
                    mode="outlined"
                    disabled={page <= 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
                    Página {data.page} de {totalPages} ({data.total} eventos)
                  </Paragraph>
                  <Button
                    mode="outlined"
                    disabled={page >= totalPages}
                    onPress={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </View>
              ) : null}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
