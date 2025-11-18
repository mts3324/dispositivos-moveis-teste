import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextData {
  theme: "light" | "dark";
  isDarkMode: boolean;
  toggleTheme: () => void;
  isThemeLoading: boolean;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    card: string;
    cardSecondary: string;
    border: string;
    easy: string;
    medium: string;
    hard: string;
    xp: string;
  };
  commonStyles: {
    container: { flex: number; backgroundColor: string };
    scrollView: { flex: number; backgroundColor: string };
    text: { color: string };
    card: { backgroundColor: string; boxShadow: string; elevation: number };
    header: { backgroundColor: string; borderBottomColor: string };
  };
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
        if (!savedTheme) {
          setTheme(colorScheme || "light");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const initializeTheme = async () => {
    try {
      setIsThemeLoading(true);
      
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        const colorScheme = Appearance.getColorScheme();
        setTheme(colorScheme || "light");
      }
    } catch (error) {
      setTheme("light");
    } finally {
      setIsThemeLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {}
  };

  const isDarkMode = theme === "dark";

  const colors = {
    background: isDarkMode ? '#1A2942' : '#FAFAFA',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDarkMode ? '#CCCCCC' : '#666666',
    primary: isDarkMode ? '#4A90E2' : '#4A90E2',
    card: isDarkMode ? '#243656' : '#FFFFFF',
    cardSecondary: isDarkMode ? '#2F4562' : '#F5F5F5',
    border: isDarkMode ? '#3A5277' : '#E0E0E0',
    easy: isDarkMode ? '#2E7D32' : '#E8F5E8',
    medium: isDarkMode ? '#EF6C00' : '#FFF3E0', 
    hard: isDarkMode ? '#C62828' : '#FFEBEE',
    xp: isDarkMode ? '#FFD700' : '#FFD700',
  };

  const commonStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    },
    text: {
      color: colors.text,
    },
    card: {
      backgroundColor: colors.card,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
  };

  const contextValue: ThemeContextData = {
    theme,
    isDarkMode,
    toggleTheme,
    isThemeLoading,
    colors,
    commonStyles,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
}