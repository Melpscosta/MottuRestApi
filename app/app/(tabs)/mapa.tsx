import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Card, Chip, Switch } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { YardMap } from '@/src/components/YardMap';
import { MotoList } from '@/src/components/MotoList';
import { MetricsCard } from '@/src/components/MetricsCard';
import { CostCard } from '@/src/components/CostCard';
import { useBLESim } from '@/src/hooks/useBLESim';
import { DEFAULT_TOPOLOGIES, DEFAULT_BLE_CONFIG } from '@/src/utils/constants';
import { getStoredBleConfig } from '@/src/utils/bleConfigStorage';
import type { TopologyType } from '@/src/types';
import type { BLEConfig } from '@/src/types';

export default function MapaScreen() {
  const theme = useTheme();
  const [selectedTopology, setSelectedTopology] = useState<TopologyType>('A');
  const [showGrid, setShowGrid] = useState(true);
  const [showCoverage, setShowCoverage] = useState(false);
  const [bleConfig, setBleConfig] = useState<BLEConfig>(DEFAULT_BLE_CONFIG);

  useFocusEffect(
    useCallback(() => {
      getStoredBleConfig().then(setBleConfig);
    }, [])
  );

  const motos = useMemo(() => [
    { id: 'M001', x: 10, y: 5, status: 'ativa' as const },
    { id: 'M002', x: 25, y: 8, status: 'ativa' as const },
    { id: 'M003', x: 32, y: 22, status: 'ativa' as const },
  ], []);

  const currentTopology = DEFAULT_TOPOLOGIES[selectedTopology];
  const { estimatedPositions, rssiReadings, metrics } = useBLESim(
    motos,
    currentTopology.anchors,
    bleConfig
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16 },
    header: { marginBottom: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
    title: { color: theme.colors.onBackground, fontSize: 22, fontWeight: '700' },
    badge: { backgroundColor: theme.colors.secondaryContainer },
    topologyChips: { flexDirection: 'row', marginTop: 12, marginBottom: 12 },
    chip: { marginRight: 8 },
    controls: { marginBottom: 16 },
    controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    mapCard: { backgroundColor: theme.colors.surface, padding: 0, margin: 0, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Visão do Pátio</Text>
            <Chip style={styles.badge} textStyle={{ fontSize: 11 }}>Simulação BLE</Chip>
          </View>
          <View style={styles.topologyChips}>
            {(['A', 'B', 'C'] as TopologyType[]).map((topology) => (
              <Chip
                key={topology}
                selected={selectedTopology === topology}
                onPress={() => setSelectedTopology(topology)}
                style={[styles.chip, {
                  backgroundColor: selectedTopology === topology ? theme.colors.primary : theme.colors.surfaceVariant,
                }]}
                textStyle={{
                  color: selectedTopology === topology ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                }}
              >
                Topologia {topology}
              </Chip>
            ))}
          </View>

          <Card style={styles.controls}>
            <Card.Content>
              <View style={styles.controlRow}>
                <Text style={{ color: theme.colors.onSurface }}>Grade</Text>
                <Switch
                  value={showGrid}
                  onValueChange={setShowGrid}
                  thumbColor={showGrid ? theme.colors.primary : theme.colors.outline}
                  trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                />
              </View>
              <View style={styles.controlRow}>
                <Text style={{ color: theme.colors.onSurface }}>Cobertura BLE</Text>
                <Switch
                  value={showCoverage}
                  onValueChange={setShowCoverage}
                  thumbColor={showCoverage ? theme.colors.primary : theme.colors.outline}
                  trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.mapCard}>
          <YardMap
            motos={motos}
            estimatedPositions={estimatedPositions}
            anchors={currentTopology.anchors}
            showGrid={showGrid}
            showCoverage={showCoverage}
            yardWidth={bleConfig.yardWidth}
            yardHeight={bleConfig.yardHeight}
            onMotoPress={(m) => {}}
          />
        </Card>

        <MotoList motos={motos} estimatedPositions={estimatedPositions} rssiReadings={rssiReadings} />
        <MetricsCard metrics={metrics} />
        <CostCard cost={metrics.totalCost} />
      </ScrollView>
    </SafeAreaView>
  );
}