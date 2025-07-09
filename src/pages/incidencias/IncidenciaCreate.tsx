
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import IncidenciaForm from "@/components/incidents/IncidenciaForm";
import { useToast } from "@/hooks/use-toast";

const IncidenciaCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Se podrían obtener parámetros para preconfigurar la incidencia
  const tipoParam = searchParams.get("tipo") || undefined;
  const entidadTipoParam = searchParams.get("entidad_tipo") || undefined;
  const entidadIdParam = searchParams.get("entidad_id") ? parseInt(searchParams.get("entidad_id")!) : undefined;

  const handleSubmit = (data: any) => {
    // Aquí se implementaría la lógica para guardar la incidencia en una API real
    console.log("Datos de la incidencia a crear:", data);
    
    toast({
      title: "Incidencia registrada",
      description: "La incidencia ha sido registrada correctamente en el sistema.",
    });
    
    navigate("/incidencias");
  };

  return (
    <PageLayout title="Crear Nueva Incidencia">
      <div className="max-w-4xl mx-auto">
        <IncidenciaForm onSubmit={handleSubmit} />
      </div>
    </PageLayout>
  );
};

export default IncidenciaCreate;
