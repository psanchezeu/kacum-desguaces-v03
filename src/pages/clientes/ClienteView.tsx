
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Car, Box, ShoppingCart, Loader2 } from "lucide-react";
import TabsNavigation, { TabItem } from "@/components/common/TabsNavigation";
import { useToast } from "@/hooks/use-toast";
import { clientesService } from "@/services/clientesService";
import { vehiculosService } from "@/services/vehiculosService";
import DataTable from "@/components/common/DataTable";
import { Cliente, Vehiculo } from "@/types";

const ClienteInfoTab: React.FC<{ cliente: Cliente; vehiculos: Vehiculo[] }> = ({ cliente, vehiculos }) => {
  // Ya no necesitamos filtrar los vehículos porque los recibimos como prop
  const clienteVehiculos = vehiculos;
  // Por ahora no tenemos pedidos desde el backend, así que mostramos una lista vacía
  const clientePedidos: any[] = [];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
              <p>{cliente.nombre} {cliente.apellidos}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {cliente.tipo_cliente === "particular" ? "DNI/NIF" : "CIF"}
              </p>
              <p>{cliente.tipo_cliente === "particular" ? cliente.dni_nif : cliente.cif}</p>
            </div>
            
            {cliente.tipo_cliente === "empresa" && cliente.razon_social && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Razón Social</p>
                <p>{cliente.razon_social}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{cliente.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p>{cliente.telefono}</p>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              <p>{cliente.direccion}</p>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
              <p>{cliente.observaciones || "No hay observaciones disponibles"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Datos Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Alta</p>
              <p>{new Date(cliente.fecha_alta).toLocaleDateString('es-ES')}</p>
            </div>
            
            {cliente.fecha_baja && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Baja</p>
                <p>{new Date(cliente.fecha_baja).toLocaleDateString('es-ES')}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{clienteVehiculos.length} Vehículos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{clientePedidos.length} Pedidos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  0 Piezas asociadas {/* Pendiente de integrar con API de piezas */}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acepta Comunicaciones</p>
              <Badge variant={cliente.acepta_comunicaciones ? "default" : "outline"}>
                {cliente.acepta_comunicaciones ? "Sí" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ClienteVehiculosTab: React.FC<{ clienteId: number }> = ({ clienteId }) => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVehiculos = async () => {
      setIsLoading(true);
      try {
        const data = await vehiculosService.getByClienteId(clienteId);
        setVehiculos(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar vehículos del cliente:', err);
        setError('No se pudieron cargar los vehículos del cliente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehiculos();
  }, [clienteId]);
  
  const vehiculosColumns = [
    {
      header: "Matrícula",
      accessor: (v: any) => v.matricula
    },
    {
      header: "Marca/Modelo",
      accessor: (v: any) => `${v.marca} ${v.modelo}`
    },
    {
      header: "Año",
      accessor: (v: any) => v.anio_fabricacion
    },
    {
      header: "Estado",
      accessor: (v: any) => v.estado,
      render: (v: any) => (
        <Badge variant="outline" className={
          v.estado === "activo" ? "border-green-500 text-green-500" :
          v.estado === "procesado" ? "border-blue-500 text-blue-500" :
          v.estado === "baja" ? "border-red-500 text-red-500" :
          "border-gray-500 text-gray-500"
        }>
          {v.estado}
        </Badge>
      )
    },
    {
      header: "Ubicación",
      accessor: (v: any) => v.ubicacion_actual
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehículos del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Cargando vehículos...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : (
          <DataTable
            data={vehiculos}
            columns={vehiculosColumns}
            idField="id"
            basePath="/vehiculos"
            emptyMessage="Este cliente no tiene vehículos registrados"
          />
        )}
      </CardContent>
    </Card>
  );
};

const ClientePedidosTab: React.FC<{ clienteId: number }> = ({ clienteId }) => {
  // Por ahora no tenemos pedidos desde el backend, así que mostramos un mensaje
  const clientePedidos: any[] = [];
  
  const pedidosColumns = [
    {
      header: "ID",
      accessor: (p: any) => p.id.toString()
    },
    {
      header: "Fecha",
      accessor: (p: any) => new Date(p.fecha_pedido).toLocaleDateString('es-ES')
    },
    {
      header: "Estado",
      accessor: (p: any) => p.estado,
      render: (p: any) => (
        <Badge variant="outline" className={
          p.estado === "entregado" ? "border-green-500 text-green-500" :
          p.estado === "enviado" ? "border-blue-500 text-blue-500" :
          p.estado === "pendiente" ? "border-orange-500 text-orange-500" :
          p.estado === "cancelado" ? "border-red-500 text-red-500" :
          "border-gray-500 text-gray-500"
        }>
          {p.estado}
        </Badge>
      )
    },
    {
      header: "Total",
      accessor: (p: any) => `${p.total.toFixed(2)} €`
    },
    {
      header: "Método Pago",
      accessor: (p: any) => p.metodo_pago
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Pedidos del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={clientePedidos}
          columns={pedidosColumns}
          idField="id"
          basePath="/pedidos"
          emptyMessage="Este cliente no tiene pedidos registrados"
        />
      </CardContent>
    </Card>
  );
};

const ClienteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCliente = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const clienteData = await clientesService.getById(Number(id));
        setCliente(clienteData);
        
        // Cargar vehículos del cliente
        try {
          const vehiculosData = await vehiculosService.getByClienteId(Number(id));
          setVehiculos(vehiculosData);
        } catch (err) {
          console.error('Error al cargar vehículos del cliente:', err);
          // No establecemos error para no bloquear toda la vista
          setVehiculos([]);
        }
        
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
  
  // Tabs para la navegación
  const tabs: TabItem[] = [
    { label: "Información", value: "info", path: `/clientes/${id}` },
    { label: "Vehículos", value: "vehiculos", path: `/clientes/${id}/vehiculos` },
    { label: "Pedidos", value: "pedidos", path: `/clientes/${id}/pedidos` }
  ];

  const handleDelete = async () => {
    if (!cliente || !id) return;
    
    try {
      setIsDeleting(true);
      await clientesService.delete(Number(id));
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente.",
      });
      navigate("/clientes");
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Cargando cliente...">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-lg">Cargando información del cliente...</span>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !cliente) {
    return (
      <PageLayout title="Cliente no encontrado">
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
    <PageLayout title={`Cliente: ${cliente.nombre} ${cliente.apellidos}`}>
      <div className="mb-6 flex justify-between items-center">
        <Badge variant={cliente.tipo_cliente === "particular" ? "outline" : "default"} className="text-base py-1 px-3">
          {cliente.tipo_cliente === "particular" ? "Cliente Particular" : "Empresa"}
        </Badge>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/clientes/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </>
            )}
          </Button>
        </div>
      </div>

      <TabsNavigation tabs={tabs} className="mb-6" />

      <Routes>
        <Route path="/" element={<ClienteInfoTab cliente={cliente} vehiculos={vehiculos} />} />
        <Route path="/vehiculos" element={<ClienteVehiculosTab clienteId={Number(id)} />} />
        <Route path="/pedidos" element={<ClientePedidosTab clienteId={Number(id)} />} />
        <Route path="*" element={<Navigate to={`/clientes/${id}`} replace />} />
      </Routes>
    </PageLayout>
  );
};

export default ClienteView;
