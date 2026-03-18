import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Text, TextInput, useTheme, SegmentedButtons } from 'react-native-paper';
import { motoSchema } from '../utils/validators';
import type { Moto } from '../types';

interface MotoFormProps {
  initialData?: Moto | null;
  onSubmit: (data: Omit<Moto, 'id'>) => void;
  onCancel: () => void;
}

export const MotoForm: React.FC<MotoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(motoSchema.omit({ id: true })),
    defaultValues: initialData ? {
      x: initialData.x,
      y: initialData.y,
      status: initialData.status,
    } : {
      x: 20,
      y: 15,
      status: 'ativa' as const,
    },
  });

  const styles = StyleSheet.create({
    container: {
      gap: 16,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    button: {
      flex: 1,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="x"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Posição X (metros)"
              mode="outlined"
              value={String(value)}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              keyboardType="numeric"
              error={!!errors.x}
              style={styles.input}
            />
            {errors.x && <Text style={styles.errorText}>{errors.x.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name="y"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Posição Y (metros)"
              mode="outlined"
              value={String(value)}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              keyboardType="numeric"
              error={!!errors.y}
              style={styles.input}
            />
            {errors.y && <Text style={styles.errorText}>{errors.y.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: 'ativa', label: 'Ativa' },
              { value: 'oficina', label: 'Oficina' },
              { value: 'baixa', label: 'Baixa' },
            ]}
          />
        )}
      />

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.button}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Salvar
        </Button>
      </View>
    </View>
  );
};