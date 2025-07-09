
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import ClienteForm from "@/components/clients/ClienteForm";
import { useToast } from "@/hooks/use-toast";
import { Cliente } from "@/types";
import { clientesService } from "@/services/clientesService";
import { Loader2 } from "lucide-react";

const ClienteEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCliente = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await clientesService.getById(Number(id));
        setCliente(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar cliente:', err);
        setError('No se pudo cargar la información del cliente.');
        setCliente(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCliente();
  }, [id]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await clientesService.update(Number(id), data);
      
      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente han sido actualizados correctamente.",
      });
      
      navigate("/clientes");
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Cargando cliente...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando datos del cliente...</span>
        </div>
      </PageLayout>
    );
  }

  if (error || !cliente) {
    return (
      <PageLayout title="Error al cargar cliente">
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {error || `No se ha encontrado el cliente con ID ${id}`}
          </p>
          <button
            onClick={() => navigate("/clientes")}
            className="mt-4 text-primary hover:underline"
          >
            Volver al listado de clientes
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Editar Cliente: ${cliente.nombre} ${cliente.apellidos}`}>
      <div className="max-w-4xl mx-auto">
        <ClienteForm 
          initialData={cliente} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting}
        />
      </div>
    </PageLayout>
  );
};

export default ClienteEdit;
