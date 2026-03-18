import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';
import { COSTS } from '../utils/constants';

interface CostCardProps {
  cost?: number;
  anchorsCount?: number;
  motosCount?: number;
}

export const CostCard: React.FC<CostCardProps> = ({ 
  cost, 
  anchorsCount = 3,
  motosCount = 3 
}) => {
  const theme = useTheme();
  
  const totalCost = cost || (
    (anchorsCount * COSTS.ANCHOR) + 
    COSTS.AGGREGATOR + 
    (motosCount * COSTS.BEACON)
  );

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
    costGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    costItem: {
      alignItems: 'center',
      minWidth: '22%',
      marginBottom: 12,
    },
    costValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.secondary,
    },
    costLabel: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
    totalCost: {
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    totalValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    totalLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginTop: 4,
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Title style={styles.title}>Análise de Custos</Title>
        <View style={styles.costGrid}>
          <View style={styles.costItem}>
            <Text style={styles.costValue}>R$ {COSTS.ANCHOR}</Text>
            <Text style={styles.costLabel}>Âncora</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costValue}>R$ {COSTS.AGGREGATOR}</Text>
            <Text style={styles.costLabel}>Agregador</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costValue}>R$ {COSTS.BEACON}</Text>
            <Text style={styles.costLabel}>Beacon</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costValue}>{anchorsCount}×</Text>
            <Text style={styles.costLabel}>Âncoras</Text>
          </View>
        </View>
        <View style={styles.totalCost}>
          <Text style={styles.totalValue}>R$ {totalCost.toLocaleString('pt-BR')}</Text>
          <Text style={styles.totalLabel}>Custo Total</Text>
        </View>
      </View>
    </Card>
  );
};