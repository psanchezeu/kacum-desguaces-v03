
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rol?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rol?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simular autenticación (aquí conectarías con tu backend real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usuarios de ejemplo
      const usuarios = [
        { id: 1, email: 'admin@desguaces.com', password: 'admin123', nombre: 'Administrador', rol: 'admin' },
        { id: 2, email: 'gestor@desguaces.com', password: 'gestor123', nombre: 'Gestor', rol: 'gestor' },
        { id: 3, email: 'operario@desguaces.com', password: 'operario123', nombre: 'Operario', rol: 'operario' },
      ];
      
      const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);
      
      if (usuarioEncontrado) {
        const userData = {
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          email: usuarioEncontrado.email,
          rol: rol || usuarioEncontrado.rol
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
