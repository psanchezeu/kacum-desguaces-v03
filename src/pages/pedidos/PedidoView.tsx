
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FileText, User, Box, Truck, CalendarCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pedidos, clientes, piezas } from "@/data/mockData";

const PedidoView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // En una aplicación real, se obtendría el pedido de una API
  const pedido = pedidos.find(p => p.id === Number(id));
  const cliente = pedido ? clientes.find(c => c.id === pedido.id_cliente) : null;
  const pieza = pedido ? piezas.find(p => p.id === pedido.id_pieza) : null;
  
  const handleDelete = () => {
    // Aquí se implementaría la lógica para eliminar el pedido en una API real
    toast({
      title: "Pedido eliminado",
      description: "El pedido ha sido eliminado correctamente.",
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
    <PageLayout title={`Pedido #${pedido.id}`}>
      <div className="mb-6 flex justify-between items-center">
        <Badge variant="outline" className={`text-base py-1 px-3 
          ${pedido.estado === "entregado" ? "border-green-500 text-green-500" :
           pedido.estado === "enviado" ? "border-blue-500 text-blue-500" :
           pedido.estado === "pagado" ? "border-blue-300 text-blue-300" :
           pedido.estado === "pendiente" ? "border-orange-500 text-orange-500" :
           pedido.estado === "cancelado" || pedido.estado === "devuelto" ? "border-red-500 text-red-500" :
           "border-gray-500 text-gray-500"}`}>
          {pedido.estado}
        </Badge>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/pedidos/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p>
                  {cliente ? (
                    <span className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                      {cliente.nombre} {cliente.apellidos} {cliente.tipo_cliente === 'empresa' && `(${cliente.razon_social})`}
                    </span>
                  ) : (
                    "Cliente desconocido"
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pieza</p>
                <p>
                  {pieza ? (
                    <span className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/piezas/${pieza.id}`)}>
                      {pieza.tipo_pieza} - {pieza.descripcion}
                    </span>
                  ) : (
                    "Pieza desconocida"
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de V enta</p>
                <p className="capitalize">{pedido.tipo_venta}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha del Pedido</p>
                <p>{new Date(pedido.fecha_pedido).toLocaleDateString('es-ES')}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Método de Pago</p>
                <p className="capitalize">{pedido.metodo_pago}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresa de Envío</p>
                <p>{pedido.empresa_envio}</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Dirección de Envío</p>
                <p>{pedido.direccion_envio}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="font-bold text-lg">{pedido.total.toFixed(2)} €</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">IVA (21%)</p>
                <p>{(pedido.total * 0.21).toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/facturas/nuevo?pedido=${id}`)}>
              <FileText className="mr-2 h-4 w-4" /> Generar Factura
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/clientes/${pedido.id_cliente}`)}>
              <User className="mr-2 h-4 w-4" /> Ver Cliente
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/piezas/${pedido.id_pieza}`)}>
              <Box className="mr-2 h-4 w-4" /> Ver Pieza
            </Button>
            
            {pedido.estado === "pagado" && (
              <Button className="w-full justify-start bg-blue-500 hover:bg-blue-600">
                <Truck className="mr-2 h-4 w-4" /> Marcar como Enviado
              </Button>
            )}
            
            {pedido.estado === "enviado" && (
              <Button className="w-full justify-start bg-green-500 hover:bg-green-600">
                <CalendarCheck className="mr-2 h-4 w-4" /> Marcar como Entregado
              </Button>
            )}
            
            {pedido.estado !== "cancelado" && pedido.estado !== "devuelto" && (
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" /> Cancelar Pedido
              </Button>
            )}
            
            <div className="p-4 bg-muted rounded-lg mt-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{backgroundColor: 
                    pedido.estado === "entregado" ? "#22c55e" :
                    pedido.estado === "enviado" ? "#3b82f6" :
                    pedido.estado === "pagado" ? "#93c5fd" :
                    pedido.estado === "pendiente" ? "#f97316" :
                    pedido.estado === "cancelado" || pedido.estado === "devuelto" ? "#ef4444" : "#6b7280"
                  }}></span>
                Estado: {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
              </h4>
              <p className="text-xs text-muted-foreground">
                {pedido.estado === "pendiente" && "El pedido aún no ha sido pagado."}
                {pedido.estado === "pagado" && "El pedido está pagado y listo para envío."}
                {pedido.estado === "enviado" && "El pedido ha sido enviado y está en camino."}
                {pedido.estado === "entregado" && "El pedido ha sido entregado al cliente."}
                {pedido.estado === "cancelado" && "El pedido ha sido cancelado."}
                {pedido.estado === "devuelto" && "El pedido ha sido devuelto."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PedidoView;
