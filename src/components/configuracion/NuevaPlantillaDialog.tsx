
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlantillaVehiculo, PiezaPlantilla } from "@/types";

interface NuevaPlantillaDialogProps {
  plantilla?: PlantillaVehiculo | null;
  onGuardar: (plantilla: Omit<PlantillaVehiculo, 'id' | 'fecha_creacion'>) => void;
  onCerrar: () => void;
}

const NuevaPlantillaDialog: React.FC<NuevaPlantillaDialogProps> = ({
  plantilla,
  onGuardar,
  onCerrar
}) => {
  const { toast } = useToast();
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [version, setVersion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [activa, setActiva] = useState(true);
  const [piezas, setPiezas] = useState<PiezaPlantilla[]>([]);
  const [busquedaPieza, setBusquedaPieza] = useState("");
  const [nuevaPieza, setNuevaPieza] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    obligatoria: false
  });

  // Piezas disponibles para buscar
  const piezasDisponibles = [
    { nombre: "Motor", categoria: "Motor" },
    { nombre: "Caja de cambios", categoria: "Transmisión" },
    { nombre: "Puerta delantera izquierda", categoria: "Carrocería" },
    { nombre: "Puerta delantera derecha", categoria: "Carrocería" },
    { nombre: "Puerta trasera izquierda", categoria: "Carrocería" },
    { nombre: "Puerta trasera derecha", categoria: "Carrocería" },
    { nombre: "Capó", categoria: "Carrocería" },
    { nombre: "Maletero", categoria: "Carrocería" },
    { nombre: "Piloto trasero derecho", categoria: "Carrocería" },
    { nombre: "Piloto trasero izquierdo", categoria: "Carrocería" },
    { nombre: "Faro delantero derecho", categoria: "Carrocería" },
    { nombre: "Faro delantero izquierdo", categoria: "Carrocería" },
    { nombre: "Parachoques delantero", categoria: "Carrocería" },
    { nombre: "Parachoques trasero", categoria: "Carrocería" },
    { nombre: "Espejo retrovisor derecho", categoria: "Carrocería" },
    { nombre: "Espejo retrovisor izquierdo", categoria: "Carrocería" },
    { nombre: "Volante", categoria: "Interior" },
    { nombre: "Asiento delantero derecho", categoria: "Interior" },
    { nombre: "Asiento delantero izquierdo", categoria: "Interior" },
    { nombre: "Asiento trasero", categoria: "Interior" },
    { nombre: "Airbag conductor", categoria: "Seguridad" },
    { nombre: "Airbag pasajero", categoria: "Seguridad" },
    { nombre: "Cinturón de seguridad", categoria: "Seguridad" },
    { nombre: "Batería", categoria: "Eléctrico" },
    { nombre: "Alternador", categoria: "Eléctrico" },
    { nombre: "Motor de arranque", categoria: "Eléctrico" }
  ];

  useEffect(() => {
    if (plantilla) {
      setNombre(plantilla.nombre);
      setMarca(plantilla.marca);
      setModelo(plantilla.modelo);
      setVersion(plantilla.version);
      setObservaciones(plantilla.observaciones || "");
      setActiva(plantilla.activa);
      setPiezas(plantilla.piezas);
    }
  }, [plantilla]);

  const handleAgregarPiezaExistente = (piezaInfo: { nombre: string; categoria: string }) => {
    const nuevaPiezaId = Math.max(0, ...piezas.map(p => p.id)) + 1;
    const pieza: PiezaPlantilla = {
      id: nuevaPiezaId,
      nombre: piezaInfo.nombre,
      descripcion: "",
      categoria: piezaInfo.categoria,
      obligatoria: false
    };
    
    setPiezas([...piezas, pieza]);
    setBusquedaPieza("");
  };

  const handleAgregarNuevaPieza = () => {
    if (!nuevaPieza.nombre || !nuevaPieza.categoria) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y la categoría son obligatorios.",
        variant: "destructive"
      });
      return;
    }

    const piezaId = Math.max(0, ...piezas.map(p => p.id)) + 1;
    const pieza: PiezaPlantilla = {
      id: piezaId,
      ...nuevaPieza
    };
    
    setPiezas([...piezas, pieza]);
    setNuevaPieza({
      nombre: "",
      descripcion: "",
      categoria: "",
      obligatoria: false
    });
  };

  const handleEliminarPieza = (id: number) => {
    setPiezas(piezas.filter(p => p.id !== id));
  };

  const handleToggleObligatoria = (id: number) => {
    setPiezas(piezas.map(p => 
      p.id === id ? { ...p, obligatoria: !p.obligatoria } : p
    ));
  };

  const handleGuardar = () => {
    if (!nombre || !marca || !modelo) {
      toast({
        title: "Campos requeridos",
        description: "El nombre, marca y modelo son obligatorios.",
        variant: "destructive"
      });
      return;
    }

    const plantillaData = {
      nombre,
      marca,
      modelo,
      version,
      observaciones,
      activa,
      piezas,
      fecha_modificacion: plantilla ? new Date() : undefined
    };

    onGuardar(plantillaData);
  };

  const piezasFiltradas = piezasDisponibles.filter(pieza =>
    pieza.nombre.toLowerCase().includes(busquedaPieza.toLowerCase()) &&
    !piezas.some(p => p.nombre === pieza.nombre)
  );

  return (
    <Dialog open={true} onOpenChange={onCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plantilla ? "Editar Plantilla" : "Nueva Plantilla de Vehículo"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Plantilla</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Renault Megane IV - Despiece Básico"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Renault"
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Megane"
                />
              </div>
              <div>
                <Label htmlFor="version">Versión</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="IV"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la plantilla..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="activa" checked={activa} onCheckedChange={setActiva} />
              <Label htmlFor="activa">Plantilla activa</Label>
            </div>
          </div>

          {/* Gestión de piezas */}
          <div className="space-y-4">
            <div>
              <Label>Buscar Piezas Existentes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={busquedaPieza}
                  onChange={(e) => setBusquedaPieza(e.target.value)}
                  placeholder="Buscar pieza..."
                  className="pl-10"
                />
              </div>
              {busquedaPieza && piezasFiltradas.length > 0 && (
                <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                  {piezasFiltradas.slice(0, 5).map((pieza, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleAgregarPiezaExistente(pieza)}
                    >
                      <div className="font-medium">{pieza.nombre}</div>
                      <div className="text-sm text-muted-foreground">{pieza.categoria}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Agregar Nueva Pieza</Label>
              <div className="space-y-2">
                <Input
                  value={nuevaPieza.nombre}
                  onChange={(e) => setNuevaPieza({...nuevaPieza, nombre: e.target.value})}
                  placeholder="Nombre de la pieza"
                />
                <Input
                  value={nuevaPieza.descripcion}
                  onChange={(e) => setNuevaPieza({...nuevaPieza, descripcion: e.target.value})}
                  placeholder="Descripción (opcional)"
                />
                <div className="flex gap-2">
                  <Input
                    value={nuevaPieza.categoria}
                    onChange={(e) => setNuevaPieza({...nuevaPieza, categoria: e.target.value})}
                    placeholder="Categoría"
                    className="flex-1"
                  />
                  <Button onClick={handleAgregarNuevaPieza} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de piezas seleccionadas */}
        <div className="mt-6">
          <Label>Piezas en la Plantilla ({piezas.length})</Label>
          <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
            {piezas.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No hay piezas agregadas a la plantilla
              </div>
            ) : (
              piezas.map((pieza) => (
                <div key={pieza.id} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pieza.nombre}</span>
                      <Badge variant="outline">{pieza.categoria}</Badge>
                      {pieza.obligatoria && (
                        <Badge className="bg-red-100 text-red-800">Obligatoria</Badge>
                      )}
                    </div>
                    {pieza.descripcion && (
                      <div className="text-sm text-muted-foreground">{pieza.descripcion}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={pieza.obligatoria ? "default" : "outline"}
                      onClick={() => handleToggleObligatoria(pieza.id)}
                    >
                      {pieza.obligatoria ? "Obligatoria" : "Opcional"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEliminarPieza(pieza.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            {plantilla ? "Actualizar" : "Crear"} Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NuevaPlantillaDialog;
