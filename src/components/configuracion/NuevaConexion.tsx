import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
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

interface NuevaConexionProps {
  onClose: () => void;
  onGuardarConexion: (conexion: Omit<Conexion, 'id' | 'ultimaSincronizacion' | 'elementosSincronizados'>) => void;
  conexionEditando?: Conexion | null;
}

const NuevaConexion: React.FC<NuevaConexionProps> = ({ onClose, onGuardarConexion, conexionEditando }) => {
  const { toast } = useToast();
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'woocommerce' | 'facturascripts' | null>(
    conexionEditando?.tipo || null
  );
  const [probandoConexion, setProbandoConexion] = useState(false);
  const [estadoConexion, setEstadoConexion] = useState<'success' | 'error' | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: conexionEditando?.nombre || '',
    url: conexionEditando?.url || '',
    consumerKey: conexionEditando?.credenciales?.consumerKey || '',
    consumerSecret: conexionEditando?.credenciales?.consumerSecret || '',
    apiKey: conexionEditando?.credenciales?.apiKey || '',
    usuario: conexionEditando?.credenciales?.usuario || '',
    password: conexionEditando?.credenciales?.password || ''
  });

  useEffect(() => {
    if (conexionEditando) {
      setTipoSeleccionado(conexionEditando.tipo);
      setFormData({
        nombre: conexionEditando.nombre,
        url: conexionEditando.url,
        consumerKey: conexionEditando.credenciales?.consumerKey || '',
        consumerSecret: conexionEditando.credenciales?.consumerSecret || '',
        apiKey: conexionEditando.credenciales?.apiKey || '',
        usuario: conexionEditando.credenciales?.usuario || '',
        password: conexionEditando.credenciales?.password || ''
      });
    }
  }, [conexionEditando]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const probarConexion = async () => {
    if (!tipoSeleccionado) return;
    
    setProbandoConexion(true);
    setEstadoConexion(null);
    
    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validar campos requeridos
      if (!formData.url || !formData.nombre) {
        throw new Error('Faltan campos requeridos');
      }

      if (tipoSeleccionado === 'woocommerce' && (!formData.consumerKey || !formData.consumerSecret)) {
        throw new Error('Consumer Key y Consumer Secret son requeridos para WooCommerce');
      }

      if (tipoSeleccionado === 'facturascripts' && !formData.apiKey) {
        throw new Error('API Key es requerida para FacturaScripts');
      }
      
      // Simular éxito/fallo
      const exito = Math.random() > 0.2;
      
      if (exito) {
        setEstadoConexion('success');
        toast({
          title: "Conexión exitosa",
          description: "La conexión se ha establecido correctamente.",
        });
      } else {
        setEstadoConexion('error');
        toast({
          title: "Error de conexión",
          description: "No se pudo establecer la conexión. Verifica las credenciales.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setEstadoConexion('error');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al probar la conexión.",
        variant: "destructive",
      });
    } finally {
      setProbandoConexion(false);
    }
  };

  const guardarConexion = () => {
    if (estadoConexion !== 'success') {
      toast({
        title: "Error",
        description: "Primero debes probar la conexión exitosamente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tipoSeleccionado) return;

    const nuevaConexion = {
      tipo: tipoSeleccionado,
      nombre: formData.nombre,
      url: formData.url,
      estado: 'activa' as const,
      credenciales: {
        consumerKey: formData.consumerKey,
        consumerSecret: formData.consumerSecret,
        apiKey: formData.apiKey,
        usuario: formData.usuario,
        password: formData.password
      }
    };
    
    console.log('Guardando conexión:', nuevaConexion);
    onGuardarConexion(nuevaConexion);
    
    toast({
      title: conexionEditando ? "Conexión actualizada" : "Conexión guardada",
      description: "La conexión se ha configurado correctamente.",
    });
    
    onClose();
  };

  const renderFormularioWooCommerce = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="woo-nombre">Nombre de la Conexión</Label>
        <Input
          id="woo-nombre"
          placeholder="Ej: Tienda Principal WooCommerce"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="woo-url">URL de la Tienda</Label>
        <Input
          id="woo-url"
          placeholder="https://mitienda.com"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="woo-consumer-key">Consumer Key</Label>
        <Input
          id="woo-consumer-key"
          type="password"
          placeholder="ck_xxxxxxxxxxxxxxxx"
          value={formData.consumerKey}
          onChange={(e) => handleInputChange('consumerKey', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="woo-consumer-secret">Consumer Secret</Label>
        <Input
          id="woo-consumer-secret"
          type="password"
          placeholder="cs_xxxxxxxxxxxxxxxx"
          value={formData.consumerSecret}
          onChange={(e) => handleInputChange('consumerSecret', e.target.value)}
        />
      </div>
    </div>
  );

  const renderFormularioFacturaScripts = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fs-nombre">Nombre de la Conexión</Label>
        <Input
          id="fs-nombre"
          placeholder="Ej: Sistema Contable FacturaScripts"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fs-url">URL Base</Label>
        <Input
          id="fs-url"
          placeholder="https://facturacion.miempresa.com"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fs-api-key">API Key</Label>
        <Input
          id="fs-api-key"
          type="password"
          placeholder="API Key de FacturaScripts"
          value={formData.apiKey}
          onChange={(e) => handleInputChange('apiKey', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fs-usuario">Usuario (opcional)</Label>
          <Input
            id="fs-usuario"
            placeholder="usuario"
            value={formData.usuario}
            onChange={(e) => handleInputChange('usuario', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fs-password">Contraseña (opcional)</Label>
          <Input
            id="fs-password"
            type="password"
            placeholder="contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{conexionEditando ? 'Editar Conexión' : 'Nueva Conexión API'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!tipoSeleccionado ? (
          <div>
            <Label className="text-base font-medium mb-4 block">Selecciona el tipo de conexión:</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => setTipoSeleccionado('woocommerce')}
              >
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <span>WooCommerce</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => setTipoSeleccionado('facturascripts')}
              >
                <FileText className="h-8 w-8 text-blue-600" />
                <span>FacturaScripts</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {tipoSeleccionado === 'woocommerce' ? (
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600" />
              )}
              <h3 className="text-lg font-medium capitalize">
                {conexionEditando ? 'Editar' : 'Configurar'} {tipoSeleccionado}
              </h3>
            </div>
            
            {tipoSeleccionado === 'woocommerce' ? 
              renderFormularioWooCommerce() : 
              renderFormularioFacturaScripts()
            }
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={probarConexion} 
                disabled={probandoConexion || !formData.url}
                variant="outline"
              >
                {probandoConexion ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : estadoConexion === 'success' ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                ) : estadoConexion === 'error' ? (
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                ) : null}
                Probar Conexión
              </Button>
              
              {estadoConexion && (
                <span className={`text-sm ${estadoConexion === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {estadoConexion === 'success' ? 'Conexión exitosa' : 'Error de conexión'}
                </span>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setTipoSeleccionado(null)}>
                Volver
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={guardarConexion}
                  disabled={estadoConexion !== 'success'}
                >
                  {conexionEditando ? 'Actualizar Conexión' : 'Guardar Conexión'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NuevaConexion;
