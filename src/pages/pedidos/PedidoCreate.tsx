
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PedidoForm from "@/components/orders/PedidoForm";
import { useToast } from "@/hooks/use-toast";

const PedidoCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Obtener los IDs de cliente y pieza si vienen como parámetros
  const clienteId = searchParams.get("cliente") ? parseInt(searchParams.get("cliente")!) : undefined;
  const piezaId = searchParams.get("pieza") ? parseInt(searchParams.get("pieza")!) : undefined;

  const handleSubmit = (data: any) => {
    // Aquí se implementaría la lógica para guardar el pedido en una API real
    console.log("Datos del pedido a crear:", data);
    
    toast({
      title: "Pedido creado",
      description: "El pedido ha sido registrado correctamente en el sistema.",
    });
    
    navigate("/pedidos");
  };

  return (
    <PageLayout title="Crear Nuevo Pedido">
      <div className="max-w-4xl mx-auto">
        <PedidoForm 
          onSubmit={handleSubmit} 
          clienteId={clienteId}
          piezaId={piezaId}
        />
      </div>
    </PageLayout>
  );
};

export default PedidoCreate;
