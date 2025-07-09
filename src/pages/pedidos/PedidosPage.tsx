
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pedido } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { pedidos, clientes, piezas } from "@/data/mockData";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const PedidosPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEstados, setFilteredEstados] = useState<string[]>([]);
  
  const estadosPedidos = ["pendiente", "pagado", "enviado", "entregado", "cancelado", "devuelto"];
  
  const handleToggleEstado = (estado: string) => {
    setFilteredEstados(prev => 
      prev.includes(estado) 
        ? prev.filter(e => e !== estado) 
        : [...prev, estado]
    );
  };
  
  const filteredPedidos = pedidos.filter(pedido => {
    const searchMatch = 
      searchTerm === "" || 
      pedido.id.toString().includes(searchTerm) ||
      clientes.find(c => c.id === pedido.id_cliente)?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const estadoMatch = filteredEstados.length === 0 || filteredEstados.includes(pedido.estado);
    
    return searchMatch && estadoMatch;
  });

  const columns = [
    {
      header: "ID",
      accessor: (pedido: Pedido) => pedido.id.toString()
    },
    {
      header: "Cliente",
      accessor: (pedido: Pedido) => {
        const cliente = clientes.find(c => c.id === pedido.id_cliente);
        return cliente ? `${cliente.nombre} ${cliente.apellidos}` : "Desconocido";
      }
    },
    {
      header: "Pieza",
      accessor: (pedido: Pedido) => {
        const pieza = piezas.find(p => p.id === pedido.id_pieza);
        return pieza ? `${pieza.tipo_pieza} - ${pieza.descripcion}` : "Desconocido";
      }
    },
    {
      header: "Fecha",
      accessor: (pedido: Pedido) => new Date(pedido.fecha_pedido).toLocaleDateString('es-ES')
    },
    {
      header: "Estado",
      accessor: (pedido: Pedido) => pedido.estado,
      render: (pedido: Pedido) => (
        <Badge variant="outline" className={
          pedido.estado === "entregado" ? "border-green-500 text-green-500" :
          pedido.estado === "enviado" ? "border-blue-500 text-blue-500" :
          pedido.estado === "pagado" ? "border-blue-300 text-blue-300" :
          pedido.estado === "pendiente" ? "border-orange-500 text-orange-500" :
          pedido.estado === "cancelado" || pedido.estado === "devuelto" ? "border-red-500 text-red-500" :
          "border-gray-500 text-gray-500"
        }>
          {pedido.estado}
        </Badge>
      )
    },
    {
      header: "Total",
      accessor: (pedido: Pedido) => `${pedido.total.toFixed(2)} €`
    },
  ];

  const handleDelete = (id: number) => {
    toast({
      title: "Pedido eliminado",
      description: `El pedido con ID ${id} ha sido eliminado correctamente.`,
    });
  };

  return (
    <PageLayout title="Gestión de Pedidos">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <p className="text-muted-foreground">
            Administra los pedidos de piezas de vehículos
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto gap-2">
                <Filter className="h-4 w-4" /> 
                Filtrar
                {filteredEstados.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-6 px-2">
                    {filteredEstados.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {estadosPedidos.map((estado) => (
                <DropdownMenuCheckboxItem
                  key={estado}
                  checked={filteredEstados.includes(estado)}
                  onCheckedChange={() => handleToggleEstado(estado)}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => navigate("/pedidos/nuevo")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Pedido
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredPedidos}
        columns={columns}
        idField="id"
        basePath="/pedidos"
        onDelete={handleDelete}
      />
    </PageLayout>
  );
};

export default PedidosPage;
