
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Eye,
  ShoppingCart,
  FileText 
} from "lucide-react";

interface LogSincronizacion {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'woocommerce' | 'facturascripts';
  conexion: string;
  accion: 'sincronizacion_productos' | 'sincronizacion_clientes' | 'sincronizacion_pedidos';
  estado: 'exitoso' | 'error' | 'en_progreso';
  elementosProcesados: number;
  elementosError: number;
  duracion: string;
  mensaje?: string;
}

const LogsSincronizacion: React.FC = () => {
  // Datos de ejemplo
  const logs: LogSincronizacion[] = [
    {
      id: '1',
      fecha: '2024-01-17',
      hora: '14:30:15',
      tipo: 'woocommerce',
      conexion: 'Tienda Principal WooCommerce',
      accion: 'sincronizacion_productos',
      estado: 'exitoso',
      elementosProcesados: 245,
      elementosError: 0,
      duracion: '2m 15s'
    },
    {
      id: '2',
      fecha: '2024-01-17',
      hora: '12:15:30',
      tipo: 'facturascripts',
      conexion: 'Sistema Contable FS',
      accion: 'sincronizacion_clientes',
      estado: 'error',
      elementosProcesados: 50,
      elementosError: 5,
      duracion: '45s',
      mensaje: 'Error de autenticación en la API'
    },
    {
      id: '3',
      fecha: '2024-01-17',
      hora: '10:00:00',
      tipo: 'woocommerce',
      conexion: 'Tienda Principal WooCommerce',
      accion: 'sincronizacion_pedidos',
      estado: 'exitoso',
      elementosProcesados: 18,
      elementosError: 0,
      duracion: '30s'
    },
    {
      id: '4',
      fecha: '2024-01-16',
      hora: '18:45:22',
      tipo: 'facturascripts',
      conexion: 'Sistema Contable FS',
      accion: 'sincronizacion_productos',
      estado: 'en_progreso',
      elementosProcesados: 150,
      elementosError: 0,
      duracion: '1m 30s'
    }
  ];

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'woocommerce':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      case 'facturascripts':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'exitoso':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Exitoso
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      case 'en_progreso':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            En Progreso
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getAccionTexto = (accion: string) => {
    switch (accion) {
      case 'sincronizacion_productos':
        return 'Sincronización de Productos';
      case 'sincronizacion_clientes':
        return 'Sincronización de Clientes';
      case 'sincronizacion_pedidos':
        return 'Sincronización de Pedidos';
      default:
        return 'Sincronización';
    }
  };

  const handleVerDetalles = (logId: string) => {
    console.log('Ver detalles del log:', logId);
    // Aquí implementarías la lógica para mostrar detalles del log
  };

  const handleDescargarLog = (logId: string) => {
    console.log('Descargar log:', logId);
    // Aquí implementarías la lógica para descargar el log
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay logs de sincronización</h3>
          <p className="text-muted-foreground text-center">
            Los logs de sincronización aparecerán aquí una vez que comiences a sincronizar datos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getIconByTipo(log.tipo)}
                <div>
                  <h4 className="font-medium">{getAccionTexto(log.accion)}</h4>
                  <p className="text-sm text-muted-foreground">{log.conexion}</p>
                </div>
              </div>
              {getEstadoBadge(log.estado)}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mb-3">
              <div>
                <p className="font-medium">Fecha</p>
                <p className="text-muted-foreground">{log.fecha}</p>
              </div>
              <div>
                <p className="font-medium">Hora</p>
                <p className="text-muted-foreground">{log.hora}</p>
              </div>
              <div>
                <p className="font-medium">Procesados</p>
                <p className="text-muted-foreground">{log.elementosProcesados}</p>
              </div>
              <div>
                <p className="font-medium">Errores</p>
                <p className="text-muted-foreground">{log.elementosError}</p>
              </div>
              <div>
                <p className="font-medium">Duración</p>
                <p className="text-muted-foreground">{log.duracion}</p>
              </div>
              <div>
                <p className="font-medium">Tipo</p>
                <p className="text-muted-foreground capitalize">{log.tipo}</p>
              </div>
            </div>
            
            {log.mensaje && (
              <div className="mb-3 p-2 bg-muted rounded text-sm">
                <span className="font-medium">Mensaje: </span>
                {log.mensaje}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleVerDetalles(log.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDescargarLog(log.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LogsSincronizacion;
