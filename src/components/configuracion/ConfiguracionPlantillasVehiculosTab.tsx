import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Info } from "lucide-react";
import { configuracionService, ConfiguracionPlantillasVehiculos } from "@/services/configuracionService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simulación de plantillas disponibles (en una implementación real, esto vendría de la API)
const plantillasDisponibles = [
  { id: 1, nombre: "Plantilla Estándar" },
  { id: 2, nombre: "Plantilla Detallada" },
  { id: 3, nombre: "Plantilla Básica" },
  { id: 4, nombre: "Plantilla Completa" },
];

const ConfiguracionPlantillasVehiculosTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfiguracionPlantillasVehiculos>({
    plantillas_activas: true,
    usar_plantilla_por_defecto: true,
    plantilla_por_defecto_id: 1
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("plantillas");
        if (data) {
          setConfig({
            plantillas_activas: data.plantillas_activas ?? true,
            usar_plantilla_por_defecto: data.usar_plantilla_por_defecto ?? true,
            plantilla_por_defecto_id: data.plantilla_por_defecto_id ?? 1
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de plantillas de vehículos:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de plantillas. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionPlantillasVehiculos, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Manejar cambios en los selects
  const handleSelectChange = (key: keyof ConfiguracionPlantillasVehiculos, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: parseInt(value, 10)
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.savePlantillasVehiculos(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de plantillas de vehículos se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de plantillas de vehículos:", error);
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
          <CardTitle>Configuración de Plantillas de Vehículos</CardTitle>
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
        <CardTitle>Configuración de Plantillas de Vehículos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="plantillas-activas" 
                checked={config.plantillas_activas} 
                onCheckedChange={(checked) => handleSwitchChange('plantillas_activas', checked)} 
              />
              <Label htmlFor="plantillas-activas">Habilitar plantillas de vehículos</Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Las plantillas permiten predefinir campos y valores para la creación rápida de vehículos.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="usar-plantilla-defecto" 
                checked={config.usar_plantilla_por_defecto} 
                onCheckedChange={(checked) => handleSwitchChange('usar_plantilla_por_defecto', checked)} 
                disabled={!config.plantillas_activas}
              />
              <Label 
                htmlFor="usar-plantilla-defecto"
                className={!config.plantillas_activas ? "text-muted-foreground" : ""}
              >
                Usar plantilla por defecto
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="plantilla-defecto"
              className={(!config.plantillas_activas || !config.usar_plantilla_por_defecto) ? "text-muted-foreground" : ""}
            >
              Plantilla por defecto
            </Label>
            <Select 
              disabled={!config.plantillas_activas || !config.usar_plantilla_por_defecto}
              value={config.plantilla_por_defecto_id?.toString()} 
              onValueChange={(value) => handleSelectChange('plantilla_por_defecto_id', value)}
            >
              <SelectTrigger id="plantilla-defecto">
                <SelectValue placeholder="Seleccione una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {plantillasDisponibles.map((plantilla) => (
                  <SelectItem key={plantilla.id} value={plantilla.id.toString()}>
                    {plantilla.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start space-x-3 mt-4">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Para crear y gestionar plantillas de vehículos, vaya a la sección de Vehículos y seleccione "Gestionar Plantillas".
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

export default ConfiguracionPlantillasVehiculosTab;
