import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme, Text } from 'react-native-paper';
import { ZONES } from '../utils/constants';

interface ZonePickerProps {
  onZoneSelect: (zone: string) => void;
  onCancel: () => void;
}

export const ZonePicker: React.FC<ZonePickerProps> = ({
  onZoneSelect,
  onCancel,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      gap: 16,
    },
    zonesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'space-between',
    },
    zoneButton: {
      minWidth: '22%',
      margin: 2,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    button: {
      flex: 1,
    },
    description: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Selecione uma zona para posicionar a moto automaticamente
      </Text>
      
      <View style={styles.zonesGrid}>
        {ZONES.map((zone) => (
          <Button
            key={zone}
            mode="outlined"
            onPress={() => onZoneSelect(zone)}
            style={styles.zoneButton}
          >
            {zone}
          </Button>
        ))}
      </View>

      <Button
        mode="outlined"
        onPress={() => onZoneSelect('RANDOM')}
        style={{ marginTop: 8 }}
      >
        Posição Aleatória
      </Button>

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.button}
        >
          Cancelar
        </Button>
      </View>
    </View>
  );
};