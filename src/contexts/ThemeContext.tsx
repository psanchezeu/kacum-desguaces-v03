import React, { createContext, useContext, useState, useEffect } from 'react';
import { configuracionService, ConfiguracionGeneral } from '@/services/configuracionService';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Cargar la preferencia de tema desde localStorage y configuración al iniciar
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Primero intentamos cargar desde localStorage para una respuesta inmediata
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
          applyTheme(isDark);
        }
        
        // Luego cargamos desde la configuración del servidor
        const config = await configuracionService.getByCategoria('general');
        const darkModeEnabled = config.modo_oscuro || false;
        
        // Solo actualizamos si es diferente al valor actual o si no había valor en localStorage
        if (!savedTheme || isDarkMode !== darkModeEnabled) {
          setIsDarkMode(darkModeEnabled);
          applyTheme(darkModeEnabled);
        }
      } catch (error) {
        console.error('Error al cargar preferencia de tema:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadThemePreference();
  }, []);

  // Aplicar el tema al documento HTML
  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      // Guardar preferencia en localStorage para persistencia
      localStorage.setItem('theme', 'dark');
      console.log('Modo oscuro activado');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Modo oscuro desactivado');
    }
  };

  // Cambiar el tema y guardar la preferencia
  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
    
    try {
      // Obtener la configuración actual
      const currentConfig = await configuracionService.getByCategoria('general');
      
      // Actualizar solo el modo oscuro
      await configuracionService.saveGeneral({
        ...currentConfig,
        modo_oscuro: newMode
      } as ConfiguracionGeneral);
    } catch (error) {
      console.error('Error al guardar preferencia de tema:', error);
    }
  };

  // Establecer el tema directamente
  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    applyTheme(isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
