import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_BLE_CONFIG } from './constants';
import type { BLEConfig } from '../types';

const BLE_CONFIG_KEY = 'mottu_ble_config';

export async function getStoredBleConfig(): Promise<BLEConfig> {
  try {
    const raw = await AsyncStorage.getItem(BLE_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_BLE_CONFIG };
    const parsed = JSON.parse(raw) as Partial<BLEConfig>;
    return {
      txPower: parsed.txPower ?? DEFAULT_BLE_CONFIG.txPower,
      pathLoss: parsed.pathLoss ?? DEFAULT_BLE_CONFIG.pathLoss,
      sigma: parsed.sigma ?? DEFAULT_BLE_CONFIG.sigma,
      rangeMax: parsed.rangeMax ?? DEFAULT_BLE_CONFIG.rangeMax,
      tickMs: parsed.tickMs ?? DEFAULT_BLE_CONFIG.tickMs,
      alpha: parsed.alpha ?? DEFAULT_BLE_CONFIG.alpha,
      yardWidth: parsed.yardWidth ?? DEFAULT_BLE_CONFIG.yardWidth,
      yardHeight: parsed.yardHeight ?? DEFAULT_BLE_CONFIG.yardHeight,
    };
  } catch {
    return { ...DEFAULT_BLE_CONFIG };
  }
}

export async function setStoredBleConfig(config: BLEConfig): Promise<void> {
  await AsyncStorage.setItem(BLE_CONFIG_KEY, JSON.stringify(config));
}
