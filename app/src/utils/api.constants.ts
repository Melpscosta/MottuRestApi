import { getConfig } from '../config/environment';

export const API_CONFIG = {
  BASE_URL: getConfig().API.BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/cadastro',
    },
  },
  JWT: {
    SECRET: getConfig().AUTH.JWT_SECRET,
    EXPIRATION: getConfig().AUTH.TOKEN_EXPIRATION,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
