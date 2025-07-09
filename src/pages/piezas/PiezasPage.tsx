
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pieza, Vehiculo } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { piezasService, PaginatedResponse, PaginationParams } from "@/services/piezasService";
import { vehiculosService } from "@/services/vehiculosService";
import { fotosService, Foto } from "@/services/fotosService";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PiezasPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [vehiculos, setVehiculos] = useState<Record<number, Vehiculo>>({});
  const [fotosPrincipales, setFotosPrincipales] = useState<Record<number, Foto | null>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Filter by vehiculo if provided in query params
  const vehiculoId = searchParams.get("vehiculo") ? parseInt(searchParams.get("vehiculo")!) : null;
  
  // Cargar datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar piezas (filtradas por vehículo si es necesario)
        let piezasResponse: PaginatedResponse<Pieza>;
        const paginationParams: PaginationParams = {
          page: currentPage,
          limit: pageSize,
          count: true
        };
        
        if (vehiculoId) {
          piezasResponse = await piezasService.getAll(vehiculoId, paginationParams);
        } else {
          piezasResponse = await piezasService.getAll(undefined, paginationParams);
        }
        
        setPiezas(piezasResponse.data || []);
        
        // Actualizar información de paginación
        if (piezasResponse.pagination) {
          setTotalItems(piezasResponse.pagination.total || 0);
          setTotalPages(piezasResponse.pagination.totalPages || 1);
        }
        
        // Crear un mapa de vehículos para mostrar información relacionada
        const vehiculosMap: Record<number, Vehiculo> = {};
        const vehiculoIds = [...new Set(piezasResponse.data.map(p => p.id_vehiculo).filter(id => id !== null))];
        
        // Cargar información de vehículos relacionados
        await Promise.all(vehiculoIds.map(async (id) => {
          if (id === null) return;
          try {
            const vehiculo = await vehiculosService.getById(id);
            vehiculosMap[id] = vehiculo;
          } catch (err) {
            console.error(`Error al cargar vehículo ID ${id}:`, err);
          }
        }));
        
        setVehiculos(vehiculosMap);
        
        // Cargar las fotos principales de cada pieza
        const fotosPrincipalesMap: Record<number, Foto | null> = {};
        await Promise.all(piezasResponse.data.map(async (pieza) => {
          try {
            const fotoPrincipal = await fotosService.getPrincipalByPiezaId(pieza.id);
            fotosPrincipalesMap[pieza.id] = fotoPrincipal;
          } catch (err) {
            console.error(`Error al cargar foto principal de pieza ID ${pieza.id}:`, err);
            fotosPrincipalesMap[pieza.id] = null;
          }
        }));
        
        setFotosPrincipales(fotosPrincipalesMap);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [vehiculoId, currentPage, pageSize]);
  
  const filteredPiezas = piezas
    .filter(pieza => 
      (searchTerm === "" || 
        pieza.tipo_pieza.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pieza.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const columns = [
    {
      header: "Imagen",
      accessor: (pieza: Pieza) => pieza.id,
      render: (pieza: Pieza) => {
        const fotoPrincipal = fotosPrincipales[pieza.id];
        return (
          <div className="w-12 h-12 relative overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            {fotoPrincipal ? (
              <ImageWithFallback
                src={fotoPrincipal.url}
                fallbackSrc="/placeholder-pieza.jpg"
                alt={pieza.tipo_pieza}
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-xs">Sin foto</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "Tipo",
      accessor: (pieza: Pieza) => pieza.tipo_pieza,
      render: (pieza: Pieza) => (
        <div className="font-medium">{pieza.tipo_pieza}</div>
      )
    },
    {
      header: "Descripción",
      accessor: (pieza: Pieza) => pieza.descripcion
    },
    {
      header: "Vehículo",
      accessor: (pieza: Pieza) => {
        const vehiculo = vehiculos[pieza.id_vehiculo];
        return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})` : "Desconocido";
      }
    },
    {
      header: "Estado",
      accessor: (pieza: Pieza) => pieza.estado,
      render: (pieza: Pieza) => (
        <Badge variant="outline" className={
          pieza.estado === "nueva" ? "border-green-500 text-green-500" :
          pieza.estado === "usada" ? "border-blue-500 text-blue-500" :
          pieza.estado === "dañada" ? "border-red-500 text-red-500" :
          pieza.estado === "en_revision" ? "border-amber-500 text-amber-500" :
          "border-gray-500 text-gray-500"
        }>
          {pieza.estado}
        </Badge>
      )
    },
    // Columna de ubicación eliminada para hacer la tabla más compacta
    {
      header: "Precio",
      accessor: (pieza: Pieza) => `${pieza.precio_venta.toFixed(2)} €`
    },
  ];

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await piezasService.delete(id);
      
      // Actualizar la lista de piezas tras eliminar
      setPiezas(piezas.filter(p => p.id !== id));
      
      toast({
        title: "Pieza eliminada",
        description: `La pieza con ID ${id} ha sido eliminada correctamente.`,
      });
    } catch (err) {
      console.error('Error al eliminar pieza:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la pieza. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true);
      await piezasService.deleteAll();
      
      // Actualizar la lista de piezas tras eliminar todas
      setPiezas([]);
      setFotosPrincipales({});
      
      toast({
        title: "Piezas eliminadas",
        description: "Todas las piezas han sido eliminadas correctamente.",
      });
      
      setShowDeleteAllDialog(false);
    } catch (err) {
      console.error('Error al eliminar todas las piezas:', err);
      toast({
        title: "Error",
        description: "No se pudieron eliminar todas las piezas. Es posible que algunas tengan pedidos asociados.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };
  
  // Función para recargar datos
  const handleRefresh = () => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar piezas (filtradas por vehículo si es necesario)
        let piezasResponse: PaginatedResponse<Pieza>;
        const paginationParams: PaginationParams = {
          page: currentPage,
          limit: pageSize,
          count: true
        };
        
        if (vehiculoId) {
          piezasResponse = await piezasService.getAll(vehiculoId, paginationParams);
        } else {
          piezasResponse = await piezasService.getAll(undefined, paginationParams);
        }
        
        setPiezas(piezasResponse.data || []);
        
        // Actualizar información de paginación
        if (piezasResponse.pagination) {
          setTotalItems(piezasResponse.pagination.total || 0);
          setTotalPages(piezasResponse.pagination.totalPages || 1);
        }
        
        // Crear un mapa de vehículos para mostrar información relacionada
        const vehiculosMap: Record<number, Vehiculo> = {};
        const vehiculoIds = [...new Set(piezasResponse.data.map(p => p.id_vehiculo).filter(id => id !== null))];
        
        // Cargar información de vehículos relacionados
        await Promise.all(vehiculoIds.map(async (id) => {
          if (id === null) return;
          try {
            const vehiculo = await vehiculosService.getById(id);
            vehiculosMap[id] = vehiculo;
          } catch (err) {
            console.error(`Error al cargar vehículo ID ${id}:`, err);
          }
        }));
        
        setVehiculos(vehiculosMap);
        
        // Cargar las fotos principales de cada pieza
        const fotosPrincipalesMap: Record<number, Foto | null> = {};
        await Promise.all(piezasResponse.data.map(async (pieza) => {
          try {
            const fotoPrincipal = await fotosService.getPrincipalByPiezaId(pieza.id);
            fotosPrincipalesMap[pieza.id] = fotoPrincipal;
          } catch (err) {
            console.error(`Error al cargar foto principal de pieza ID ${pieza.id}:`, err);
            fotosPrincipalesMap[pieza.id] = null;
          }
        }));
        
        setFotosPrincipales(fotosPrincipalesMap);
        setError(null);
      } catch (err) {
        console.error('Error al recargar datos:', err);
        setError('No se pudieron cargar los datos. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  };

  return (
    <PageLayout title={vehiculoId ? "Piezas del Vehículo" : "Gestión de Piezas"}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          {vehiculoId ? (
            <div className="flex items-center">
              <p className="text-muted-foreground mr-2">
                Mostrando piezas del vehículo:
              </p>
              <Badge variant="outline" className="cursor-pointer" onClick={() => navigate(`/vehiculos/${vehiculoId}`)}>
                {(() => {
                  const vehiculo = vehiculos[vehiculoId];
                  return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})` : `ID: ${vehiculoId}`;
                })()}
              </Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Administra las piezas de vehículos desguazados
            </p>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar piezas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
          <Button onClick={() => navigate(vehiculoId ? `/piezas/nuevo?vehiculo=${vehiculoId}` : "/piezas/nuevo")}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Pieza
          </Button>
          {!vehiculoId && (
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteAllDialog(true)} 
              disabled={isLoading || isDeletingAll || piezas.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Todas
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-lg">Cargando piezas...</span>
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
            data={filteredPiezas}
            columns={columns}
            idField="id"
            basePath="/piezas"
            onDelete={handleDelete}
            emptyMessage="No se encontraron piezas"
            compact={true}
          />
          
          {/* Controles de paginación */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Mostrando {piezas.length} de {totalItems} piezas
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Piezas por página</p>
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
                  disabled={currentPage === totalPages || isLoading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Diálogo de confirmación para eliminar todas las piezas */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar todas las piezas</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">¡Atención! Esta acción no se puede deshacer.</span>
            </div>
            <div>
              Estás a punto de eliminar <strong>todas las piezas</strong> del sistema. 
              Esta acción eliminará permanentemente todas las piezas, sus fotos y su historial de estados.
            </div>
            <div>
              Las piezas que tengan pedidos asociados no podrán ser eliminadas.
            </div>
          </div>
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
                  Eliminar Todas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default PiezasPage;
