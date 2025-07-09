import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { configuracionService, ConfiguracionNotificaciones } from "@/services/configuracionService";

const ConfiguracionNotificacionesTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfiguracionNotificaciones>({
    email_nuevos_pedidos: true,
    email_nuevas_incidencias: true,
    email_nuevos_clientes: false,
    notif_stock_bajo: true,
    notif_seguridad: true
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("notificaciones");
        if (data) {
          setConfig({
            email_nuevos_pedidos: data.email_nuevos_pedidos ?? true,
            email_nuevas_incidencias: data.email_nuevas_incidencias ?? true,
            email_nuevos_clientes: data.email_nuevos_clientes ?? false,
            notif_stock_bajo: data.notif_stock_bajo ?? true,
            notif_seguridad: data.notif_seguridad ?? true
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de notificaciones:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de notificaciones. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof ConfiguracionNotificaciones, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveNotificaciones(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de notificaciones se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de notificaciones:", error);
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
          <CardTitle>Configuración de Notificaciones</CardTitle>
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
        <CardTitle>Configuración de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notificaciones por Email</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-pedidos">Nuevos pedidos</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones cuando se registre un nuevo pedido
              </p>
            </div>
            <Switch 
              id="email-pedidos" 
              checked={config.email_nuevos_pedidos}
              onCheckedChange={(checked) => handleSwitchChange("email_nuevos_pedidos", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-incidencias">Nuevas incidencias</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones cuando se registre una nueva incidencia
              </p>
            </div>
            <Switch 
              id="email-incidencias" 
              checked={config.email_nuevas_incidencias}
              onCheckedChange={(checked) => handleSwitchChange("email_nuevas_incidencias", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-clientes">Nuevos clientes</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones cuando se registre un nuevo cliente
              </p>
            </div>
            <Switch 
              id="email-clientes" 
              checked={config.email_nuevos_clientes}
              onCheckedChange={(checked) => handleSwitchChange("email_nuevos_clientes", checked)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notificaciones del Sistema</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-stock">Alertas de stock bajo</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones cuando el stock de piezas esté bajo
              </p>
            </div>
            <Switch 
              id="notif-stock" 
              checked={config.notif_stock_bajo}
              onCheckedChange={(checked) => handleSwitchChange("notif_stock_bajo", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-seguridad">Alertas de seguridad</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones sobre eventos de seguridad del sistema
              </p>
            </div>
            <Switch 
              id="notif-seguridad" 
              checked={config.notif_seguridad}
              onCheckedChange={(checked) => handleSwitchChange("notif_seguridad", checked)}
            />
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
              "Guardar Preferencias"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionNotificacionesTab;
