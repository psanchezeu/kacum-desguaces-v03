
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Trash2,
  RefreshCw,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Conexion {
  id: string;
  tipo: 'woocommerce' | 'facturascripts';
  nombre: string;
  url: string;
  estado: 'activa' | 'inactiva' | 'error';
  ultimaSincronizacion: string;
  elementosSincronizados: number;
  credenciales?: {
    consumerKey?: string;
    consumerSecret?: string;
    apiKey?: string;
    usuario?: string;
    password?: string;
  };
}

interface ConexionesActivasProps {
  conexiones: Conexion[];
  onEliminarConexion: (id: string) => void;
  onEditarConexion: (conexion: Conexion) => void;
}

const ConexionesActivas: React.FC<ConexionesActivasProps> = ({ 
  conexiones, 
  onEliminarConexion, 
  onEditarConexion 
}) => {
  const { toast } = useToast();
  const [sincronizando, setSincronizando] = useState<string | null>(null);

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'woocommerce':
        return <ShoppingCart className="h-5 w-5 text-purple-600" />;
      case 'facturascripts':
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Activa</Badge>;
      case 'inactiva':
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" />Inactiva</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Error</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const handleSincronizarAhora = async (conexionId: string) => {
    setSincronizando(conexionId);
    console.log('Iniciando sincronización para conexión:', conexionId);
    
    try {
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sincronización completada",
        description: "Los datos se han sincronizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error en sincronización",
        description: "No se pudo completar la sincronización.",
        variant: "destructive",
      });
    } finally {
      setSincronizando(null);
    }
  };

  const handleEliminarConexion = (conexionId: string) => {
    console.log('Eliminando conexión:', conexionId);
    onEliminarConexion(conexionId);
    toast({
      title: "Conexión eliminada",
      description: "La conexión se ha eliminado correctamente.",
    });
  };

  const handleVerDetalles = (conexionId: string) => {
    console.log('Ver detalles de conexión:', conexionId);
    const conexion = conexiones.find(c => c.id === conexionId);
    if (conexion) {
      toast({
        title: "Detalles de conexión",
        description: `${conexion.nombre} - ${conexion.url}`,
      });
    }
  };

  const handleConfigurar = (conexionId: string) => {
    const conexion = conexiones.find(c => c.id === conexionId);
    if (conexion) {
      onEditarConexion(conexion);
    }
  };

  if (conexiones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay conexiones configuradas</h3>
          <p className="text-muted-foreground text-center mb-4">
            Añade tu primera conexión con WooCommerce o FacturaScripts para comenzar a sincronizar datos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conexiones.map((conexion) => (
        <Card key={conexion.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIconByTipo(conexion.tipo)}
                <div>
                  <CardTitle className="text-lg">{conexion.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">{conexion.url}</p>
                </div>
              </div>
              {getEstadoBadge(conexion.estado)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium">Última Sincronización</p>
                <p className="text-xs text-muted-foreground">{conexion.ultimaSincronizacion}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Elementos Sincronizados</p>
                <p className="text-xs text-muted-foreground">{conexion.elementosSincronizados.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tipo de Sistema</p>
                <p className="text-xs text-muted-foreground capitalize">{conexion.tipo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estado de Conexión</p>
                <p className="text-xs text-muted-foreground capitalize">{conexion.estado}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => handleSincronizarAhora(conexion.id)}
                disabled={conexion.estado === 'error' || sincronizando === conexion.id}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${sincronizando === conexion.id ? 'animate-spin' : ''}`} />
                {sincronizando === conexion.id ? 'Sincronizando...' : 'Sincronizar Ahora'}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleVerDetalles(conexion.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleConfigurar(conexion.id)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleEliminarConexion(conexion.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConexionesActivas;
