// Configurações de debug para desenvolvimento
export const DEBUG_CONFIG = {
  // Habilitar logs detalhados da API
  ENABLE_API_LOGS: true,
  
  // Habilitar logs de autenticação
  ENABLE_AUTH_LOGS: true,
  
  // Habilitar logs de requisições
  ENABLE_REQUEST_LOGS: true,
  
  // Habilitar logs de respostas
  ENABLE_RESPONSE_LOGS: true,
  
  // Habilitar logs de erro detalhados
  ENABLE_ERROR_LOGS: true,
  
  // Mostrar dados sensíveis nos logs (desabilitar em produção)
  SHOW_SENSITIVE_DATA: false,
  
  // Timeout para requisições de debug
  DEBUG_TIMEOUT: 30000, // 30 segundos
};

// Função para verificar se debug está habilitado
export const isDebugEnabled = () => {
  return process.env.NODE_ENV === 'development' && DEBUG_CONFIG.ENABLE_API_LOGS;
};

// Função para log seguro (não mostra dados sensíveis)
export const safeLog = (message: string, data?: any, sensitive = false) => {
  if (!isDebugEnabled()) return;
  
  if (sensitive && !DEBUG_CONFIG.SHOW_SENSITIVE_DATA) {
    console.log(message, '[DADOS SENSÍVEIS OCULTADOS]');
  } else {
    console.log(message, data);
  }
};

// Função para log de erro
export const debugError = (context: string, error: any) => {
  if (!isDebugEnabled()) return;
  
  console.error(`[DEBUG ERROR - ${context}]`, error);
  if (error.response) {
    console.error('Response:', error.response);
  }
  if (error.request) {
    console.error('Request:', error.request);
  }
};

// Função para log de requisição
export const debugRequest = (method: string, url: string, data?: any) => {
  if (!isDebugEnabled()) return;
  
  safeLog(`[DEBUG REQUEST] ${method} ${url}`, data, true);
};

// Função para log de resposta
export const debugResponse = (status: number, data: any) => {
  if (!isDebugEnabled()) return;
  
  safeLog(`[DEBUG RESPONSE] Status: ${status}`, data, true);
};
