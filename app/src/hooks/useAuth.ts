import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth.service';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialUser = async () => {
      const currentUser = await AuthService.getCurrentUser();
      const isTokenValid = await AuthService.isTokenValid();
      
      if (currentUser && isTokenValid) {
        setUser(currentUser);
      } else {
        // Se o token não for válido, fazer logout
        if (currentUser) {
          await AuthService.logout();
        }
        setUser(null);
      }
      setIsLoading(false);
    };
    loadInitialUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const loggedInUser = await AuthService.login(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error('Erro no login (useAuth):', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const registeredUser = await AuthService.register(name, email, password);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      console.error('Erro no cadastro (useAuth):', error);
      throw error;
    }
  };

  const loginWithoutApi = async () => {
    try {
      const demoUser = await AuthService.loginWithoutApi();
      setUser(demoUser);
      return demoUser;
    } catch (error) {
      console.error('Erro no login sem API (useAuth):', error);
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithoutApi,
    logout,
  };
};