import { Platform } from 'react-native';

export const API_BASE = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080/api' 
  : 'http://localhost:8080/api';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isWeb = Platform.OS === 'web';