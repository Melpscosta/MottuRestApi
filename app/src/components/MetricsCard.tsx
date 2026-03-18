import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';
import type { Metrics } from '../types';

interface MetricsCardProps {
  metrics?: Metrics;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ 
  metrics = { p50: 2.1, p90: 4.2, efficacy: 85, totalCost: 1160 } 
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    metricsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    metricItem: {
      alignItems: 'center',
      minWidth: '30%',
      marginBottom: 12,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Title style={styles.title}>Métricas de Precisão</Title>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{metrics.p50.toFixed(1)}m</Text>
            <Text style={styles.metricLabel}>P50</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{metrics.p90.toFixed(1)}m</Text>
            <Text style={styles.metricLabel}>P90</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{metrics.efficacy.toFixed(0)}%</Text>
            <Text style={styles.metricLabel}>Eficácia</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};