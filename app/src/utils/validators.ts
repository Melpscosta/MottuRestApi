import { z } from 'zod';

export const loginSchema = z.object({
  // O backend .NET usa Username/Password (ex: admin/admin123, operador/op123)
  username: z.string().min(3, 'Usuário inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const motoSchema = z.object({
  id: z.string().min(3, 'ID deve ter pelo menos 3 caracteres'),
  x: z.number().min(0, 'X deve ser maior ou igual a 0').max(40, 'X deve ser menor ou igual a 40'),
  y: z.number().min(0, 'Y deve ser maior ou igual a 0').max(30, 'Y deve ser menor ou igual a 30'),
  status: z.enum(['ativa', 'oficina', 'baixa']).default('ativa'),
});

export const anchorSchema = z.object({
  id: z.string().min(2, 'ID deve ter pelo menos 2 caracteres'),
  x: z.number().min(0).max(40),
  y: z.number().min(0).max(30),
  type: z.enum(['parede', 'chao']),
  txPower: z.number().default(-59),
});

export const topologySchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  anchors: z.array(anchorSchema).min(3, 'Topologia deve ter pelo menos 3 âncoras'),
});