
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { CampaAlmacenamiento } from "@/types";

interface NuevaCampaDialogProps {
  campa?: CampaAlmacenamiento | null;
  onGuardar: (campa: Omit<CampaAlmacenamiento, 'id' | 'fecha_creacion' | 'vehiculos_asignados'>) => void;
  onCerrar: () => void;
}

const NuevaCampaDialog: React.FC<NuevaCampaDialogProps> = ({
  campa,
  onGuardar,
  onCerrar
}) => {
  const { toast } = useToast();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ubicacionGps, setUbicacionGps] = useState("");
  const [capacidadMaxima, setCapacidadMaxima] = useState(50);
  const [estado, setEstado] = useState<'activa' | 'inactiva' | 'mantenimiento'>('activa');
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (campa) {
      setNombre(campa.nombre);
      setDireccion(campa.direccion);
      setUbicacionGps(campa.ubicacion_gps || "");
      setCapacidadMaxima(campa.capacidad_maxima);
      setEstado(campa.estado);
      setObservaciones(campa.observaciones || "");
    }
  }, [campa]);

  const handleGuardar = () => {
    if (!nombre || !direccion) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y la dirección son obligatorios.",
        variant: "destructive"
      });
      return;
    }

    if (capacidadMaxima <= 0) {
      toast({
        title: "Capacidad inválida",
        description: "La capacidad máxima debe ser mayor a 0.",
        variant: "destructive"
      });
      return;
    }

    const campaData = {
      nombre,
      direccion,
      ubicacion_gps: ubicacionGps || undefined,
      capacidad_maxima: capacidadMaxima,
      estado,
      observaciones: observaciones || undefined
    };

    onGuardar(campaData);
  };

  return (
    <Dialog open={true} onOpenChange={onCerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {campa ? "Editar Campa" : "Nueva Campa de Almacenamiento"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Campa</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Campa Principal"
              />
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección completa de la campa"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="ubicacion-gps">Coordenadas GPS (opcional)</Label>
              <Input
                id="ubicacion-gps"
                value={ubicacionGps}
                onChange={(e) => setUbicacionGps(e.target.value)}
                placeholder="Ej: 40.4168,-3.7038"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Formato: latitud,longitud
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="capacidad">Capacidad Máxima (vehículos)</Label>
              <Input
                id="capacidad"
                type="number"
                value={capacidadMaxima}
                onChange={(e) => setCapacidadMaxima(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as 'activa' | 'inactiva' | 'mantenimiento')}
                className="w-full p-2 border rounded-md"
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="mantenimiento">En Mantenimiento</option>
              </select>
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la campa..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Información adicional para edición */}
        {campa && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-semibold mb-2">Información Actual</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Vehículos asignados:</strong> {campa.vehiculos_asignados.length}
              </div>
              <div>
                <strong>Ocupación:</strong> {((campa.vehiculos_asignados.length / campa.capacidad_maxima) * 100).toFixed(1)}%
              </div>
              <div>
                <strong>Fecha de creación:</strong> {campa.fecha_creacion.toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            {campa ? "Actualizar" : "Crear"} Campa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NuevaCampaDialog;
