import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Info } from "lucide-react";
import { configuracionService, ConfiguracionCampas } from "@/services/configuracionService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Simulación de campas disponibles (en una implementación real, esto vendría de la API)
const campasDisponibles = [
  { id: 1, nombre: "Campa Principal" },
  { id: 2, nombre: "Campa Secundaria" },
  { id: 3, nombre: "Campa Auxiliar" },
];

const ConfiguracionCampasTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfiguracionCampas>({
    asignacion_automatica: true,
    notificar_capacidad_maxima: true,
    porcentaje_alerta_capacidad: 80,
    campa_por_defecto_id: 1
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("campas");
        if (data) {
          setConfig({
            asignacion_automatica: data.asignacion_automatica ?? true,
            notificar_capacidad_maxima: data.notificar_capacidad_maxima ?? true,
            porcentaje_alerta_capacidad: data.porcentaje_alerta_capacidad ?? 80,
            campa_por_defecto_id: data.campa_por_defecto_id ?? 1
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de campas:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de campas. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionCampas, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Manejar cambios en los selects
  const handleSelectChange = (key: keyof ConfiguracionCampas, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: parseInt(value, 10)
    }));
  };

  // Manejar cambios en los sliders
  const handleSliderChange = (key: keyof ConfiguracionCampas, value: number[]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveCampas(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de campas se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de campas:", error);
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
          <CardTitle>Configuración de Campas</CardTitle>
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
        <CardTitle>Configuración de Campas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="asignacion-automatica" 
                checked={config.asignacion_automatica} 
                onCheckedChange={(checked) => handleSwitchChange('asignacion_automatica', checked)} 
              />
              <Label htmlFor="asignacion-automatica">Asignación automática de vehículos</Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Asigna automáticamente los vehículos a la campa por defecto al ser registrados.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campa-defecto">Campa por defecto</Label>
            <Select 
              value={config.campa_por_defecto_id?.toString()} 
              onValueChange={(value) => handleSelectChange('campa_por_defecto_id', value)}
              disabled={!config.asignacion_automatica}
            >
              <SelectTrigger id="campa-defecto">
                <SelectValue placeholder="Seleccione una campa" />
              </SelectTrigger>
              <SelectContent>
                {campasDisponibles.map((campa) => (
                  <SelectItem key={campa.id} value={campa.id.toString()}>
                    {campa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="notificar-capacidad" 
                checked={config.notificar_capacidad_maxima} 
                onCheckedChange={(checked) => handleSwitchChange('notificar_capacidad_maxima', checked)} 
              />
              <Label htmlFor="notificar-capacidad">Notificar cuando se alcance capacidad máxima</Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="porcentaje-alerta">Umbral de alerta de capacidad</Label>
              <span className="text-sm text-muted-foreground">{config.porcentaje_alerta_capacidad}%</span>
            </div>
            <Slider 
              id="porcentaje-alerta"
              min={50} 
              max={100} 
              step={5}
              value={[config.porcentaje_alerta_capacidad]}
              onValueChange={(value) => handleSliderChange('porcentaje_alerta_capacidad', value)}
              disabled={!config.notificar_capacidad_maxima}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start space-x-3 mt-4">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Para crear y gestionar campas, vaya a la sección de Campas en el menú principal.
              </p>
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

export default ConfiguracionCampasTab;
