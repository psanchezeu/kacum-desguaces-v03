
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Lock, Users, Database, Shield, Plug, FileText, MapPin } from "lucide-react";
import ConfiguracionGeneralTab from "@/components/configuracion/ConfiguracionGeneralTab";
import ConfiguracionNotificacionesTab from "@/components/configuracion/ConfiguracionNotificacionesTab";
import ConfiguracionSeguridadTab from "@/components/configuracion/ConfiguracionSeguridadTab";
import ConfiguracionUsuariosTab from "@/components/configuracion/ConfiguracionUsuariosTab";
import ConfiguracionBackupTab from "@/components/configuracion/ConfiguracionBackupTab";
import ConfiguracionPermisosTab from "@/components/configuracion/ConfiguracionPermisosTab";
import ConfiguracionConexionesAPITab from "@/components/configuracion/ConfiguracionConexionesAPITab";
import ConfiguracionPlantillasVehiculosTab from "@/components/configuracion/ConfiguracionPlantillasVehiculosTab";
import ConfiguracionCampasTab from "@/components/configuracion/ConfiguracionCampasTab";

const ConfiguracionPage: React.FC = () => {
  return (
    <PageLayout title="Configuración del Sistema">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-9 mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notificaciones
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Seguridad
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Usuarios
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Backup
          </TabsTrigger>
          <TabsTrigger value="permisos" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Permisos
          </TabsTrigger>
          <TabsTrigger value="conexiones" className="flex items-center gap-2">
            <Plug className="h-4 w-4" /> Conexiones API
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Plantillas Vehículos
          </TabsTrigger>
          <TabsTrigger value="campas" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Campas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <ConfiguracionGeneralTab />
        </TabsContent>
        
        <TabsContent value="notificaciones">
          <ConfiguracionNotificacionesTab />
        </TabsContent>
        
        <TabsContent value="seguridad">
          <ConfiguracionSeguridadTab />
        </TabsContent>
        
        <TabsContent value="usuarios">
          <ConfiguracionUsuariosTab />
        </TabsContent>
        
        <TabsContent value="backup">
          <ConfiguracionBackupTab />
        </TabsContent>
        
        <TabsContent value="permisos">
          <ConfiguracionPermisosTab />
        </TabsContent>
        
        <TabsContent value="conexiones">
          <ConfiguracionConexionesAPITab />
        </TabsContent>
        
        <TabsContent value="plantillas">
          <ConfiguracionPlantillasVehiculosTab />
        </TabsContent>
        
        <TabsContent value="campas">
          <ConfiguracionCampasTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ConfiguracionPage;
