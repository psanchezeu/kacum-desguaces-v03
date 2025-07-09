
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import VehiculoForm from "@/components/vehicles/VehiculoForm";
import { useToast } from "@/hooks/use-toast";
import { Vehiculo } from "@/types";
import { vehiculosService } from "@/services/vehiculosService";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VehiculoEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVehiculo = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await vehiculosService.getById(Number(id));
        setVehiculo(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar el vehículo:', err);
        setError('No se pudo cargar la información del vehículo.');
        setVehiculo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehiculo();
  }, [id]);

  const handleSubmit = async (data: Partial<Vehiculo>) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      // Limpiar los datos antes de enviarlos
      const vehiculoData = { ...data };

      // Convertir strings vacíos de campos opcionales a null
      const optionalFields = ['version', 'vin', 'ubicacion_gps', 'observaciones'];
      optionalFields.forEach(field => {
        if (vehiculoData[field] === '') {
          vehiculoData[field] = null;
        }
      });

      // Asegurarse de que id_cliente no sea undefined, sino null
      if (vehiculoData.id_cliente === undefined) {
        vehiculoData.id_cliente = null;
      }
      
      await vehiculosService.update(Number(id), vehiculoData);
      toast({
        title: "Vehículo actualizado",
        description: "Los datos del vehículo han sido actualizados correctamente.",
      });
      
      navigate("/vehiculos");
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el vehículo. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Cargando vehículo...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando información del vehículo...</span>
        </div>
      </PageLayout>
    );
  }

  if (error || !vehiculo) {
    return (
      <PageLayout title="Vehículo no encontrado">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">{error || `No se ha encontrado el vehículo con ID ${id}`}</p>
          <Button 
            variant="outline"
            onClick={() => navigate("/vehiculos")}
          >
            Volver al listado de vehículos
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Editar Vehículo: ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`}>
      <div className="max-w-4xl mx-auto">
        <VehiculoForm 
          initialData={vehiculo} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </PageLayout>
  );
};

export default VehiculoEdit;
