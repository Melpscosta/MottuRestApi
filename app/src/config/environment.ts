// Configurações de ambiente
export const ENV = {
  // Ambiente atual
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // URLs da API
  API: {
    // Para mobile real (Android/iOS), `localhost` costuma apontar para o aparelho.
    // Use o IP da sua máquina na rede ou a URL pública (ex: ngrok/Render).
    BASE_URL:
      (process.env as any)?.EXPO_PUBLIC_API_BASE_URL ??
      (process.env as any)?.API_BASE_URL ??
      'http://localhost:5055',
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
  },
  
  // Configurações de autenticação
  AUTH: {
    JWT_SECRET: 'mottuSecretKey2024Sprint3JavaAdvancedFIAP',
    TOKEN_EXPIRATION: 5184000000, // 2 meses em ms
    REFRESH_THRESHOLD: 86400000, // 1 dia antes da expiração
  },
  
  // Configurações de desenvolvimento
  DEV: {
    ENABLE_LOGS: true,
    ENABLE_API_TESTS: true,
    MOCK_API_RESPONSES: false,
  },
  
  // Configurações de produção
  PROD: {
    ENABLE_LOGS: false,
    ENABLE_API_TESTS: false,
    MOCK_API_RESPONSES: false,
  },
} as const;

// Função para obter configuração baseada no ambiente
export const getConfig = () => {
  const isDev = ENV.NODE_ENV === 'development';
  return {
    ...ENV,
    ...(isDev ? ENV.DEV : ENV.PROD),
  };
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = () => ENV.NODE_ENV === 'development';

// Função para verificar se estamos em produção
export const isProduction = () => ENV.NODE_ENV === 'production';

// Função para obter a URL base da API
export const getApiBaseUrl = () => ENV.API.BASE_URL;

// Função para obter timeout da API
export const getApiTimeout = () => ENV.API.TIMEOUT;

// Função para obter número de tentativas de retry
export const getApiRetryAttempts = () => ENV.API.RETRY_ATTEMPTS;
