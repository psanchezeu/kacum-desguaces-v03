import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Info, Check } from "lucide-react";
import { configuracionService, ConfiguracionPermisos } from "@/services/configuracionService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Lista de permisos disponibles en el sistema
const permisosDisponibles = [
  { id: "vehiculos_ver", label: "Ver vehículos", categoria: "vehiculos" },
  { id: "vehiculos_crear", label: "Crear vehículos", categoria: "vehiculos" },
  { id: "vehiculos_editar", label: "Editar vehículos", categoria: "vehiculos" },
  { id: "vehiculos_eliminar", label: "Eliminar vehículos", categoria: "vehiculos" },
  { id: "piezas_ver", label: "Ver piezas", categoria: "piezas" },
  { id: "piezas_crear", label: "Crear piezas", categoria: "piezas" },
  { id: "piezas_editar", label: "Editar piezas", categoria: "piezas" },
  { id: "piezas_eliminar", label: "Eliminar piezas", categoria: "piezas" },
  { id: "pedidos_ver", label: "Ver pedidos", categoria: "pedidos" },
  { id: "pedidos_crear", label: "Crear pedidos", categoria: "pedidos" },
  { id: "pedidos_editar", label: "Editar pedidos", categoria: "pedidos" },
  { id: "pedidos_eliminar", label: "Eliminar pedidos", categoria: "pedidos" },
  { id: "clientes_ver", label: "Ver clientes", categoria: "clientes" },
  { id: "clientes_crear", label: "Crear clientes", categoria: "clientes" },
  { id: "clientes_editar", label: "Editar clientes", categoria: "clientes" },
  { id: "clientes_eliminar", label: "Eliminar clientes", categoria: "clientes" },
  { id: "usuarios_ver", label: "Ver usuarios", categoria: "usuarios" },
  { id: "usuarios_crear", label: "Crear usuarios", categoria: "usuarios" },
  { id: "usuarios_editar", label: "Editar usuarios", categoria: "usuarios" },
  { id: "usuarios_eliminar", label: "Eliminar usuarios", categoria: "usuarios" },
  { id: "configuracion_ver", label: "Ver configuración", categoria: "configuracion" },
  { id: "configuracion_editar", label: "Editar configuración", categoria: "configuracion" },
  { id: "reportes_ver", label: "Ver reportes", categoria: "reportes" },
  { id: "reportes_crear", label: "Crear reportes", categoria: "reportes" },
  { id: "reportes_exportar", label: "Exportar reportes", categoria: "reportes" },
  { id: "campas_ver", label: "Ver campas", categoria: "campas" },
  { id: "campas_editar", label: "Editar campas", categoria: "campas" },
  { id: "campas_asignar", label: "Asignar vehículos a campas", categoria: "campas" },
];

// Agrupar permisos por categoría
const permisosAgrupados = permisosDisponibles.reduce((acc, permiso) => {
  if (!acc[permiso.categoria]) {
    acc[permiso.categoria] = [];
  }
  acc[permiso.categoria].push(permiso);
  return acc;
}, {} as Record<string, typeof permisosDisponibles>);

// Roles predefinidos
const rolesPredefinidos = ["admin", "usuario", "invitado"];

const ConfiguracionPermisosTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<string>("admin");
  const [config, setConfig] = useState<ConfiguracionPermisos>({
    permisos_por_rol: {
      admin: permisosDisponibles.map(p => p.id),
      usuario: ["vehiculos_ver", "piezas_ver", "pedidos_ver", "clientes_ver"],
      invitado: ["vehiculos_ver"]
    }
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await configuracionService.getByCategoria("permisos");
        if (data && data.permisos_por_rol) {
          // Asegurarse de que todos los roles predefinidos existan
          const permisosPorRol = { ...data.permisos_por_rol };
          rolesPredefinidos.forEach(rol => {
            if (!permisosPorRol[rol]) {
              if (rol === "admin") {
                permisosPorRol[rol] = permisosDisponibles.map(p => p.id);
              } else if (rol === "usuario") {
                permisosPorRol[rol] = ["vehiculos_ver", "piezas_ver", "pedidos_ver", "clientes_ver"];
              } else if (rol === "invitado") {
                permisosPorRol[rol] = ["vehiculos_ver"];
              } else {
                permisosPorRol[rol] = [];
              }
            }
          });
          
          setConfig({
            permisos_por_rol: permisosPorRol
          });
        }
      } catch (error) {
        console.error("Error al cargar la configuración de permisos:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de permisos. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  // Verificar si un permiso está asignado al rol activo
  const isPermisoAsignado = (permisoId: string) => {
    return config.permisos_por_rol[activeRole]?.includes(permisoId) || false;
  };

  // Manejar cambio en un permiso
  const handlePermisoChange = (permisoId: string, checked: boolean) => {
    setConfig(prev => {
      const permisosPorRol = { ...prev.permisos_por_rol };
      const permisosRol = [...(permisosPorRol[activeRole] || [])];
      
      if (checked && !permisosRol.includes(permisoId)) {
        permisosRol.push(permisoId);
      } else if (!checked) {
        const index = permisosRol.indexOf(permisoId);
        if (index !== -1) {
          permisosRol.splice(index, 1);
        }
      }
      
      permisosPorRol[activeRole] = permisosRol;
      
      return {
        ...prev,
        permisos_por_rol: permisosPorRol
      };
    });
  };

  // Seleccionar todos los permisos de una categoría
  const seleccionarTodosCategoria = (categoria: string) => {
    const permisosCategoria = permisosAgrupados[categoria].map(p => p.id);
    
    setConfig(prev => {
      const permisosPorRol = { ...prev.permisos_por_rol };
      const permisosRol = [...(permisosPorRol[activeRole] || [])];
      
      // Añadir todos los permisos de la categoría que no estén ya incluidos
      permisosCategoria.forEach(permisoId => {
        if (!permisosRol.includes(permisoId)) {
          permisosRol.push(permisoId);
        }
      });
      
      permisosPorRol[activeRole] = permisosRol;
      
      return {
        ...prev,
        permisos_por_rol: permisosPorRol
      };
    });
  };

  // Deseleccionar todos los permisos de una categoría
  const deseleccionarTodosCategoria = (categoria: string) => {
    const permisosCategoria = permisosAgrupados[categoria].map(p => p.id);
    
    setConfig(prev => {
      const permisosPorRol = { ...prev.permisos_por_rol };
      const permisosRol = [...(permisosPorRol[activeRole] || [])].filter(
        permisoId => !permisosCategoria.includes(permisoId)
      );
      
      permisosPorRol[activeRole] = permisosRol;
      
      return {
        ...prev,
        permisos_por_rol: permisosPorRol
      };
    });
  };

  // Verificar si todos los permisos de una categoría están seleccionados
  const estanTodosSeleccionados = (categoria: string) => {
    const permisosCategoria = permisosAgrupados[categoria].map(p => p.id);
    return permisosCategoria.every(permisoId => isPermisoAsignado(permisoId));
  };

  // Verificar si algún permiso de una categoría está seleccionado
  const hayAlgunoSeleccionado = (categoria: string) => {
    const permisosCategoria = permisosAgrupados[categoria].map(p => p.id);
    return permisosCategoria.some(permisoId => isPermisoAsignado(permisoId));
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configuracionService.savePermisos(config);
      toast({
        title: "Configuración guardada",
        description: "La configuración de permisos se ha guardado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar la configuración de permisos:", error);
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
          <CardTitle>Configuración de Permisos</CardTitle>
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
        <CardTitle>Configuración de Permisos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Tabs defaultValue={activeRole} onValueChange={setActiveRole}>
            <TabsList className="mb-4">
              {Object.keys(config.permisos_por_rol).map((rol) => (
                <TabsTrigger key={rol} value={rol} className="capitalize">
                  {rol}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeRole} className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Configurando permisos para el rol: <span className="font-medium capitalize">{activeRole}</span>
                {activeRole === "admin" && (
                  <span className="ml-2 text-yellow-500">
                    (Este rol tiene acceso completo por defecto)
                  </span>
                )}
              </div>
              
              {Object.entries(permisosAgrupados).map(([categoria, permisos]) => (
                <div key={categoria} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium capitalize">{categoria}</h3>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => seleccionarTodosCategoria(categoria)}
                        disabled={estanTodosSeleccionados(categoria) || activeRole === "admin"}
                      >
                        Seleccionar todos
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deseleccionarTodosCategoria(categoria)}
                        disabled={!hayAlgunoSeleccionado(categoria) || activeRole === "admin"}
                      >
                        Deseleccionar todos
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permisos.map((permiso) => (
                      <div key={permiso.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${activeRole}-${permiso.id}`}
                          checked={isPermisoAsignado(permiso.id) || activeRole === "admin"}
                          onCheckedChange={(checked) => handlePermisoChange(permiso.id, checked as boolean)}
                          disabled={activeRole === "admin"} // El admin siempre tiene todos los permisos
                        />
                        <Label 
                          htmlFor={`${activeRole}-${permiso.id}`}
                          className={activeRole === "admin" ? "text-muted-foreground" : ""}
                        >
                          {permiso.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {activeRole === "admin" && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 flex items-start space-x-3">
                  <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      El rol de administrador tiene acceso completo al sistema por defecto y no puede ser modificado por seguridad.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
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

export default ConfiguracionPermisosTab;
