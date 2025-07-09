
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Vehiculo, Cliente } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { vehiculosService } from "@/services/vehiculosService";
import { clientesService } from "@/services/clientesService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VehiculosPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Efecto para cargar datos cuando cambia la página o el tamaño de página
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`Cargando vehículos: Página ${currentPage}, Tamaño ${pageSize}`);

        // Obtener vehículos con paginación
        const vehiculosResponse = await vehiculosService.getAll({
          page: currentPage,
          limit: pageSize,
          count: true,
        });

        if (!vehiculosResponse || !vehiculosResponse.data) {
          console.error('Respuesta inválida del servidor:', vehiculosResponse);
          throw new Error('Formato de respuesta inválido');
        }

        setVehiculos(vehiculosResponse.data);

        // Actualizar información de paginación
        if (vehiculosResponse.pagination) {
          const total = vehiculosResponse.pagination.total || 0;
          setTotalItems(total);
          
          // Calcular el número total de páginas correctamente
          const calculatedTotalPages = Math.max(
            1, 
            Math.ceil(total / pageSize)
          );
          setTotalPages(calculatedTotalPages);
          
          console.log(`Total items: ${total}, Total pages: ${calculatedTotalPages}, Página actual: ${currentPage}`);
        } else {
          console.warn('No se recibió información de paginación del servidor');
          // Establecer valores predeterminados si no hay información de paginación
          setTotalItems(vehiculosResponse.data.length);
          setTotalPages(1);
        }

        // Obtener clientes para mostrar nombres
        const clientesData = await clientesService.getAll();
        setClientes(clientesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Por favor, inténtalo de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize]); // Recargar cuando cambie la página o el tamaño de página

  const columns = [
    {
      header: "Matrícula",
      accessor: (vehiculo: Vehiculo) => vehiculo.matricula,
      render: (vehiculo: Vehiculo) => (
        <div className="font-medium">{vehiculo.matricula}</div>
      ),
    },
    {
      header: "Marca/Modelo",
      accessor: (vehiculo: Vehiculo) => `${vehiculo.marca} ${vehiculo.modelo}`,
      render: (vehiculo: Vehiculo) => (
        <div>
          <div>{vehiculo.marca} {vehiculo.modelo}</div>
          <div className="text-xs text-muted-foreground">{vehiculo.version}</div>
        </div>
      ),
    },
    {
      header: "Propietario",
      accessor: (vehiculo: Vehiculo) => {
        const cliente = clientes.find((c) => c.id === vehiculo.id_cliente);
        return cliente ? `${cliente.nombre} ${cliente.apellidos}` : "Desconocido";
      },
    },
    {
      header: "Estado",
      accessor: (vehiculo: Vehiculo) => vehiculo.estado,
      render: (vehiculo: Vehiculo) => (
        <Badge
          variant="outline"
          className={
            vehiculo.estado === "activo"
              ? "border-green-500 text-green-500"
              : vehiculo.estado === "procesando"
              ? "border-blue-500 text-blue-500"
              : vehiculo.estado === "desguazado"
              ? "border-orange-500 text-orange-500"
              : vehiculo.estado === "baja"
              ? "border-red-500 text-red-500"
              : "border-gray-500 text-gray-500"
          }
        >
          {vehiculo.estado}
        </Badge>
      ),
    },
    {
      header: "Ubicación",
      accessor: (vehiculo: Vehiculo) => vehiculo.ubicacion_actual,
    },
    {
      header: "Kilómetros",
      accessor: (vehiculo: Vehiculo) => `${vehiculo.kilometros.toLocaleString()} km`,
    },
  ];

  // Filtrar vehículos según el término de búsqueda
  const filteredVehiculos = vehiculos.filter((vehiculo) =>
    searchTerm === "" ||
    vehiculo.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehiculo.version && vehiculo.version.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para recargar datos
  const handleRefresh = async () => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener vehículos con paginación
        const vehiculosResponse = await vehiculosService.getAll({
          page: currentPage,
          limit: pageSize,
          count: true,
        });

        setVehiculos(vehiculosResponse.data);

        // Actualizar información de paginación
        if (vehiculosResponse.pagination) {
          setTotalItems(vehiculosResponse.pagination.total || 0);
          setTotalPages(vehiculosResponse.pagination.totalPages || 1);
        }

        // Obtener clientes para mostrar nombres
        const clientesData = await clientesService.getAll();
        setClientes(clientesData);

        toast({
          title: "Datos actualizados",
          description: "La lista de vehículos ha sido actualizada.",
        });
      } catch (err) {
        console.error("Error refreshing data:", err);
        setError("Error al recargar los datos. Por favor, inténtalo de nuevo.");
        toast({
          title: "Error",
          description: "No se pudieron actualizar los datos. Inténtalo de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  };

  const handleDelete = async (id: number) => {
    try {
      await vehiculosService.delete(id);
      setVehiculos(vehiculos.filter((v) => v.id !== id));
      toast({
        title: "Vehículo eliminado",
        description: `El vehículo con ID ${id} ha sido eliminado correctamente.`,
      });
    } catch (err) {
      console.error("Error al eliminar vehículo:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true);
      await vehiculosService.deleteAll();

      // Actualizar la lista de vehículos tras eliminar todos
      setVehiculos([]);

      toast({
        title: "Vehículos eliminados",
        description: "Todos los vehículos han sido eliminados correctamente.",
      });

      setShowDeleteAllDialog(false);
    } catch (err) {
      console.error("Error al eliminar todos los vehículos:", err);
      toast({
        title: "Error",
        description: "No se pudieron eliminar todos los vehículos. Es posible que algunos tengan piezas asociadas.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <PageLayout title="Gestión de Vehículos">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <p className="text-muted-foreground">
            Administra los vehículos registrados en el desguace
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vehículos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
          <Button onClick={() => navigate("/vehiculos/nuevo")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAllDialog(true)}
            disabled={isLoading || isDeletingAll || vehiculos.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Todos
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-lg">Cargando vehículos...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Intentar de nuevo
          </Button>
        </div>
      ) : (
        <>
          <DataTable
            data={filteredVehiculos}
            columns={columns}
            idField="id"
            basePath="/vehiculos"
            onDelete={handleDelete}
            compact={true}
            paginated={false} // Desactivamos la paginación interna del DataTable ya que la manejamos a nivel de página
            emptyMessage="No se encontraron vehículos"
          />

          {/* Controles de paginación */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {totalItems > 0 
                ? `Mostrando ${vehiculos.length} de ${totalItems} vehículos` 
                : `Mostrando ${vehiculos.length} vehículos`}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Vehículos por página</p>
                <select
                  className="h-8 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                >
                  {[10, 25, 50, 100, 200].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={(currentPage >= totalPages) || isLoading || totalPages <= 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Diálogo de confirmación para eliminar todos los vehículos */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar todos los vehículos</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">¡Atención! Esta acción no se puede deshacer.</span>
                </div>
                <p>
                  Estás a punto de eliminar <strong>todos los vehículos</strong> del sistema. Esta
                  acción eliminará permanentemente todos los vehículos, sus documentos y solicitudes
                  de recogida asociadas.
                </p>
                <p>
                  Los vehículos que tengan piezas asociadas no podrán ser eliminados.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)} disabled={isDeletingAll}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Todos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default VehiculosPage;
