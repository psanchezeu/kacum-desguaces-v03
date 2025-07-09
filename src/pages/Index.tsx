
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useSidebar } from "@/contexts/SidebarContext";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import VehicleList from "@/components/vehicles/VehicleList";
import PartsList from "@/components/parts/PartsList";
import ClientsList from "@/components/clients/ClientsList";
import { Car, Box, Users, ShoppingCart, AlertTriangle, Loader2 } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { vehiculosService } from "@/services/vehiculosService";
import { piezasService } from "@/services/piezasService";
import { clientesService } from "@/services/clientesService";
import { DashboardStats, ActivityItem, Vehiculo, Pieza, Cliente } from "@/types";

const Index = () => {
  const { collapsed } = useSidebar();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>({
    vehiculosTotal: 0,
    piezasDisponibles: 0,
    piezasVendidas: 0,
    clientesActivos: 0,
    ventasMes: 0,
    incidenciasAbiertas: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los datos necesarios en paralelo
        const [
          dashboardStats,
          recentActivity,
          vehiculosData,
          piezasData,
          clientesData
        ] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(),
          vehiculosService.getAll(),
          piezasService.getAll(),
          clientesService.getAll()
        ]);

        // Actualizar el estado con los datos obtenidos
        setStats(dashboardStats);
        setActivities(recentActivity);
        
        // Extraer los datos de las respuestas paginadas para vehículos y piezas
        const vehiculos = vehiculosData.data || [];
        const piezas = piezasData.data || [];
        
        // Los clientes ya vienen como array directamente
        
        setVehiculos(vehiculos.slice(0, 5)); // Mostrar solo los 5 primeros vehículos
        setPiezas(piezas.slice(0, 5)); // Mostrar solo las 5 primeras piezas
        setClientes(clientesData.slice(0, 5)); // Mostrar solo los 5 primeros clientes
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-16 md:ml-64'}`}>
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Panel de Control</h1>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando datos del dashboard...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard 
                  title="Vehículos en Proceso" 
                  value={stats.vehiculosTotal} 
                  icon={Car} 
                  trend={{ value: 5, positive: true }}
                />
                <StatsCard 
                  title="Piezas Disponibles" 
                  value={stats.piezasDisponibles} 
                  icon={Box} 
                  trend={{ value: 5, positive: true }}
                />
                <StatsCard 
                  title="Clientes Activos" 
                  value={stats.clientesActivos} 
                  icon={Users} 
                  trend={{ value: 3, positive: true }}
                />
                <StatsCard 
                  title="Ventas este Mes (€)" 
                  value={stats.ventasMes.toLocaleString('es-ES')} 
                  icon={ShoppingCart} 
                  trend={{ value: 10, positive: true }}
                />
                <StatsCard 
                  title="Piezas Vendidas" 
                  value={stats.piezasVendidas} 
                  icon={Box}
                  trend={{ value: 7, positive: true }}
                />
                <StatsCard 
                  title="Incidencias Abiertas" 
                  value={stats.incidenciasAbiertas} 
                  icon={AlertTriangle} 
                  trend={{ value: 0, positive: true }}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <VehicleList vehicles={vehiculos} />
                </div>
                <div>
                  <RecentActivity activities={activities} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PartsList parts={piezas} />
                <ClientsList clients={clientes} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
