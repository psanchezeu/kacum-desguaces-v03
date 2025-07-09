
import React, { useState } from "react";
import HomeLayout from "@/components/home/HomeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, User, Shield, Settings } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado, redirigir al dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const roles = [
    { id: 'admin', name: 'Administrador', icon: Shield, description: 'Acceso completo al sistema' },
    { id: 'gestor', name: 'Gestor', icon: Settings, description: 'Gestión de operaciones' },
    { id: 'operario', name: 'Operario', icon: User, description: 'Operaciones básicas' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password, selectedRole);
      
      if (success) {
        toast.success("¡Bienvenido! Redirigiendo al dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error("Credenciales incorrectas. Inténtalo de nuevo.");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión. Inténtalo más tarde.");
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = async (role: string, demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSelectedRole(role);
    
    setIsLoading(true);
    const success = await login(demoEmail, demoPassword, role);
    
    if (success) {
      toast.success(`¡Bienvenido como ${role}!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      toast.error("Error en el acceso rápido");
    }
    setIsLoading(false);
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-gray-600">Accede a tu panel de control</p>
          </div>

          {/* Acceso Rápido por Rol */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center">Acceso Rápido Demo</h3>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Button
                    key={role.id}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleQuickLogin(
                      role.id,
                      `${role.id}@desguaces.com`,
                      `${role.id}123`
                    )}
                    disabled={isLoading}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Entrar como {role.name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">O usa tus credenciales</span>
            </div>
          </div>

          {/* Formulario de Login */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Iniciar Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="ml-2 text-sm">
                      Recuérdame
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    Solicitar acceso
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Credenciales de Demo */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">Credenciales de Demo:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>👨‍💼 Admin: admin@desguaces.com / admin123</div>
                <div>👨‍🔧 Gestor: gestor@desguaces.com / gestor123</div>
                <div>👷‍♂️ Operario: operario@desguaces.com / operario123</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
};

export default LoginPage;
