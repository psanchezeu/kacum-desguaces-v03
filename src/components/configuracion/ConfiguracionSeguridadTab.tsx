import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Info } from "lucide-react";
import { configuracionService, ConfiguracionSeguridad } from "@/services/configuracionService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ConfiguracionSeguridadTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfiguracionSeguridad>({
    autenticacion_doble_factor: false,
    longitud_minima_password: 8,
    requiere_mayusculas: true,
    requiere_numeros: true,
    requiere_simbolos: false,
    dias_caducidad_password: 90,
    intentos_maximos_login: 5,
    tiempo_bloqueo_minutos: 15
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("seguridad");
        if (data) {
          setConfig({
            autenticacion_doble_factor: data.autenticacion_doble_factor ?? false,
            longitud_minima_password: data.longitud_minima_password ?? 8,
            requiere_mayusculas: data.requiere_mayusculas ?? true,
            requiere_numeros: data.requiere_numeros ?? true,
            requiere_simbolos: data.requiere_simbolos ?? false,
            dias_caducidad_password: data.dias_caducidad_password ?? 90,
            intentos_maximos_login: data.intentos_maximos_login ?? 5,
            tiempo_bloqueo_minutos: data.tiempo_bloqueo_minutos ?? 15
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de seguridad:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de seguridad. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionSeguridad, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Manejar cambios en los inputs numéricos
  const handleNumberChange = (key: keyof ConfiguracionSeguridad, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  // Manejar cambios en los sliders
  const handleSliderChange = (key: keyof ConfiguracionSeguridad, value: number[]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveSeguridad(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de seguridad se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de seguridad:", error);
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
          <CardTitle>Configuración de Seguridad</CardTitle>
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
        <CardTitle>Configuración de Seguridad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autenticacion-doble-factor" 
                checked={config.autenticacion_doble_factor} 
                onCheckedChange={(checked) => handleSwitchChange('autenticacion_doble_factor', checked)} 
              />
              <Label htmlFor="autenticacion-doble-factor">Autenticación de doble factor</Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Requiere un segundo factor de autenticación (email, SMS o app) además de la contraseña.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="longitud-password">Longitud mínima de contraseña</Label>
              <span className="text-sm text-muted-foreground">{config.longitud_minima_password} caracteres</span>
            </div>
            <Slider 
              id="longitud-password"
              min={6} 
              max={16} 
              step={1}
              value={[config.longitud_minima_password]}
              onValueChange={(value) => handleSliderChange('longitud_minima_password', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="requiere-mayusculas" 
                checked={config.requiere_mayusculas} 
                onCheckedChange={(checked) => handleSwitchChange('requiere_mayusculas', checked)} 
              />
              <Label htmlFor="requiere-mayusculas">Requerir letras mayúsculas</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="requiere-numeros" 
                checked={config.requiere_numeros} 
                onCheckedChange={(checked) => handleSwitchChange('requiere_numeros', checked)} 
              />
              <Label htmlFor="requiere-numeros">Requerir números</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="requiere-simbolos" 
                checked={config.requiere_simbolos} 
                onCheckedChange={(checked) => handleSwitchChange('requiere_simbolos', checked)} 
              />
              <Label htmlFor="requiere-simbolos">Requerir símbolos especiales</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dias-caducidad">Días hasta caducidad de contraseña</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="dias-caducidad" 
                type="number" 
                min={0}
                max={365}
                value={config.dias_caducidad_password} 
                onChange={(e) => handleNumberChange('dias_caducidad_password', e.target.value)} 
              />
              <span className="text-sm text-muted-foreground">días (0 = nunca)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intentos-maximos">Intentos máximos de inicio de sesión</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="intentos-maximos" 
                type="number" 
                min={1}
                max={10}
                value={config.intentos_maximos_login} 
                onChange={(e) => handleNumberChange('intentos_maximos_login', e.target.value)} 
              />
              <span className="text-sm text-muted-foreground">intentos</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiempo-bloqueo">Tiempo de bloqueo tras intentos fallidos</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="tiempo-bloqueo" 
                type="number" 
                min={1}
                max={1440}
                value={config.tiempo_bloqueo_minutos} 
                onChange={(e) => handleNumberChange('tiempo_bloqueo_minutos', e.target.value)} 
              />
              <span className="text-sm text-muted-foreground">minutos</span>
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

export default ConfiguracionSeguridadTab;
