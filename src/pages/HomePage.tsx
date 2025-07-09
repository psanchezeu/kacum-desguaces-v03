
import React from "react";
import HomeLayout from "@/components/home/HomeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Car, 
  Box, 
  Users, 
  BarChart, 
  Shield, 
  Smartphone,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <HomeLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-primary dark:from-gray-900 dark:to-gray-800 text-white py-20 relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0VjIwYzAtMS4xLS45LTItMi0yaC0xMmMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxMmMxLjEgMCAyLS45IDItMnpNNDggMzRWMjBjMC0xLjEtLjktMi0yLTJoLS45Yy0uNSAwLTEgLjQtMSAuOXYxNS4xYzAgLjYuNC45LjkuOWguNWMxLjEgMCAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10 dark:opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Gestiona tu Desguace con
              <span className="block text-orange-400 dark:text-yellow-400">Eficiencia Total</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Sistema integral de gestión para desguaces. Controla inventario, 
              ventas, clientes y operaciones desde una sola plataforma.
            </p>
            
            {user ? (
              <div className="space-y-4">
                <p className="text-lg">¡Bienvenido de nuevo, {user.nombre}!</p>
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="mr-4">
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login">
                  <Button size="lg" variant="secondary">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-white dark:text-yellow-400 border-white dark:border-yellow-400 hover:bg-white dark:hover:bg-yellow-400 hover:text-primary dark:hover:text-black">
                    Solicitar Demo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Optimiza todas las operaciones de tu desguace con nuestras herramientas especializadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Car className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestión de Vehículos</h3>
                <p className="text-gray-600">
                  Control completo del inventario de vehículos, desde entrada hasta despiece
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Box className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Inventario de Piezas</h3>
                <p className="text-gray-600">
                  Organiza y rastrea todas las piezas con códigos QR y ubicaciones
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gestión de Clientes</h3>
                <p className="text-gray-600">
                  Mantén registro detallado de clientes y su historial de compras
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <BarChart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Informes y Analytics</h3>
                <p className="text-gray-600">
                  Dashboards y reportes para tomar decisiones basadas en datos
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Seguridad Total</h3>
                <p className="text-gray-600">
                  Protección de datos y cumplimiento normativo garantizado
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Smartphone className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Acceso Móvil</h3>
                <p className="text-gray-600">
                  Gestiona tu negocio desde cualquier dispositivo, en cualquier lugar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-yellow-400 mb-6">
                Aumenta tu eficiencia operativa
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Reducción del 40% en tiempos de búsqueda</h3>
                    <p className="text-gray-600">Localiza piezas instantáneamente con nuestro sistema de códigos QR</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Control total del inventario</h3>
                    <p className="text-gray-600">Evita pérdidas y optimiza el espacio de almacenamiento</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Aumenta las ventas un 25%</h3>
                    <p className="text-gray-600">Mejora la atención al cliente con información instantánea</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-yellow-400/10 rounded-lg p-8 text-center">
              <div className="text-4xl font-bold text-primary mb-2">+500</div>
              <p className="text-gray-600 mb-4">Desguaces confían en nosotros</p>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-gray-600">Satisfacción del cliente</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para optimizar tu desguace?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Únete a cientos de desguaces que ya han transformado su negocio
            </p>
            <div className="space-x-4">
              <Link to="/login">
                <Button size="lg" variant="secondary">
                  Prueba Gratis 30 Días
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  Hablar con Ventas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </HomeLayout>
  );
};

export default HomePage;
