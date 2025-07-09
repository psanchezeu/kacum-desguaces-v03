import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, Upload } from "lucide-react";
import { configuracionService, ConfiguracionGeneral } from "@/services/configuracionService";

const ConfiguracionGeneralTab: React.FC = () => {
  const { toast } = useToast();
  const { isDarkMode, setDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfiguracionGeneral>({
    nombre_empresa: "",
    identificacion_fiscal: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    telefono: "",
    email: "",
    sitio_web: "",
    modo_oscuro: false
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("general");
        if (data) {
          const darkModeEnabled = data.modo_oscuro || false;
          
          setConfig({
            nombre_empresa: data.nombre_empresa || "",
            identificacion_fiscal: data.identificacion_fiscal || "",
            direccion: data.direccion || "",
            ciudad: data.ciudad || "",
            codigo_postal: data.codigo_postal || "",
            telefono: data.telefono || "",
            email: data.email || "",
            sitio_web: data.sitio_web || "",
            logo_url: data.logo_url || undefined,
            modo_oscuro: darkModeEnabled
          });
          
          // Sincronizar con el contexto global de tema
          setDarkMode(darkModeEnabled);
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Manejar cambios en los campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    
    // Mapear IDs de los campos a las propiedades del objeto config
    const fieldMap: Record<string, keyof ConfiguracionGeneral> = {
      "company-name": "nombre_empresa",
      "tax-id": "identificacion_fiscal",
      "address": "direccion",
      "city": "ciudad",
      "postal-code": "codigo_postal",
      "phone": "telefono",
      "email": "email",
      "web": "sitio_web",
      "dark-mode": "modo_oscuro"
    };
    
    const field = fieldMap[id];
    if (field) {
      setConfig(prev => ({
        ...prev,
        [field]: type === "checkbox" ? checked : value
      }));
    }
  };

  // Manejar subida de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const logoUrl = await configuracionService.uploadLogo(file);
      
      // Normalizar la URL del logo
      let normalizedLogoUrl = logoUrl;
      
      // Asegurarse de que la URL sea absoluta o comience con /
      if (!normalizedLogoUrl.startsWith('http') && !normalizedLogoUrl.startsWith('/')) {
        normalizedLogoUrl = `/${normalizedLogoUrl}`;
      }
      
      console.log('URL del logo normalizada:', normalizedLogoUrl);
      
      setConfig(prev => ({ ...prev, logo_url: normalizedLogoUrl }));
      toast({
        title: "Logo actualizado",
        description: "El logo se ha actualizado correctamente."
      });
      
      // Forzar guardado inmediato para actualizar la configuración
      await handleSave();
      
    } catch (error) {
      console.error("Error al subir el logo:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el logo. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.saveGeneral(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
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
          <CardTitle>Configuración General</CardTitle>
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
        <CardTitle>Configuración General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input 
              id="company-name" 
              value={config.nombre_empresa} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tax-id">Identificación Fiscal (CIF/NIF)</Label>
            <Input 
              id="tax-id" 
              value={config.identificacion_fiscal} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input 
              id="address" 
              value={config.direccion} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input 
              id="city" 
              value={config.ciudad} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postal-code">Código Postal</Label>
            <Input 
              id="postal-code" 
              value={config.codigo_postal} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono de Contacto</Label>
            <Input 
              id="phone" 
              value={config.telefono} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email de Contacto</Label>
            <Input 
              id="email" 
              type="email" 
              value={config.email} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="web">Sitio Web</Label>
            <Input 
              id="web" 
              value={config.sitio_web} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logo">Logo de la Empresa</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-muted rounded flex items-center justify-center overflow-hidden">
              {config.logo_url ? (
                <img 
                  src={config.logo_url.startsWith('http') ? config.logo_url : `${window.location.origin}${config.logo_url.startsWith('/') ? '' : '/'}${config.logo_url}`} 
                  alt="Logo de la empresa" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    console.error('Error al cargar el logo:', e);
                    // Intentar con ruta relativa si falla la URL original
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('/uploads/')) {
                      target.src = `/uploads/${config.logo_url.split('/').pop()}`;
                    } else {
                      // Si sigue fallando, mostrar las iniciales
                      target.style.display = 'none';
                      // Mostrar el elemento de fallback
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('span');
                        fallback.className = 'text-2xl font-bold text-muted-foreground';
                        fallback.textContent = config.nombre_empresa ? config.nombre_empresa.substring(0, 2).toUpperCase() : "DF";
                        parent.appendChild(fallback);
                      }
                    }
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">
                  {config.nombre_empresa ? config.nombre_empresa.substring(0, 2).toUpperCase() : "DF"}
                </span>
              )}
            </div>
            <div>
              <Button 
                variant="outline" 
                className="relative"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar Logo
                  </>
                )}
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="dark-mode" 
            checked={config.modo_oscuro} 
            onCheckedChange={(checked) => {
              // Actualizar el estado local
              setConfig(prev => ({ ...prev, modo_oscuro: checked }));
              // Actualizar el tema global
              setDarkMode(checked);
            }} 
          />
          <span className="text-sm font-medium">Activar modo oscuro</span>
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

export default ConfiguracionGeneralTab;
