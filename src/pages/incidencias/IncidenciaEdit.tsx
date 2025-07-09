
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import IncidenciaForm from "@/components/incidents/IncidenciaForm";
import { useToast } from "@/hooks/use-toast";
import { Incidencia } from "@/types";
import { incidencias } from "@/data/mockData";

const IncidenciaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // En una aplicación real, se obtendría la incidencia de una API
  const incidencia = incidencias.find(i => i.id === Number(id)) as Incidencia;

  const handleSubmit = (data: any) => {
    // Aquí se implementaría la lógica para actualizar la incidencia en una API real
    console.log("Datos de la incidencia a actualizar:", data);
    
    toast({
      title: "Incidencia actualizada",
      description: "Los datos de la incidencia han sido actualizados correctamente.",
    });
    
    navigate("/incidencias");
  };

  if (!incidencia) {
    return (
      <PageLayout title="Incidencia no encontrada">
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No se ha encontrado la incidencia con ID {id}
          </p>
          <button
            onClick={() => navigate("/incidencias")}
            className="mt-4 text-primary hover:underline"
          >
            Volver al listado de incidencias
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Editar Incidencia #${incidencia.id}`}>
      <div className="max-w-4xl mx-auto">
        <IncidenciaForm initialData={incidencia} onSubmit={handleSubmit} />
      </div>
    </PageLayout>
  );
};

export default IncidenciaEdit;
