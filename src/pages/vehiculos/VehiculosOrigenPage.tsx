import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Calendar, Fuel, Gauge, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { vehiculosOrigenService } from "@/services/vehiculosOrigenService";
import { Vehiculo } from "@/types";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const VehiculosOrigenPage: React.FC = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [marcaFilter, setMarcaFilter] = useState<string>("todas");
  const [modeloFilter, setModeloFilter] = useState<string>("todos");
  const [anioFilter, setAnioFilter] = useState<string>("todos");
  const [combustibleFilter, setCombustibleFilter] = useState<string>("todos");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(15); // 5 vehículos por fila, 3 filas
  const [paginationInfo, setPaginationInfo] = useState<{page: number, limit: number, total: number, totalPages: number}>(
    {page: 1, limit: itemsPerPage, total: 0, totalPages: 0}
  );
  
  // Conjuntos para almacenar valores únicos para los filtros
  const [marcasDisponibles, setMarcasDisponibles] = useState<Set<string>>(new Set());
  const [modelosDisponibles, setModelosDisponibles] = useState<Set<string>>(new Set());
  const [aniosDisponibles, setAniosDisponibles] = useState<Set<string>>(new Set());
  const [combustiblesDisponibles, setCombustiblesDisponibles] = useState<Set<string>>(new Set());

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Obtener valores únicos para los filtros usando los métodos específicos
        const [marcas, modelos, anios, combustibles] = await Promise.all([
          vehiculosOrigenService.getMarcasUnicas(),
          vehiculosOrigenService.getModelosUnicos(),
          vehiculosOrigenService.getAniosUnicos(),
          vehiculosOrigenService.getCombustiblesUnicos()
        ]);
        
        // Convertir a Set para mantener la compatibilidad con el código existente
        setMarcasDisponibles(new Set(marcas));
        setModelosDisponibles(new Set(modelos));
        setAniosDisponibles(new Set(anios.map(a => a.toString())));
        setCombustiblesDisponibles(new Set(combustibles));
      } catch (error) {
        console.error("Error al cargar datos de filtros:", error);
      }
    };
    
    cargarDatosIniciales();
  }, []); // Solo se ejecuta una vez al cargar la página
  
  // Escuchar actualizaciones de vehículos en segundo plano
  useEffect(() => {
    // Función para manejar actualizaciones de vehículos individuales
    const handleVehiculoActualizado = (event: any) => {
      const { id, vehiculo } = event.detail;
      
      setVehiculos(prevVehiculos => {
        return prevVehiculos.map(v => v.id === id ? vehiculo : v);
      });
      
      setFilteredVehiculos(prevVehiculos => {
        return prevVehiculos.map(v => v.id === id ? vehiculo : v);
      });
    };
    
    // Agregar oyente para cuando los vehículos se actualicen en segundo plano
    window.addEventListener('vehiculo-actualizado', handleVehiculoActualizado);
    
    // Limpiar oyente cuando se desmonte el componente
    return () => {
      window.removeEventListener('vehiculo-actualizado', handleVehiculoActualizado);
    };
  }, []);

  // Cargar vehículos cuando cambia la página o se aplican filtros
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizar el estado si el componente se desmonta
    
    const cargarVehiculosFiltrados = async () => {
      setIsLoading(true);
      try {
        console.log(`Cargando vehículos: página ${currentPage}, filtros: Marca=${marcaFilter}, Modelo=${modeloFilter}`);
        
        // Usar el método de búsqueda del servicio si hay término de búsqueda
        let response;
        if (searchTerm) {
          response = await vehiculosOrigenService.buscar(searchTerm, currentPage, itemsPerPage);
        } else if (marcaFilter !== "todas") {
          response = await vehiculosOrigenService.filtrarPorMarca(marcaFilter, currentPage, itemsPerPage);
        } else if (modeloFilter !== "todos") {
          response = await vehiculosOrigenService.filtrarPorModelo(modeloFilter, currentPage, itemsPerPage);
        } else if (anioFilter !== "todos") {
          response = await vehiculosOrigenService.filtrarPorAnio(parseInt(anioFilter), currentPage, itemsPerPage);
        } else if (combustibleFilter !== "todos") {
          response = await vehiculosOrigenService.filtrarPorCombustible(combustibleFilter, currentPage, itemsPerPage);
        } else {
          // Si no hay filtros, usar el método getAll
          response = await vehiculosOrigenService.getAll(currentPage, itemsPerPage);
        }
        
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          // Actualizar los vehículos y la información de paginación
          setVehiculos(response.items);
          setFilteredVehiculos(response.items);
          setPaginationInfo(response.pagination);
          
          // Registrar información de depuración
          console.log(`Cargados ${response.items.length} vehículos (página ${response.pagination.page}/${response.pagination.totalPages})`);
          console.log(`Filtros aplicados: Búsqueda="${searchTerm}", Marca=${marcaFilter}, Modelo=${modeloFilter}, Año=${anioFilter}, Combustible=${combustibleFilter}`);
        }
      } catch (error) {
        console.error("Error al cargar los vehículos:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    cargarVehiculosFiltrados();
    
    // Limpieza para evitar actualizar el estado si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [currentPage, itemsPerPage, searchTerm, marcaFilter, modeloFilter, anioFilter, combustibleFilter]); // Recargar cuando cambie la página, el límite o cualquier filtro

  // Función para resetear a la página 1 cuando cambian los filtros
  const handleFilterChange = (filterType: string, value: string) => {
    // Resetear a página 1 cuando se cambia un filtro
    setCurrentPage(1);
    
    // Actualizar el filtro correspondiente
    switch (filterType) {
      case 'marca':
        setMarcaFilter(value);
        break;
      case 'modelo':
        setModeloFilter(value);
        break;
      case 'anio':
        setAnioFilter(value);
        break;
      case 'combustible':
        setCombustibleFilter(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
    }
  };

  // Actualizar modelos disponibles cuando cambia la marca
  useEffect(() => {
    const actualizarModelosDisponibles = async () => {
      try {
        // Usar el método específico del servicio para obtener modelos filtrados por marca
        const modelos = await vehiculosOrigenService.getModelosUnicos(
          marcaFilter !== "todas" ? marcaFilter : undefined
        );
        
        setModelosDisponibles(new Set(modelos));
        
        // Resetear filtro de modelo si la selección actual no está disponible
        if (modeloFilter !== "todos" && !modelos.includes(modeloFilter)) {
          setModeloFilter("todos");
        }
      } catch (error) {
        console.error("Error al actualizar modelos disponibles:", error);
      }
    };
    
    actualizarModelosDisponibles();
  }, [marcaFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vehículos de Origen</h1>
            <p className="text-muted-foreground">
              Explora nuestros vehículos y descubre todas las piezas disponibles de cada uno
            </p>
          </div>
        </div>
        
        {/* Barra de búsqueda y filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por marca, modelo, matrícula..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <Select value={marcaFilter} onValueChange={(value) => handleFilterChange('marca', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las marcas</SelectItem>
              {Array.from(marcasDisponibles).sort().map(marca => (
                <SelectItem key={marca} value={marca}>{marca}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={modeloFilter} onValueChange={(value) => handleFilterChange('modelo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los modelos</SelectItem>
              {Array.from(modelosDisponibles).sort().map(modelo => (
                <SelectItem key={modelo} value={modelo}>{modelo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={combustibleFilter} onValueChange={(value) => handleFilterChange('combustible', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Combustible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los combustibles</SelectItem>
              {Array.from(combustiblesDisponibles).sort().map(combustible => (
                <SelectItem key={combustible} value={combustible}>{combustible}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Lista de vehículos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredVehiculos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredVehiculos.map((vehiculo) => (
              <Link 
                to={`/catalogo/vehiculos/${vehiculo.id}`} 
                key={vehiculo.id} 
                className="block no-underline text-foreground"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                  <div className="h-48 bg-muted relative">
                    <ImageWithFallback
                      src={vehiculo.imagen_url || ''}
                      fallbackSrc="/assets/logo-kacum.svg"
                      alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                      className="w-full h-full object-cover"
                    />
                    {vehiculo.num_piezas && vehiculo.num_piezas > 0 && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                        {vehiculo.num_piezas} {vehiculo.num_piezas === 1 ? 'pieza' : 'piezas'}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 text-foreground dark:text-yellow-400">
                      {vehiculo.marca} {vehiculo.modelo}
                    </h3>
                    {vehiculo.version && (
                      <p className="text-sm text-muted-foreground dark:text-yellow-300/80 mb-2">{vehiculo.version}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {vehiculo.anio_fabricacion && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {vehiculo.anio_fabricacion}
                        </Badge>
                      )}
                      {vehiculo.tipo_combustible && (
                        <Badge variant="outline" className="text-xs">
                          <Fuel className="h-3 w-3 mr-1" />
                          {vehiculo.tipo_combustible}
                        </Badge>
                      )}
                      {vehiculo.kilometraje && (
                        <Badge variant="outline" className="text-xs">
                          <Gauge className="h-3 w-3 mr-1" />
                          {vehiculo.kilometraje.toLocaleString()} km
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-end items-center mt-4">
                      <Button variant="ghost" size="sm" className="group">
                        Ver detalles
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Paginación */}
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button 
                onClick={() => setCurrentPage(1)}
                className={`px-3 py-2 rounded-md border ${currentPage === 1 ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              >
                1
              </button>
              
              {currentPage > 3 && <span className="px-2">...</span>}
              
              {Array.from({ length: 3 }).map((_, i) => {
                let pageNum;
                
                if (currentPage <= 2) {
                  pageNum = 2 + i;
                } else if (currentPage >= paginationInfo.totalPages - 1) {
                  pageNum = paginationInfo.totalPages - 3 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                
                if (pageNum <= 1 || pageNum >= paginationInfo.totalPages) return null;
                
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-md border ${currentPage === pageNum ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {currentPage < paginationInfo.totalPages - 2 && <span className="px-2">...</span>}
              
              {paginationInfo.totalPages > 1 && (
                <button 
                  onClick={() => setCurrentPage(paginationInfo.totalPages)}
                  className={`px-3 py-2 rounded-md border ${currentPage === paginationInfo.totalPages ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                >
                  {paginationInfo.totalPages}
                </button>
              )}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))}
                disabled={currentPage === paginationInfo.totalPages}
                className={`px-3 py-2 rounded-md border ${currentPage === paginationInfo.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </> 
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium mb-2">No se encontraron vehículos</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
          </div>
        )}
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default VehiculosOrigenPage;
