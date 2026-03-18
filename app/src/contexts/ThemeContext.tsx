import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paperThemeDark } from '../theme/paperThemeDark';
import { paperThemeLight } from '../theme/paperThemeLight';

const THEME_KEY = 'theme_scheme';

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  theme: typeof paperThemeLight | typeof paperThemeDark;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      console.log('Tema carregado do AsyncStorage:', savedTheme);
      if (savedTheme !== null) {
        const isDark = savedTheme === 'dark';
        setIsDarkTheme(isDark);
        console.log('Tema definido como:', isDark ? 'escuro' : 'claro');
      } else {
        // Se não houver tema salvo, define como claro por padrão
        setIsDarkTheme(false);
        console.log('Nenhum tema salvo, definindo como claro');
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setIsDarkTheme(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme;
      console.log('Alternando tema de', isDarkTheme, 'para', newTheme);
      setIsDarkTheme(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
      console.log('Tema salvo no AsyncStorage:', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const theme = isDarkTheme ? paperThemeDark : paperThemeLight;

  const value: ThemeContextType = {
    isDarkTheme,
    toggleTheme,
    theme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
