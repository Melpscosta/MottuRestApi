import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'theme_scheme';

export const useThemeScheme = () => {
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
        setIsDarkTheme(savedTheme === 'dark');
      } else {
        // Se não houver tema salvo, define um padrão (por exemplo, claro)
        setIsDarkTheme(false); // Define como tema claro por padrão se não houver nada salvo
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setIsDarkTheme(false); // Em caso de erro, define como tema claro
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme; // Inverte o tema atual
      console.log('Alternando tema de', isDarkTheme, 'para', newTheme);
      setIsDarkTheme(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
      console.log('Tema salvo no AsyncStorage:', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  return { isDarkTheme, toggleTheme, isLoading };
};