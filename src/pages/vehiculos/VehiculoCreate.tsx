import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import VehiculoForm from "@/components/vehicles/VehiculoForm";
import { useToast } from "@/hooks/use-toast";
import { vehiculosService } from "@/services/vehiculosService";
import { Vehiculo } from "@/types";
import { Loader2 } from "lucide-react";

const VehiculoCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Vehiculo, 'id'>) => {
    setIsSubmitting(true);
    try {
      // Convertir los datos a los tipos correctos antes de enviarlos
      const formattedDate = data.fecha_matriculacion instanceof Date 
        ? data.fecha_matriculacion 
        : new Date(data.fecha_matriculacion);
      
      // Crear un objeto con los tipos correctos para TypeScript
      const vehiculoData: Omit<Vehiculo, 'id'> = {
        ...data,
        id_cliente: Number(data.id_cliente),
        anio_fabricacion: Number(data.anio_fabricacion),
        kilometros: Number(data.kilometros),
        fecha_matriculacion: formattedDate
      };
      
      await vehiculosService.create(vehiculoData);
      toast({
        title: "Vehículo registrado",
        description: "El vehículo ha sido registrado correctamente.",
      });
      navigate("/vehiculos");
    } catch (error) {
      console.error("Error al registrar vehículo:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el vehículo. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Registrar Nuevo Vehículo">
      <div className="max-w-4xl mx-auto">
        {isSubmitting ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Registrando vehículo...</span>
          </div>
        ) : (
          <VehiculoForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        )}
      </div>
    </PageLayout>
  );
};

export default VehiculoCreate;
