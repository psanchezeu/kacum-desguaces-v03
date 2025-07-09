import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Info } from "lucide-react";
import { configuracionService, ConfiguracionBackup } from "@/services/configuracionService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ConfiguracionBackupTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfiguracionBackup>({
    backup_automatico: true,
    frecuencia_backup: "diario",
    hora_backup: "02:00",
    dia_semana_backup: 0,
    dia_mes_backup: 1,
    mantener_backups: 7,
    ubicacion_backup: "/backups"
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("backup");
        if (data) {
          setConfig({
            backup_automatico: data.backup_automatico ?? true,
            frecuencia_backup: data.frecuencia_backup ?? "diario",
            hora_backup: data.hora_backup ?? "02:00",
            dia_semana_backup: data.dia_semana_backup ?? 0,
            dia_mes_backup: data.dia_mes_backup ?? 1,
            mantener_backups: data.mantener_backups ?? 7,
            ubicacion_backup: data.ubicacion_backup ?? "/backups"
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de backup:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de backup. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionBackup, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Manejar cambios en los inputs de texto
  const handleTextChange = (key: keyof ConfiguracionBackup, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Manejar cambios en los inputs numéricos
  const handleNumberChange = (key: keyof ConfiguracionBackup, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  // Manejar cambios en los selects
  const handleSelectChange = (key: keyof ConfiguracionBackup, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveBackup(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de backup se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de backup:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Ejecutar backup manual
  const handleManualBackup = () => {
    toast({
      title: "Backup iniciado",
      description: "Se ha iniciado el proceso de backup manual. Recibirá una notificación cuando finalice."
    });
    // Aquí iría la lógica para iniciar un backup manual
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Backup</CardTitle>
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
        <CardTitle>Configuración de Backup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="backup-automatico" 
                checked={config.backup_automatico} 
                onCheckedChange={(checked) => handleSwitchChange('backup_automatico', checked)} 
              />
              <Label htmlFor="backup-automatico">Backup automático</Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">Realiza copias de seguridad automáticas según la frecuencia configurada.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frecuencia-backup">Frecuencia de backup</Label>
            <Select 
              disabled={!config.backup_automatico}
              value={config.frecuencia_backup} 
              onValueChange={(value) => handleSelectChange('frecuencia_backup', value)}
            >
              <SelectTrigger id="frecuencia-backup">
                <SelectValue placeholder="Seleccione frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hora-backup">Hora de backup</Label>
            <Input 
              id="hora-backup" 
              type="time" 
              value={config.hora_backup} 
              onChange={(e) => handleTextChange('hora_backup', e.target.value)} 
              disabled={!config.backup_automatico}
            />
          </div>

          {config.frecuencia_backup === "semanal" && (
            <div className="space-y-2">
              <Label htmlFor="dia-semana">Día de la semana</Label>
              <Select 
                disabled={!config.backup_automatico}
                value={config.dia_semana_backup?.toString()} 
                onValueChange={(value) => handleNumberChange('dia_semana_backup', value)}
              >
                <SelectTrigger id="dia-semana">
                  <SelectValue placeholder="Seleccione día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Lunes</SelectItem>
                  <SelectItem value="2">Martes</SelectItem>
                  <SelectItem value="3">Miércoles</SelectItem>
                  <SelectItem value="4">Jueves</SelectItem>
                  <SelectItem value="5">Viernes</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.frecuencia_backup === "mensual" && (
            <div className="space-y-2">
              <Label htmlFor="dia-mes">Día del mes</Label>
              <Input 
                id="dia-mes" 
                type="number" 
                min={1}
                max={31}
                value={config.dia_mes_backup} 
                onChange={(e) => handleNumberChange('dia_mes_backup', e.target.value)} 
                disabled={!config.backup_automatico}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mantener-backups">Mantener últimos backups</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="mantener-backups" 
                type="number" 
                min={1}
                max={365}
                value={config.mantener_backups} 
                onChange={(e) => handleNumberChange('mantener_backups', e.target.value)} 
              />
              <span className="text-sm text-muted-foreground">copias</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion-backup">Ubicación de backups</Label>
            <Input 
              id="ubicacion-backup" 
              value={config.ubicacion_backup} 
              onChange={(e) => handleTextChange('ubicacion_backup', e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={handleManualBackup}
          >
            Realizar Backup Manual
          </Button>
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

export default ConfiguracionBackupTab;
