import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle, X } from "lucide-react";
import { configuracionService, ConfiguracionUsuarios } from "@/services/configuracionService";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ConfiguracionUsuariosTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<string>("");
  const [config, setConfig] = useState<ConfiguracionUsuarios>({
    registro_abierto: false,
    requiere_aprobacion_admin: true,
    tiempo_sesion_minutos: 60,
    notificar_nuevos_usuarios: true,
    roles_disponibles: ["admin", "usuario", "invitado"]
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("usuarios");
        if (data) {
          setConfig({
            registro_abierto: data.registro_abierto ?? false,
            requiere_aprobacion_admin: data.requiere_aprobacion_admin ?? true,
            tiempo_sesion_minutos: data.tiempo_sesion_minutos ?? 60,
            notificar_nuevos_usuarios: data.notificar_nuevos_usuarios ?? true,
            roles_disponibles: data.roles_disponibles ?? ["admin", "usuario", "invitado"]
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de usuarios:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de usuarios. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionUsuarios, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Manejar cambios en los inputs numéricos
  const handleNumberChange = (key: keyof ConfiguracionUsuarios, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  // Añadir nuevo rol
  const handleAddRole = () => {
    if (newRole.trim() && !config.roles_disponibles.includes(newRole.trim())) {
      setConfig(prev => ({
        ...prev,
        roles_disponibles: [...prev.roles_disponibles, newRole.trim()]
      }));
      setNewRole("");
    } else if (config.roles_disponibles.includes(newRole.trim())) {
      toast({
        title: "Rol duplicado",
        description: "Este rol ya existe en la lista.",
        variant: "destructive"
      });
    }
  };

  // Eliminar rol
  const handleRemoveRole = (role: string) => {
    // No permitir eliminar roles básicos del sistema
    if (["admin", "usuario"].includes(role)) {
      toast({
        title: "Acción no permitida",
        description: "No se pueden eliminar los roles básicos del sistema.",
        variant: "destructive"
      });
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      roles_disponibles: prev.roles_disponibles.filter(r => r !== role)
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveUsuarios(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de usuarios se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de usuarios:", error);
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
          <CardTitle>Configuración de Usuarios</CardTitle>
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
        <CardTitle>Configuración de Usuarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="registro-abierto" 
                checked={config.registro_abierto} 
                onCheckedChange={(checked) => handleSwitchChange('registro_abierto', checked)} 
              />
              <Label htmlFor="registro-abierto">Permitir registro de nuevos usuarios</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="requiere-aprobacion" 
                checked={config.requiere_aprobacion_admin} 
                onCheckedChange={(checked) => handleSwitchChange('requiere_aprobacion_admin', checked)} 
                disabled={!config.registro_abierto}
              />
              <Label htmlFor="requiere-aprobacion" className={!config.registro_abierto ? "text-muted-foreground" : ""}>
                Requerir aprobación de administrador
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="notificar-nuevos-usuarios" 
                checked={config.notificar_nuevos_usuarios} 
                onCheckedChange={(checked) => handleSwitchChange('notificar_nuevos_usuarios', checked)} 
              />
              <Label htmlFor="notificar-nuevos-usuarios">Notificar nuevos registros</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiempo-sesion">Tiempo de sesión</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="tiempo-sesion" 
                type="number" 
                min={5}
                max={1440}
                value={config.tiempo_sesion_minutos} 
                onChange={(e) => handleNumberChange('tiempo_sesion_minutos', e.target.value)} 
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roles">Roles disponibles</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {config.roles_disponibles.map((role) => (
                <Badge key={role} variant="secondary" className="flex items-center gap-1">
                  {role}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                          onClick={() => handleRemoveRole(role)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar rol</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                id="nuevo-rol" 
                placeholder="Nuevo rol" 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
              />
              <Button 
                type="button" 
                size="icon"
                onClick={handleAddRole}
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

export default ConfiguracionUsuariosTab;
