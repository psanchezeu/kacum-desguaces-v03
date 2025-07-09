
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Car, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlantillaVehiculo } from "@/types";

interface AsignarPlantillaDialogProps {
  plantilla: PlantillaVehiculo;
  onCerrar: () => void;
}

const AsignarPlantillaDialog: React.FC<AsignarPlantillaDialogProps> = ({
  plantilla,
  onCerrar
}) => {
  const { toast } = useToast();
  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<any>(null);

  // Mock de vehículos disponibles (en una app real vendría de la API)
  const vehiculosDisponibles = [
    {
      id: 1,
      marca: "Renault",
      modelo: "Megane",
      version: "IV",
      matricula: "1234ABC",
      año: 2020,
      estado: "disponible"
    },
    {
      id: 2,
      marca: "Renault",
      modelo: "Megane",
      version: "III",
      matricula: "5678DEF",
      año: 2018,
      estado: "en_proceso"
    },
    {
      id: 3,
      marca: "Ford",
      modelo: "Focus",
      version: "ST",
      matricula: "9876GHI",
      año: 2019,
      estado: "disponible"
    }
  ];

  const vehiculosFiltrados = vehiculosDisponibles.filter(vehiculo => {
    const textoBusqueda = busquedaVehiculo.toLowerCase();
    return (
      vehiculo.marca.toLowerCase().includes(textoBusqueda) ||
      vehiculo.modelo.toLowerCase().includes(textoBusqueda) ||
      vehiculo.matricula.toLowerCase().includes(textoBusqueda)
    );
  });

  const vehiculosCompatibles = vehiculosFiltrados.filter(vehiculo => 
    vehiculo.marca.toLowerCase() === plantilla.marca.toLowerCase() &&
    vehiculo.modelo.toLowerCase() === plantilla.modelo.toLowerCase()
  );

  const handleAsignarPlantilla = () => {
    if (!vehiculoSeleccionado) {
      toast({
        title: "Selecciona un vehículo",
        description: "Debes seleccionar un vehículo para asignar la plantilla.",
        variant: "destructive"
      });
      return;
    }

    // Aquí se implementaría la lógica para asignar la plantilla al vehículo
    console.log("Asignando plantilla", plantilla.id, "al vehículo", vehiculoSeleccionado.id);
    
    toast({
      title: "Plantilla asignada",
      description: `La plantilla "${plantilla.nombre}" se ha asignado al vehículo ${vehiculoSeleccionado.matricula}.`
    });
    
    onCerrar();
  };

  const esCompatible = (vehiculo: any) => {
    return vehiculo.marca.toLowerCase() === plantilla.marca.toLowerCase() &&
           vehiculo.modelo.toLowerCase() === plantilla.modelo.toLowerCase();
  };

  return (
    <Dialog open={true} onOpenChange={onCerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar Plantilla a Vehículo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la plantilla */}
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Plantilla Seleccionada</h3>
            <div className="text-sm">
              <div><strong>Nombre:</strong> {plantilla.nombre}</div>
              <div><strong>Vehículo:</strong> {plantilla.marca} {plantilla.modelo} {plantilla.version}</div>
              <div><strong>Piezas:</strong> {plantilla.piezas.length} piezas definidas</div>
            </div>
          </div>

          {/* Buscador de vehículos */}
          <div>
            <Label htmlFor="busqueda">Buscar Vehículo</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="busqueda"
                value={busquedaVehiculo}
                onChange={(e) => setBusquedaVehiculo(e.target.value)}
                placeholder="Buscar por marca, modelo o matrícula..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de vehículos */}
          <div>
            <Label>Vehículos Disponibles</Label>
            <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
              {vehiculosFiltrados.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No se encontraron vehículos
                </div>
              ) : (
                vehiculosFiltrados.map((vehiculo) => (
                  <div
                    key={vehiculo.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted ${
                      vehiculoSeleccionado?.id === vehiculo.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => setVehiculoSeleccionado(vehiculo)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <span className="font-medium">
                            {vehiculo.marca} {vehiculo.modelo} {vehiculo.version}
                          </span>
                          <Badge variant="outline">{vehiculo.matricula}</Badge>
                          {esCompatible(vehiculo) && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Compatible
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Año: {vehiculo.año} | Estado: {vehiculo.estado}
                        </div>
                      </div>
                      {vehiculoSeleccionado?.id === vehiculo.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vehículos compatibles destacados */}
          {vehiculosCompatibles.length > 0 && (
            <div>
              <Label>Vehículos Compatibles Recomendados</Label>
              <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-2">
                <div className="text-sm text-green-800 mb-2">
                  Se encontraron {vehiculosCompatibles.length} vehículos compatibles con esta plantilla:
                </div>
                {vehiculosCompatibles.slice(0, 3).map((vehiculo) => (
                  <div key={vehiculo.id} className="text-sm">
                    • {vehiculo.matricula} - {vehiculo.marca} {vehiculo.modelo} {vehiculo.version}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advertencia para vehículos no compatibles */}
          {vehiculoSeleccionado && !esCompatible(vehiculoSeleccionado) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="text-yellow-800 text-sm">
                <strong>Advertencia:</strong> El vehículo seleccionado no coincide exactamente con las especificaciones de la plantilla. 
                Es posible que algunas piezas no sean aplicables.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAsignarPlantilla}
            disabled={!vehiculoSeleccionado}
          >
            Asignar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AsignarPlantillaDialog;
