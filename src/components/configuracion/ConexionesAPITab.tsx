import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Plug, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConexionesActivas from "./ConexionesActivas";
import NuevaConexion from "./NuevaConexion";
import LogsSincronizacion from "./LogsSincronizacion";

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

const ConexionesAPITab: React.FC = () => {
  const [showNuevaConexion, setShowNuevaConexion] = useState(false);
  const [conexionEditando, setConexionEditando] = useState<Conexion | null>(null);
  const [conexiones, setConexiones] = useState<Conexion[]>([
    {
      id: '1',
      tipo: 'woocommerce',
      nombre: 'Tienda Principal WooCommerce',
      url: 'https://mitienda.com',
      estado: 'activa',
      ultimaSincronizacion: '2024-01-17 14:30:00',
      elementosSincronizados: 1250,
      credenciales: {
        consumerKey: 'ck_***',
        consumerSecret: 'cs_***'
      }
    },
    {
      id: '2',
      tipo: 'facturascripts',
      nombre: 'Sistema Contable FS',
      url: 'https://facturacion.miempresa.com',
      estado: 'inactiva',
      ultimaSincronizacion: '2024-01-16 09:15:00',
      elementosSincronizados: 850,
      credenciales: {
        apiKey: 'api_***'
      }
    }
  ]);

  const handleGuardarConexion = (nuevaConexion: Omit<Conexion, 'id' | 'ultimaSincronizacion' | 'elementosSincronizados'>) => {
    if (conexionEditando) {
      // Actualizar conexión existente
      setConexiones(prev => prev.map(conn => 
        conn.id === conexionEditando.id 
          ? {
              ...conn,
              ...nuevaConexion,
              ultimaSincronizacion: new Date().toLocaleString()
            }
          : conn
      ));
      setConexionEditando(null);
    } else {
      // Crear nueva conexión
      const conexion: Conexion = {
        ...nuevaConexion,
        id: Date.now().toString(),
        ultimaSincronizacion: new Date().toLocaleString(),
        elementosSincronizados: 0
      };
      setConexiones(prev => [...prev, conexion]);
    }
    setShowNuevaConexion(false);
  };

  const handleEliminarConexion = (id: string) => {
    setConexiones(prev => prev.filter(conn => conn.id !== id));
  };

  const handleEditarConexion = (conexion: Conexion) => {
    setConexionEditando(conexion);
    setShowNuevaConexion(true);
  };

  const handleCerrarFormulario = () => {
    setShowNuevaConexion(false);
    setConexionEditando(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Conexiones API e Integraciones
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura aquí las conexiones con tus sistemas externos como WooCommerce o FacturaScripts para sincronizar productos, clientes y pedidos.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="conexiones" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conexiones">Conexiones Activas</TabsTrigger>
              <TabsTrigger value="logs">Logs de Sincronización</TabsTrigger>
              <TabsTrigger value="configuracion">Configuración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conexiones" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Conexiones Configuradas</h3>
                <Button onClick={() => setShowNuevaConexion(!showNuevaConexion)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Conexión
                </Button>
              </div>
              
              {showNuevaConexion && (
                <NuevaConexion 
                  onClose={handleCerrarFormulario} 
                  onGuardarConexion={handleGuardarConexion}
                  conexionEditando={conexionEditando}
                />
              )}
              
              <ConexionesActivas 
                conexiones={conexiones}
                onEliminarConexion={handleEliminarConexion}
                onEditarConexion={handleEditarConexion}
              />
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historial de Sincronizaciones</h3>
                <Button variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Exportar Logs
                </Button>
              </div>
              
              <LogsSincronizacion />
            </TabsContent>
            
            <TabsContent value="configuracion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Sincronización</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frecuencia de Sincronización Automática</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="manual">Manual</option>
                      <option value="1h">Cada hora</option>
                      <option value="6h">Cada 6 horas</option>
                      <option value="12h">Cada 12 horas</option>
                      <option value="24h">Cada 24 horas</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Sincronización Bidireccional</label>
                      <p className="text-xs text-muted-foreground">
                        Permite que los cambios se sincronicen en ambas direcciones
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Notificar Errores de Sincronización</label>
                      <p className="text-xs text-muted-foreground">
                        Recibir alertas cuando falle una sincronización
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Button>Guardar Configuración</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConexionesAPITab;
