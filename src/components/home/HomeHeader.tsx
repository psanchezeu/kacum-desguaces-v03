
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, ShoppingCart, Car, Info, CreditCard, LogOut, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

const HomeHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Cerrar el menú cuando se cambia de móvil a escritorio
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-primary dark:bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-lg">K</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-yellow-400">
                Kacum Desguaces
              </span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/catalogo/vehiculos" 
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/catalogo/vehiculos" || location.pathname.startsWith("/catalogo/vehiculos/") 
                  ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
              )}
            >
              <Car className="h-4 w-4" />
              Vehículos Origen
            </Link>
            <Link 
              to="/recambios" 
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/recambios" || location.pathname.startsWith("/recambios/") 
                  ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              Recambios
            </Link>
            <Link 
              to="/caracteristicas" 
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/caracteristicas" 
                  ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
              )}
            >
              <Info className="h-4 w-4" />
              Características
            </Link>
            <Link 
              to="/precios" 
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/precios" 
                  ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                  : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Precios
            </Link>
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-400/10">
                    <Settings className="h-4 w-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white" onClick={logout}>
                  Cerrar Sesión
                </Button>
                {/* User name removed as requested */}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-400/10" asChild>
                    <Link to="/login">Iniciar Sesión</Link>
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-foreground" asChild>
                    <Link to="/register">Registrarse</Link>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Abrir menú</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-40 pt-16 overflow-y-auto" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center h-16 px-4 border-b">
            <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
              <div className="h-8 w-8 bg-primary dark:bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-lg">K</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">Kacum</span>
            </Link>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 focus:outline-none"
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="flex items-center justify-between px-3 py-2 mb-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo oscuro</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 mr-2" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                {isDarkMode ? 'Claro' : 'Oscuro'}
              </Button>
            </div>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/catalogo/vehiculos"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === "/catalogo/vehiculos" || location.pathname.startsWith("/catalogo/vehiculos/") 
                    ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                    : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Car className="h-5 w-5" />
                Vehículos Origen
              </Link>
              <Link
                to="/recambios"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === "/recambios" || location.pathname.startsWith("/recambios/") 
                    ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                    : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                Recambios
              </Link>
              <Link
                to="/caracteristicas"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === "/caracteristicas" 
                    ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                    : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="h-5 w-5" />
                Características
              </Link>
              <Link
                to="/precios"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === "/precios" 
                    ? "bg-primary/10 text-primary dark:bg-yellow-400/10 dark:text-yellow-400" 
                    : "text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-white dark:hover:text-yellow-400 dark:hover:bg-yellow-400/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <CreditCard className="h-5 w-5" />
                Precios
              </Link>
            </nav>
            
            <div className="border-t border-gray-200 my-4 pt-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-yellow-400 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
