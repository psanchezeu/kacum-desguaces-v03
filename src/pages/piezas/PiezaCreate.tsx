
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PiezaForm from "@/components/parts/PiezaForm";
import { useToast } from "@/hooks/use-toast";
import { piezasService } from "@/services/piezasService";
import { Pieza } from "@/types";

const PiezaCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Obtener el ID del vehículo si viene como parámetro
  const vehiculoId = searchParams.get("vehiculo") ? parseInt(searchParams.get("vehiculo")!) : undefined;

  const handleSubmit = async (data: Omit<Pieza, 'id'>) => {
    setIsSubmitting(true);
    try {
      // Crear la pieza usando el servicio
      const nuevaPieza = await piezasService.create(data);
      
      toast({
        title: "Pieza registrada",
        description: "La pieza ha sido registrada correctamente en el sistema.",
      });
      
      if (vehiculoId) {
        navigate(`/vehiculos/${vehiculoId}/piezas`);
      } else {
        navigate("/piezas");
      }
    } catch (err) {
      console.error('Error al crear pieza:', err);
      toast({
        title: "Error",
        description: "No se pudo registrar la pieza. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Registrar Nueva Pieza">
      <div className="max-w-4xl mx-auto">
        <PiezaForm 
          onSubmit={handleSubmit} 
          vehiculoId={vehiculoId} 
          isLoading={isSubmitting} 
        />
      </div>
    </PageLayout>
  );
};

export default PiezaCreate;
