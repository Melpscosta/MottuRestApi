// Tipos para as requisições de autenticação
// Observação: o backend .NET espera { Username, Password } (case-insensitive).
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

// Resposta real da API de login (backend .NET)
export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  expiresIn: number;
}

// Tipos para erros da API
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Alguns endpoints retornam o payload “direto” (sem envolver em { data: ... }).
// Por isso evitamos acoplar a tipagem a um wrapper específico.
