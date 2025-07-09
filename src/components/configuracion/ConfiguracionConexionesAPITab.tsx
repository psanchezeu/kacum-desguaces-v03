import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle, X, Eye, EyeOff, RefreshCw, Info } from "lucide-react";
import { configuracionService, ConfiguracionConexionesAPI } from "@/services/configuracionService";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ConfiguracionConexionesAPITab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [newIP, setNewIP] = useState<string>("");
  const [newEndpoint, setNewEndpoint] = useState<string>("");
  const [config, setConfig] = useState<ConfiguracionConexionesAPI>({
    api_key_activa: false,
    api_key: "",
    limite_peticiones_por_minuto: 60,
    ips_permitidas: [],
    endpoints_habilitados: []
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("conexiones");
        if (data) {
          setConfig({
            api_key_activa: data.api_key_activa ?? false,
            api_key: data.api_key ?? "",
            limite_peticiones_por_minuto: data.limite_peticiones_por_minuto ?? 60,
            ips_permitidas: data.ips_permitidas ?? [],
            endpoints_habilitados: data.endpoints_habilitados ?? []
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de conexiones API:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de conexiones API. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionConexionesAPI, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Manejar cambios en los inputs de texto
  const handleTextChange = (key: keyof ConfiguracionConexionesAPI, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Manejar cambios en los inputs numéricos
  const handleNumberChange = (key: keyof ConfiguracionConexionesAPI, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  // Añadir nueva IP permitida
  const handleAddIP = () => {
    // Validación básica de IP (podría mejorarse con regex más preciso)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (newIP.trim() && ipRegex.test(newIP.trim()) && !config.ips_permitidas.includes(newIP.trim())) {
      setConfig(prev => ({
        ...prev,
        ips_permitidas: [...prev.ips_permitidas, newIP.trim()]
      }));
      setNewIP("");
    } else if (config.ips_permitidas.includes(newIP.trim())) {
      toast({
        title: "IP duplicada",
        description: "Esta IP ya existe en la lista.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "IP inválida",
        description: "Por favor, ingrese una dirección IP válida.",
        variant: "destructive"
      });
    }
  };

  // Eliminar IP permitida
  const handleRemoveIP = (ip: string) => {
    setConfig(prev => ({
      ...prev,
      ips_permitidas: prev.ips_permitidas.filter(i => i !== ip)
    }));
  };

  // Añadir nuevo endpoint
  const handleAddEndpoint = () => {
    if (newEndpoint.trim() && !config.endpoints_habilitados.includes(newEndpoint.trim())) {
      setConfig(prev => ({
        ...prev,
        endpoints_habilitados: [...prev.endpoints_habilitados, newEndpoint.trim()]
      }));
      setNewEndpoint("");
    } else if (config.endpoints_habilitados.includes(newEndpoint.trim())) {
      toast({
        title: "Endpoint duplicado",
        description: "Este endpoint ya existe en la lista.",
        variant: "destructive"
      });
    }
  };

  // Eliminar endpoint
  const handleRemoveEndpoint = (endpoint: string) => {
    setConfig(prev => ({
      ...prev,
      endpoints_habilitados: prev.endpoints_habilitados.filter(e => e !== endpoint)
    }));
  };

  // Generar nueva API key
  const generateApiKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    setConfig(prev => ({
      ...prev,
      api_key: result
    }));
    
    setShowApiKey(true);
    
    toast({
      title: "API Key generada",
      description: "Se ha generado una nueva API Key. Asegúrese de guardar los cambios."
    });
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveConexionesAPI(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de conexiones API se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de conexiones API:", error);
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
          <CardTitle>Configuración de Conexiones API</CardTitle>
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
        <CardTitle>Configuración de Conexiones API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="api-key-activa" 
                checked={config.api_key_activa} 
                onCheckedChange={(checked) => handleSwitchChange('api_key_activa', checked)} 
              />
              <Label htmlFor="api-key-activa">Habilitar API Key</Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Activa la autenticación mediante API Key para acceder a los endpoints de la API.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input 
                  id="api-key" 
                  type={showApiKey ? "text" : "password"} 
                  value={config.api_key} 
                  onChange={(e) => handleTextChange('api_key', e.target.value)} 
                  disabled={!config.api_key_activa}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={!config.api_key_activa}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                type="button" 
                size="icon"
                onClick={generateApiKey}
                disabled={!config.api_key_activa}
                title="Generar nueva API Key"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limite-peticiones">Límite de peticiones por minuto</Label>
            <Input 
              id="limite-peticiones" 
              type="number" 
              min={1}
              max={1000}
              value={config.limite_peticiones_por_minuto} 
              onChange={(e) => handleNumberChange('limite_peticiones_por_minuto', e.target.value)} 
              disabled={!config.api_key_activa}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ips-permitidas">IPs permitidas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {config.ips_permitidas.length > 0 ? (
                config.ips_permitidas.map((ip) => (
                  <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                    {ip}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => handleRemoveIP(ip)}
                      disabled={!config.api_key_activa}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Sin restricción de IPs (todas permitidas)</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Input 
                id="nueva-ip" 
                placeholder="Añadir IP (ej: 192.168.1.1)" 
                value={newIP} 
                onChange={(e) => setNewIP(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddIP()}
                disabled={!config.api_key_activa}
              />
              <Button 
                type="button" 
                size="icon"
                onClick={handleAddIP}
                disabled={!config.api_key_activa}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoints-habilitados">Endpoints habilitados</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {config.endpoints_habilitados.length > 0 ? (
                config.endpoints_habilitados.map((endpoint) => (
                  <Badge key={endpoint} variant="secondary" className="flex items-center gap-1">
                    {endpoint}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                      onClick={() => handleRemoveEndpoint(endpoint)}
                      disabled={!config.api_key_activa}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Sin restricción de endpoints (todos permitidos)</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Input 
                id="nuevo-endpoint" 
                placeholder="Añadir endpoint (ej: /api/vehiculos)" 
                value={newEndpoint} 
                onChange={(e) => setNewEndpoint(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddEndpoint()}
                disabled={!config.api_key_activa}
              />
              <Button 
                type="button" 
                size="icon"
                onClick={handleAddEndpoint}
                disabled={!config.api_key_activa}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionConexionesAPITab;
