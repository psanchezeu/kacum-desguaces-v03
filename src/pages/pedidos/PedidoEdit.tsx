
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PedidoForm from "@/components/orders/PedidoForm";
import { useToast } from "@/hooks/use-toast";
import { Pedido } from "@/types";
import { pedidos } from "@/data/mockData";

const PedidoEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // En una aplicación real, se obtendría el pedido de una API
  const pedido = pedidos.find(p => p.id === Number(id)) as Pedido;

  const handleSubmit = (data: any) => {
    // Aquí se implementaría la lógica para actualizar el pedido en una API real
    console.log("Datos del pedido a actualizar:", data);
    
    toast({
      title: "Pedido actualizado",
      description: "Los datos del pedido han sido actualizados correctamente.",
    });
    
    navigate("/pedidos");
  };

  if (!pedido) {
    return (
      <PageLayout title="Pedido no encontrado">
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No se ha encontrado el pedido con ID {id}
          </p>
          <button
            onClick={() => navigate("/pedidos")}
            className="mt-4 text-primary hover:underline"
          >
            Volver al listado de pedidos
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Editar Pedido #${pedido.id}`}>
      <div className="max-w-4xl mx-auto">
        <PedidoForm initialData={pedido} onSubmit={handleSubmit} />
      </div>
    </PageLayout>
  );
};

export default PedidoEdit;
