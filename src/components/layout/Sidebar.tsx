
import React, { useState, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { 
  Home, 
  Car, 
  Box, 
  Users, 
  ShoppingCart, 
  FileText, 
  ArrowLeft,
  ArrowRight,
  Settings,
  BarChart2,
  AlertTriangle,
  Link as LinkIcon,
  Loader2,
  Truck,
  Warehouse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { configuracionService, ConfiguracionGeneral } from "@/services/configuracionService";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  path,
  collapsed = false,
}) => {
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center justify-start w-full gap-3 p-3 rounded-lg",
        isActive 
          ? "bg-sidebar-accent text-black dark:text-black font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:bg-opacity-70"
      )}
      asChild
    >
      <Link to={path}>
        <Icon size={20} />
        {!collapsed && <span>{label}</span>}
      </Link>
    </Button>
  );
};

const Sidebar: React.FC = () => {
  const { collapsed, setCollapsed } = useSidebar();
  const [configuracion, setConfiguracion] = useState<ConfiguracionGeneral | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        setIsLoading(true);
        const config = await configuracionService.getByCategoria('general') as ConfiguracionGeneral;
        setConfiguracion(config);
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfiguracion();
  }, []);

  return (
    <div 
      className={cn(
        "bg-sidebar h-screen fixed top-0 left-0 flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            {configuracion?.logo_url ? (
              <img 
                src={configuracion.logo_url.startsWith('http') ? configuracion.logo_url : `${window.location.origin}${configuracion.logo_url}`} 
                alt="Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  console.error('Error al cargar el logo:', e);
                  // Mostrar iniciales como fallback
                  e.currentTarget.style.display = 'none';
                  // Intentar con ruta absoluta si la URL es relativa
                  if (!configuracion.logo_url.startsWith('http') && !configuracion.logo_url.startsWith('/')) {
                    e.currentTarget.src = `/${configuracion.logo_url}`;
                    e.currentTarget.style.display = '';
                  }
                }}
              />
            ) : isLoading ? (
              <Loader2 className="h-5 w-5 text-yellow-400 dark:text-yellow-400 animate-spin" />
            ) : null}
            <span className="text-yellow-400 dark:text-yellow-400 font-bold text-xl truncate">
              {configuracion?.nombre_empresa || "Kacum Desguaces"}
            </span>
          </div>
        ) : configuracion?.logo_url ? (
          <img 
            src={configuracion.logo_url.startsWith('http') ? configuracion.logo_url : `${window.location.origin}${configuracion.logo_url}`} 
            alt="Logo" 
            className="h-8 w-8 object-contain mx-auto"
            onError={(e) => {
              console.error('Error al cargar el logo en modo colapsado:', e);
              // Intentar con ruta absoluta si la URL es relativa
              if (!configuracion.logo_url.startsWith('http') && !configuracion.logo_url.startsWith('/')) {
                e.currentTarget.src = `/${configuracion.logo_url}`;
              } else {
                // Si sigue fallando, ocultar la imagen
                e.currentTarget.style.display = 'none';
              }
            }}
          />
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-sidebar-accent"
        >
          {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </Button>
      </div>

      <div className="mt-6 px-3 space-y-2 flex-1">
        <SidebarItem 
          icon={Home} 
          label="Dashboard" 
          path="/dashboard" 
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={Car} 
          label="Vehículos" 
          path="/vehiculos"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={Box} 
          label="Piezas" 
          path="/piezas"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={Users} 
          label="Clientes" 
          path="/clientes"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={ShoppingCart} 
          label="Pedidos" 
          path="/pedidos"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={AlertTriangle} 
          label="Incidencias" 
          path="/incidencias"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={Truck} 
          label="Grúas" 
          path="/gruas"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={Warehouse} 
          label="Campas" 
          path="/campas"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={FileText} 
          label="Informes" 
          path="/informes"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={BarChart2} 
          label="Estadísticas" 
          path="/estadisticas"
          collapsed={collapsed}
        />
      </div>

      <div className="mt-auto p-3 space-y-2">
        <SidebarItem 
          icon={LinkIcon} 
          label="Integraciones" 
          path="/integraciones/woocommerce"
          collapsed={collapsed}
        />
        <SidebarItem 
          icon={Settings} 
          label="Configuración" 
          path="/configuracion"
          collapsed={collapsed}
        />
      </div>
    </div>
  );
};

export default Sidebar;
