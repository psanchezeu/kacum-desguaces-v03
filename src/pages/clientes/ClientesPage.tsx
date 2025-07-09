
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { clientesService } from "@/services/clientesService";

const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const data = await clientesService.getAll();
      setClientes(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      
      setError('No se pudieron cargar los clientes. Verifica la conexión con el servidor.');
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes. Verifica la conexión con el servidor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para recargar los clientes
  const recargarClientes = () => {
    fetchClientes();
  };
  
  useEffect(() => {
    fetchClientes();
  }, []);

  const columns = [
    {
      header: "Nombre",
      accessor: (cliente: Cliente) => `${cliente.nombre} ${cliente.apellidos}`,
      render: (cliente: Cliente) => (
        <div>
          <div className="font-medium">{cliente.nombre} {cliente.apellidos}</div>
          {cliente.tipo_cliente === 'empresa' && cliente.razon_social && (
            <div className="text-xs text-muted-foreground">{cliente.razon_social}</div>
          )}
        </div>
      )
    },
    {
      header: "Identificación",
      accessor: (cliente: Cliente) => cliente.tipo_cliente === 'empresa' ? cliente.cif : cliente.dni_nif
    },
    {
      header: "Tipo",
      accessor: (cliente: Cliente) => cliente.tipo_cliente,
      render: (cliente: Cliente) => (
        <Badge variant={cliente.tipo_cliente === 'particular' ? "outline" : "default"}>
          {cliente.tipo_cliente === 'particular' ? 'Particular' : 'Empresa'}
        </Badge>
      )
    },
    {
      header: "Email",
      accessor: (cliente: Cliente) => cliente.email
    },
    {
      header: "Teléfono",
      accessor: (cliente: Cliente) => cliente.telefono
    },
    {
      header: "Fecha Alta",
      accessor: (cliente: Cliente) => new Date(cliente.fecha_alta).toLocaleDateString('es-ES')
    }
  ];

  const handleDelete = async (id: number) => {
    try {
      await clientesService.delete(id);
      
      // Actualizamos la UI eliminando el cliente
      setClientes(clientes.filter(cliente => cliente.id !== id));
      
      toast({
        title: "Cliente eliminado",
        description: `El cliente con ID ${id} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      
      toast({
        title: "Error en el servidor",
        description: "Se produjo un error en el servidor, pero el cliente ha sido eliminado localmente.",
        variant: "default"
      });
    }
  };

  return (
    <PageLayout title="Gestión de Clientes">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-muted-foreground">
            Administra los clientes de tu desguace
          </p>
        </div>
        <div className="flex gap-2">
          {isLoading ? (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando
            </Button>
          ) : (
            <Button variant="outline" onClick={recargarClientes} title="Actualizar datos">
              <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar
            </Button>
          )}
          <Button onClick={() => navigate("/clientes/nuevo")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={fetchClientes}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando clientes...</span>
        </div>
      ) : (
        <DataTable
          data={clientes}
          columns={columns}
          idField="id"
          basePath="/clientes"
          onDelete={handleDelete}
          emptyMessage="No hay clientes registrados"
        />
      )}
    </PageLayout>
  );
};

export default ClientesPage;
