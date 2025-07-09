import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { woocommerceService, WooCommerceConfig } from "@/services/woocommerceService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WooCommerceConfigTabProps {
  onConfigSaved?: () => void;
}

const WooCommerceConfigTab: React.FC<WooCommerceConfigTabProps> = ({ onConfigSaved }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: ""
  });

  const [config, setConfig] = useState<WooCommerceConfig>({
    url: "",
    consumer_key: "",
    consumer_secret: "",
    version: "wc/v3"
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await woocommerceService.getConfig();
        if (data) {
          setConfig(data);
        }
      } catch (error) {
        console.error("Error al cargar la configuración de WooCommerce:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de WooCommerce. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Resetear el estado de la conexión cuando se cambia algún parámetro
    setConnectionStatus({
      tested: false,
      success: false,
      message: ""
    });
  };

  // Probar la conexión con WooCommerce
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const result = await woocommerceService.testConnection(config);
      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.message
      });
      
      toast({
        title: result.success ? "Conexión exitosa" : "Error de conexión",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error al probar la conexión con WooCommerce:", error);
      setConnectionStatus({
        tested: true,
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al conectar con WooCommerce"
      });
      
      toast({
        title: "Error",
        description: "No se pudo probar la conexión con WooCommerce. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await woocommerceService.saveConfig(config);
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de WooCommerce se ha guardado correctamente."
      });
      
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error("Error al guardar la configuración de WooCommerce:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de WooCommerce</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de WooCommerce</CardTitle>
        <CardDescription>
          Configure la conexión con su tienda WooCommerce para importar productos como piezas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL de la tienda WooCommerce</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://mitienda.com"
              value={config.url}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer_key">Consumer Key</Label>
            <Input
              id="consumer_key"
              name="consumer_key"
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.consumer_key}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer_secret">Consumer Secret</Label>
            <Input
              id="consumer_secret"
              name="consumer_secret"
              type="password"
              placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.consumer_secret}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Versión de la API</Label>
            <Input
              id="version"
              name="version"
              placeholder="wc/v3"
              value={config.version}
              onChange={handleInputChange}
            />
          </div>

          {connectionStatus.tested && (
            <Alert variant={connectionStatus.success ? "default" : "destructive"} className="mt-4">
              {connectionStatus.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {connectionStatus.success ? "Conexión exitosa" : "Error de conexión"}
              </AlertTitle>
              <AlertDescription>{connectionStatus.message}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Para obtener las credenciales de la API de WooCommerce, vaya al panel de administración de WordPress, 
              luego a WooCommerce &gt; Ajustes &gt; Avanzado &gt; API REST y cree una nueva clave.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || isSaving || !config.url || !config.consumer_key || !config.consumer_secret}
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Probando...
              </>
            ) : (
              "Probar Conexión"
            )}
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving || !config.url || !config.consumer_key || !config.consumer_secret}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Configuración"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WooCommerceConfigTab;
