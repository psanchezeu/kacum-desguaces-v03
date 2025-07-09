
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PiezaForm from "@/components/parts/PiezaForm";
import { useToast } from "@/hooks/use-toast";
import { Pieza } from "@/types";
import { piezasService } from "@/services/piezasService";
import { Loader2 } from "lucide-react";

const PiezaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [pieza, setPieza] = useState<Pieza | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar datos de la pieza
  useEffect(() => {
    const fetchPieza = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const piezaData = await piezasService.getById(Number(id));
        setPieza(piezaData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar pieza:', err);
        setError('No se pudo cargar la información de la pieza');
        setPieza(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPieza();
  }, [id]);

  const handleSubmit = async (data: Partial<Pieza>) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      // Actualizar la pieza usando el servicio
      await piezasService.update(Number(id), data);
      
      toast({
        title: "Pieza actualizada",
        description: "Los datos de la pieza han sido actualizados correctamente.",
      });
      
      navigate("/piezas");
    } catch (err) {
      console.error('Error al actualizar pieza:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar la pieza. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Cargando pieza...">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !pieza) {
    return (
      <PageLayout title="Pieza no encontrada">
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {error || `No se ha encontrado la pieza con ID ${id}`}
          </p>
          <button
            onClick={() => navigate("/piezas")}
            className="mt-4 text-primary hover:underline"
          >
            Volver al listado de piezas
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Editar Pieza: ${pieza.tipo_pieza}`}>
      <div className="max-w-4xl mx-auto">
        <PiezaForm 
          initialData={pieza} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </PageLayout>
  );
};

export default PiezaEdit;
