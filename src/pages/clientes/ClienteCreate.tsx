
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import ClienteForm from "@/components/clients/ClienteForm";
import { useToast } from "@/hooks/use-toast";
import { clientesService } from "@/services/clientesService";

const ClienteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await clientesService.create(data);
      
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado correctamente.",
      });
      
      navigate("/clientes");
    } catch (error) {
      console.error("Error al crear cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el cliente. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Crear Nuevo Cliente">
      <div className="max-w-4xl mx-auto">
        <ClienteForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </PageLayout>
  );
};

export default ClienteCreate;
