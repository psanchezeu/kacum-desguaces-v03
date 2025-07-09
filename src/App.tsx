
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CaracteristicasPage from "./pages/caracteristicas/CaracteristicasPage";
import PreciosPage from "./pages/precios/PreciosPage";

import RecambiosPage from "./pages/recambios/RecambiosPage";
import RecambioDetallePage from "./pages/recambios/RecambioDetallePage";
import ClientesPage from "./pages/clientes/ClientesPage";
import ClienteCreate from "./pages/clientes/ClienteCreate";
import ClienteEdit from "./pages/clientes/ClienteEdit";
import ClienteView from "./pages/clientes/ClienteView";
import VehiculosPage from "./pages/vehiculos/VehiculosPage";
import VehiculoCreate from "./pages/vehiculos/VehiculoCreate";
import VehiculoEdit from "./pages/vehiculos/VehiculoEdit";
import VehiculoView from "./pages/vehiculos/VehiculoView";
import VehiculosOrigenPage from "./pages/vehiculos/VehiculosOrigenPage";
import VehiculoDetallePage from "./pages/vehiculos/VehiculoDetallePage";
import PiezasPage from "./pages/piezas/PiezasPage";
import PiezaCreate from "./pages/piezas/PiezaCreate";
import PiezaEdit from "./pages/piezas/PiezaEdit";
import PiezaView from "./pages/piezas/PiezaView";
import PedidosPage from "./pages/pedidos/PedidosPage";
import PedidoCreate from "./pages/pedidos/PedidoCreate";
import PedidoEdit from "./pages/pedidos/PedidoEdit";
import PedidoView from "./pages/pedidos/PedidoView";
import IncidenciasPage from "./pages/incidencias/IncidenciasPage";
import IncidenciaCreate from "./pages/incidencias/IncidenciaCreate";
import IncidenciaEdit from "./pages/incidencias/IncidenciaEdit";
import IncidenciaView from "./pages/incidencias/IncidenciaView";
import IncidenciaSeguimientoPage from "./pages/incidencias/seguimiento/IncidenciaSeguimientoPage";
import EstadisticasPage from "./pages/estadisticas/EstadisticasPage";
import InformesPage from "./pages/informes/InformesPage";
import ConfiguracionPage from "./pages/configuracion/ConfiguracionPage";
import WooCommercePage from "./pages/integraciones/WooCommercePage";
// Import Gruas pages
import GruasPage from "./pages/gruas/index";
import GruaForm from "./pages/gruas/GruaForm";
import GruaDetailView from "./pages/gruas/GruaDetailView";
import NuevoMantenimientoPage from "./pages/gruas/[id]/mantenimientos/nuevo";
import NuevaGruaPage from "./pages/gruas/nueva";
import EditarGruaPage from "./pages/gruas/[id]/editar";

// Import Campas pages
import CampasPage from "./pages/campas/index";
import NuevaCampaPage from "./pages/campas/NuevaCampaPage";
import EditarCampaPage from "./pages/campas/EditarCampaPage";
import CampaDetailView from "./pages/campas/CampaDetailView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/caracteristicas" element={<CaracteristicasPage />} />
                <Route path="/precios" element={<PreciosPage />} />
                
                <Route path="/recambios" element={<RecambiosPage />} />
                <Route path="/recambios/:id" element={<RecambioDetallePage />} />
                
                {/* Rutas públicas de Vehículos de Origen */}
                <Route path="/catalogo/vehiculos" element={<VehiculosOrigenPage />} />
                <Route path="/catalogo/vehiculos/:id" element={<VehiculoDetallePage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Clientes */}
                <Route path="/clientes" element={
                  <ProtectedRoute>
                    <ClientesPage />
                  </ProtectedRoute>
                } />
                <Route path="/clientes/nuevo" element={
                  <ProtectedRoute>
                    <ClienteCreate />
                  </ProtectedRoute>
                } />
                <Route path="/clientes/:id/*" element={
                  <ProtectedRoute>
                    <ClienteView />
                  </ProtectedRoute>
                } />
                <Route path="/clientes/:id/editar" element={
                  <ProtectedRoute>
                    <ClienteEdit />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Vehículos */}
                <Route path="/vehiculos" element={
                  <ProtectedRoute>
                    <VehiculosPage />
                  </ProtectedRoute>
                } />
                <Route path="/vehiculos/nuevo" element={
                  <ProtectedRoute>
                    <VehiculoCreate />
                  </ProtectedRoute>
                } />
                <Route path="/vehiculos/:id/*" element={
                  <ProtectedRoute>
                    <VehiculoView />
                  </ProtectedRoute>
                } />
                <Route path="/vehiculos/:id/editar" element={
                  <ProtectedRoute>
                    <VehiculoEdit />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Piezas */}
                <Route path="/piezas" element={
                  <ProtectedRoute>
                    <PiezasPage />
                  </ProtectedRoute>
                } />
                <Route path="/piezas/nuevo" element={
                  <ProtectedRoute>
                    <PiezaCreate />
                  </ProtectedRoute>
                } />
                <Route path="/piezas/:id/*" element={
                  <ProtectedRoute>
                    <PiezaView />
                  </ProtectedRoute>
                } />
                <Route path="/piezas/:id/editar" element={
                  <ProtectedRoute>
                    <PiezaEdit />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Pedidos */}
                <Route path="/pedidos" element={
                  <ProtectedRoute>
                    <PedidosPage />
                  </ProtectedRoute>
                } />
                <Route path="/pedidos/nuevo" element={
                  <ProtectedRoute>
                    <PedidoCreate />
                  </ProtectedRoute>
                } />
                <Route path="/pedidos/:id" element={
                  <ProtectedRoute>
                    <PedidoView />
                  </ProtectedRoute>
                } />
                <Route path="/pedidos/:id/editar" element={
                  <ProtectedRoute>
                    <PedidoEdit />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Incidencias */}
                <Route path="/incidencias" element={
                  <ProtectedRoute>
                    <IncidenciasPage />
                  </ProtectedRoute>
                } />
                <Route path="/incidencias/nuevo" element={
                  <ProtectedRoute>
                    <IncidenciaCreate />
                  </ProtectedRoute>
                } />
                <Route path="/incidencias/:id" element={
                  <ProtectedRoute>
                    <IncidenciaView />
                  </ProtectedRoute>
                } />
                <Route path="/incidencias/:id/editar" element={
                  <ProtectedRoute>
                    <IncidenciaEdit />
                  </ProtectedRoute>
                } />
                <Route path="/incidencias/:id/seguimiento" element={
                  <ProtectedRoute>
                    <IncidenciaSeguimientoPage />
                  </ProtectedRoute>
                } />
                
                {/* Otras páginas principales */}
                <Route path="/estadisticas" element={
                  <ProtectedRoute>
                    <EstadisticasPage />
                  </ProtectedRoute>
                } />
                <Route path="/informes" element={
                  <ProtectedRoute>
                    <InformesPage />
                  </ProtectedRoute>
                } />
                <Route path="/configuracion" element={
                  <ProtectedRoute requiredRole="admin">
                    <ConfiguracionPage />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Integraciones */}
                <Route path="/integraciones/woocommerce" element={
                  <ProtectedRoute requiredRole="admin">
                    <WooCommercePage />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de Grúas */}
                <Route path="/gruas" element={
                  <ProtectedRoute>
                    <GruasPage />
                  </ProtectedRoute>
                } />
                <Route path="/gruas/nueva" element={
                  <ProtectedRoute>
                    <NuevaGruaPage />
                  </ProtectedRoute>
                } />
                <Route path="/gruas/:id" element={
                  <ProtectedRoute>
                    <GruaDetailView />
                  </ProtectedRoute>
                } />
                <Route path="/gruas/:id/editar" element={
                  <ProtectedRoute>
                    <EditarGruaPage />
                  </ProtectedRoute>
                } />
                <Route path="/gruas/:id/mantenimientos/nuevo" element={
                  <ProtectedRoute>
                    <NuevoMantenimientoPage />
                  </ProtectedRoute>
                } />

                {/* Rutas de Campas */}
                <Route path="/campas" element={
                  <ProtectedRoute>
                    <CampasPage />
                  </ProtectedRoute>
                } />
                <Route path="/campas/nueva" element={
                  <ProtectedRoute>
                    <NuevaCampaPage />
                  </ProtectedRoute>
                } />
                <Route path="/campas/:id" element={
                  <ProtectedRoute>
                    <CampaDetailView />
                  </ProtectedRoute>
                } />
                <Route path="/campas/:id/editar" element={
                  <ProtectedRoute>
                    <EditarCampaPage />
                  </ProtectedRoute>
                } />
                
                {/* Ruta 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
