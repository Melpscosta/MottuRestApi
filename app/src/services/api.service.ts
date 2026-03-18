import { API_CONFIG, HTTP_STATUS } from '../utils/api.constants';
import { debugRequest, debugResponse, debugError, safeLog } from '../config/debug';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '../types/api.types';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    debugRequest(options.method || 'GET', url, defaultOptions);
    safeLog('Opções da requisição:', defaultOptions, true);

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        // Se a resposta for um erro, o corpo pode não ser JSON.
        // Leia como texto para evitar o SyntaxError.
        const errorBody = await response.text();
        throw new Error(errorBody || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      debugResponse(response.status, data);
      return data as T;
    } catch (error) {
      console.error('--- ERRO DETALHADO DO FETCH ---');
      console.error('URL da tentativa:', url);
      console.error('Objeto de erro:', error);
      console.error('---------------------------------');
      
      debugError('API Request', error);
      throw error;
    }
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    return await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Mantido apenas para manter assinatura; o backend .NET atual não possui cadastro.
    throw new Error('Cadastro não disponível nesta versão. Use login/demo.');
  }

  static async makeAuthenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export default ApiService;
