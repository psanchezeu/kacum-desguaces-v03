
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Car, ArrowRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CampaAlmacenamiento, VehiculoCampa } from "@/types";

interface VehiculosCampaDialogProps {
  campa: CampaAlmacenamiento;
  onCerrar: () => void;
}

const VehiculosCampaDialog: React.FC<VehiculosCampaDialogProps> = ({
  campa,
  onCerrar
}) => {
  const { toast } = useToast();
  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [vehiculosAsignados, setVehiculosAsignados] = useState<VehiculoCampa[]>(campa.vehiculos_asignados);

  // Mock de otros vehículos disponibles
  const vehiculosDisponibles = [
    {
      id: 3,
      marca: "Toyota",
      modelo: "Corolla",
      matricula: "9999XYZ",
      año: 2021,
      estado: "disponible"
    },
    {
      id: 4,
      marca: "Seat",
      modelo: "León",
      matricula: "1111ABC",
      año: 2019,
      estado: "disponible"
    }
  ];

  const handleMoverVehiculo = (vehiculoId: number) => {
    // Aquí se implementaría la lógica para mover el vehículo a otra campa
    const vehiculo = vehiculosAsignados.find(v => v.id === vehiculoId);
    if (vehiculo) {
      toast({
        title: "Función no implementada",
        description: "La funcionalidad de mover vehículos entre campas estará disponible próximamente.",
      });
    }
  };

  const handleEliminarVehiculo = (vehiculoId: number) => {
    const vehiculo = vehiculosAsignados.find(v => v.id === vehiculoId);
    if (vehiculo && window.confirm(`¿Desasignar el vehículo ${vehiculo.vehiculo_info.matricula} de la campa?`)) {
      setVehiculosAsignados(vehiculosAsignados.filter(v => v.id !== vehiculoId));
      
      toast({
        title: "Vehículo desasignado",
        description: `El vehículo ${vehiculo.vehiculo_info.matricula} ha sido removido de la campa.`
      });
    }
  };

  const handleAsignarVehiculo = (vehiculo: any) => {
    if (vehiculosAsignados.length >= campa.capacidad_maxima) {
      toast({
        title: "Campa llena",
        description: "La campa ha alcanzado su capacidad máxima.",
        variant: "destructive"
      });
      return;
    }

    const nuevoVehiculo: VehiculoCampa = {
      id: Math.max(0, ...vehiculosAsignados.map(v => v.id)) + 1,
      id_vehiculo: vehiculo.id,
      vehiculo_info: {
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        matricula: vehiculo.matricula
      },
      fecha_asignacion: new Date(),
      estado: "almacenado"
    };

    setVehiculosAsignados([...vehiculosAsignados, nuevoVehiculo]);
    
    toast({
      title: "Vehículo asignado",
      description: `El vehículo ${vehiculo.matricula} ha sido asignado a la campa.`
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'almacenado':
        return <Badge className="bg-blue-100 text-blue-800">Almacenado</Badge>;
      case 'en_proceso':
        return <Badge className="bg-yellow-100 text-yellow-800">En Proceso</Badge>;
      case 'listo_despiece':
        return <Badge className="bg-green-100 text-green-800">Listo Despiece</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const vehiculosDisponiblesFiltrados = vehiculosDisponibles.filter(vehiculo => {
    const textoBusqueda = busquedaVehiculo.toLowerCase();
    return (
      vehiculo.marca.toLowerCase().includes(textoBusqueda) ||
      vehiculo.modelo.toLowerCase().includes(textoBusqueda) ||
      vehiculo.matricula.toLowerCase().includes(textoBusqueda)
    ) && !vehiculosAsignados.some(va => va.id_vehiculo === vehiculo.id);
  });

  return (
    <Dialog open={true} onOpenChange={onCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Vehículos - {campa.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la campa */}
          <div className="bg-muted p-4 rounded-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Capacidad:</strong> {campa.capacidad_maxima} vehículos
              </div>
              <div>
                <strong>Ocupación:</strong> {vehiculosAsignados.length}/{campa.capacidad_maxima}
              </div>
              <div>
                <strong>Disponible:</strong> {campa.capacidad_maxima - vehiculosAsignados.length} espacios
              </div>
              <div>
                <strong>Estado:</strong> {campa.estado}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehículos asignados */}
            <div>
              <Label className="text-base font-semibold">Vehículos en la Campa</Label>
              <div className="mt-2 border rounded-md max-h-80 overflow-y-auto">
                {vehiculosAsignados.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No hay vehículos asignados a esta campa
                  </div>
                ) : (
                  vehiculosAsignados.map((vehiculo) => (
                    <div key={vehiculo.id} className="p-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span className="font-medium">
                              {vehiculo.vehiculo_info.marca} {vehiculo.vehiculo_info.modelo}
                            </span>
                            <Badge variant="outline">{vehiculo.vehiculo_info.matricula}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getEstadoBadge(vehiculo.estado)}
                            <span className="text-xs text-muted-foreground">
                              Asignado: {vehiculo.fecha_asignacion.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoverVehiculo(vehiculo.id)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEliminarVehiculo(vehiculo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vehículos disponibles */}
            <div>
              <Label className="text-base font-semibold">Asignar Vehículos</Label>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={busquedaVehiculo}
                    onChange={(e) => setBusquedaVehiculo(e.target.value)}
                    placeholder="Buscar vehículos disponibles..."
                    className="pl-10"
                  />
                </div>
                
                <div className="border rounded-md max-h-80 overflow-y-auto">
                  {vehiculosDisponiblesFiltrados.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No hay vehículos disponibles
                    </div>
                  ) : (
                    vehiculosDisponiblesFiltrados.map((vehiculo) => (
                      <div
                        key={vehiculo.id}
                        className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted"
                        onClick={() => handleAsignarVehiculo(vehiculo)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              <span className="font-medium">
                                {vehiculo.marca} {vehiculo.modelo}
                              </span>
                              <Badge variant="outline">{vehiculo.matricula}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Año: {vehiculo.año} | Estado: {vehiculo.estado}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Asignar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Advertencia de capacidad */}
          {vehiculosAsignados.length >= campa.capacidad_maxima * 0.8 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="text-yellow-800 text-sm">
                <strong>Advertencia:</strong> La campa está cerca de su capacidad máxima. 
                Considere mover algunos vehículos a otras campas.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onCerrar}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehiculosCampaDialog;
