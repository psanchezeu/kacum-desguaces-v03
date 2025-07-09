import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
// @ts-ignore - Forzamos la importación para evitar problemas de resolución de módulos
import ProductCard from "./components/ProductCard";
import { recambiosService, PiezaTienda } from "../../services/recambiosService";

// Interfaz para la paginación
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const RecambiosPage: React.FC = () => {
  const [piezas, setPiezas] = useState<PiezaTienda[]>([]);
  const [filteredPiezas, setFilteredPiezas] = useState<PiezaTienda[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [selectedMarca, setSelectedMarca] = useState<string>("todas");
  const [selectedModelo, setSelectedModelo] = useState<string>("todas");
  const [selectedAnio, setSelectedAnio] = useState<string>("todas");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelos, setModelos] = useState<string[]>([]);
  const [anios, setAnios] = useState<string[]>([]);
  const [carrito, setCarrito] = useState<{id: number, cantidad: number}[]>([]);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(15); // 5 piezas por fila, 3 filas
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({page: 1, limit: 15, total: 0, totalPages: 0});
  
  const navigate = useNavigate();

  // Cargar datos iniciales y filtros disponibles
  useEffect(() => {
    const fetchPiezasIniciales = async () => {
      try {
        setIsLoading(true);
        // Cargar la primera página para obtener los filtros disponibles
        const response = await recambiosService.getRecambios(1, itemsPerPage);
        
        // Extraer marcas únicas para los filtros
        const marcasUnicas = new Set<string>();
        
        response.items.forEach((pieza) => {
          if (pieza.datos_adicionales && typeof pieza.datos_adicionales === 'object' && pieza.datos_adicionales.marca) {
            marcasUnicas.add(pieza.datos_adicionales.marca);
          }
        });
        
        setMarcas(Array.from(marcasUnicas).sort());
        
        // Los modelos, categorías y años se cargarán en cascada cuando se seleccione una marca
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPiezasIniciales();
  }, []); // Solo se ejecuta una vez al cargar la página
  
  // Cargar piezas cuando cambia la página o los filtros
  useEffect(() => {
    const fetchPiezasFiltradas = async () => {
      try {
        setIsLoading(true);
        console.log(`Cargando página ${currentPage} con ${itemsPerPage} elementos por página`);
        console.log(`Filtros: Marca=${selectedMarca}, Modelo=${selectedModelo}, Categoría=${selectedCategoria}, Año=${selectedAnio}, Búsqueda=${searchTerm}`);
        
        // Construir parámetros de filtrado para enviar al backend
        // En un escenario ideal, estos filtros se aplicarían en el backend
        const response = await recambiosService.getRecambios(currentPage, itemsPerPage);
        
        // Aplicar filtros en el frontend (esto debería hacerse en el backend idealmente)
        let filtered = response.items;
        
        // Filtrar por búsqueda
        if (searchTerm) {
          filtered = filtered.filter(pieza => 
            pieza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pieza.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pieza.datos_adicionales && JSON.stringify(pieza.datos_adicionales).toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        // Filtrar por marca
        if (selectedMarca !== "todas") {
          filtered = filtered.filter(pieza => 
            pieza.datos_adicionales && 
            typeof pieza.datos_adicionales === 'object' && 
            pieza.datos_adicionales.marca === selectedMarca
          );
        }
        
        // Filtrar por modelo
        if (selectedModelo !== "todas") {
          filtered = filtered.filter(pieza => 
            pieza.datos_adicionales && 
            typeof pieza.datos_adicionales === 'object' && 
            pieza.datos_adicionales.modelo === selectedModelo
          );
        }
        
        // Filtrar por categoría
        if (selectedCategoria !== "todas") {
          filtered = filtered.filter(pieza => 
            pieza.categoria === selectedCategoria
          );
        }
        
        // Filtrar por año
        if (selectedAnio !== "todas") {
          filtered = filtered.filter(pieza => {
            if (!pieza.datos_adicionales || typeof pieza.datos_adicionales !== 'object') return false;
            
            const anio = pieza.datos_adicionales.anio || 
                       pieza.datos_adicionales.año || 
                       pieza.datos_adicionales.anio_fabricacion || 
                       pieza.datos_adicionales.año_fabricacion;
            
            return anio === selectedAnio;
          });
        }
        
        // Filtrar por rango de precios
        filtered = filtered.filter(pieza => 
          pieza.precio >= priceRange[0] && pieza.precio <= priceRange[1]
        );
        
        // Guardar todas las piezas y las piezas filtradas
        setPiezas(response.items);
        setFilteredPiezas(filtered);
        
        // Actualizar la información de paginación
        // Usamos la paginación del backend para el total de items
        // pero ajustamos para mostrar correctamente cuando hay filtros aplicados
        const totalItems = response.pagination.total;
        const totalPages = response.pagination.totalPages;
        
        setPaginationInfo({
          page: currentPage,
          limit: itemsPerPage,
          total: totalItems,
          totalPages: totalPages
        });
        
        console.log(`Datos de paginación: Página ${currentPage}/${totalPages}, Total: ${totalItems} items`);
        console.log(`Resultados filtrados: ${filtered.length} piezas`);
      } catch (error) {
        console.error("Error al cargar piezas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPiezasFiltradas();
  }, [currentPage, itemsPerPage, searchTerm, selectedMarca, selectedModelo, selectedCategoria, selectedAnio, priceRange]);

  // Función para resetear a la página 1 cuando cambian los filtros
  const handleFilterChange = (filterType: string, value: string | number) => {
    // Resetear a página 1 cuando se cambia un filtro
    setCurrentPage(1);
    
    // Actualizar el filtro correspondiente
    switch (filterType) {
      case 'marca':
        setSelectedMarca(value as string);
        break;
      case 'modelo':
        setSelectedModelo(value as string);
        break;
      case 'anio':
        setSelectedAnio(value as string);
        break;
      case 'categoria':
        setSelectedCategoria(value as string);
        break;
      case 'search':
        setSearchTerm(value as string);
        break;
      case 'priceRange':
        // Asegurarse de que el valor es un array de dos números
        if (Array.isArray(value) && value.length === 2) {
          setPriceRange([value[0] as number, value[1] as number]);
        }
        break;
    }
  };
  
  // Actualizar modelos disponibles cuando cambia la marca
  useEffect(() => {
    if (selectedMarca === "todas") {
      setModelos([]);
      return;
    }
    
    const modelosDeEstaMarca = new Set<string>();
    
    piezas.forEach((pieza) => {
      if (pieza.datos_adicionales && 
          typeof pieza.datos_adicionales === 'object' && 
          pieza.datos_adicionales.marca === selectedMarca &&
          pieza.datos_adicionales.modelo) {
        modelosDeEstaMarca.add(pieza.datos_adicionales.modelo);
      }
    });
    
    setModelos(Array.from(modelosDeEstaMarca).sort());
  }, [selectedMarca, piezas]);
  
  // Actualizar las opciones de filtro disponibles basadas en las selecciones actuales
  useEffect(() => {
    // Obtener modelos disponibles basados en la marca seleccionada
    const modelosDisponibles = new Set<string>();
    const categoriasDisponibles = new Set<string>();
    const aniosDisponibles = new Set<string>();
    
    // Filtrar primero por marca
    const piezasFiltradas = piezas.filter(pieza => {
      if (selectedMarca === "todas") return true;
      
      return pieza.datos_adicionales && 
        typeof pieza.datos_adicionales === 'object' && 
        pieza.datos_adicionales.marca === selectedMarca;
    });
    
    // Luego filtrar por modelo si está seleccionado
    const piezasFiltradasPorModelo = piezasFiltradas.filter(pieza => {
      if (selectedModelo === "todas") return true;
      
      return pieza.datos_adicionales && 
        typeof pieza.datos_adicionales === 'object' && 
        pieza.datos_adicionales.modelo === selectedModelo;
    });
    
    // Luego filtrar por categoría si está seleccionada
    const piezasFiltradasPorCategoria = piezasFiltradasPorModelo.filter(pieza => {
      if (selectedCategoria === "todas") return true;
      return pieza.categoria === selectedCategoria;
    });
    
    // Extraer modelos disponibles
    piezasFiltradas.forEach(pieza => {
      if (pieza.datos_adicionales && typeof pieza.datos_adicionales === 'object' && pieza.datos_adicionales.modelo) {
        modelosDisponibles.add(pieza.datos_adicionales.modelo);
      }
    });
    
    // Extraer categorías disponibles
    piezasFiltradasPorModelo.forEach(pieza => {
      if (pieza.categoria) {
        categoriasDisponibles.add(pieza.categoria);
      }
    });
    
    // Extraer años disponibles
    piezasFiltradasPorCategoria.forEach(pieza => {
      if (pieza.datos_adicionales && typeof pieza.datos_adicionales === 'object') {
        const anio = pieza.datos_adicionales.anio || 
                   pieza.datos_adicionales.año || 
                   pieza.datos_adicionales.anio_fabricacion || 
                   pieza.datos_adicionales.año_fabricacion;
        
        if (anio && typeof anio === 'string') {
          aniosDisponibles.add(anio);
        }
      }
    });
    
    // Actualizar las opciones disponibles
    setModelos(Array.from(modelosDisponibles).sort());
    setCategorias(Array.from(categoriasDisponibles).sort());
    setAnios(Array.from(aniosDisponibles).sort((a, b) => parseInt(b) - parseInt(a)));
    
    // Resetear filtros dependientes si la selección actual ya no es válida
    if (selectedMarca !== "todas" && selectedModelo !== "todas" && !modelosDisponibles.has(selectedModelo)) {
      setSelectedModelo("todas");
    }
    
    if ((selectedMarca !== "todas" || selectedModelo !== "todas") && 
        selectedCategoria !== "todas" && !categoriasDisponibles.has(selectedCategoria)) {
      setSelectedCategoria("todas");
    }
    
    if ((selectedMarca !== "todas" || selectedModelo !== "todas" || selectedCategoria !== "todas") && 
        selectedAnio !== "todas" && !aniosDisponibles.has(selectedAnio)) {
      setSelectedAnio("todas");
    }
  }, [selectedMarca, selectedModelo, selectedCategoria, piezas]);

  // Añadir al carrito
  const handleAddToCart = (piezaId: number) => {
    setCarrito(prev => {
      const existingItem = prev.find(item => item.id === piezaId);
      if (existingItem) {
        return prev.map(item => 
          item.id === piezaId 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        );
      } else {
        return [...prev, { id: piezaId, cantidad: 1 }];
      }
    });
  };

  // Ir al carrito
  const handleGoToCart = () => {
    // Aquí iría la navegación al carrito cuando se implemente
    console.log("Ir al carrito", carrito);
    // navigate("/carrito");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Recambios</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleGoToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Carrito</span>
            {carrito.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {carrito.reduce((total, item) => total + item.cantidad, 0)}
              </Badge>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filtros */}
          <Card className="md:col-span-1 h-fit">
            <CardContent className="p-4 space-y-6">
              <div>
                <h3 className="font-medium mb-2">Buscar</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar recambios..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Marca</h3>
                <Select value={selectedMarca} onValueChange={(value) => handleFilterChange('marca', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las marcas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las marcas</SelectItem>
                    {marcas.map((marca) => (
                      <SelectItem key={marca} value={marca}>
                        {marca}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Modelo</h3>
                <Select value={selectedModelo} onValueChange={(value) => handleFilterChange('modelo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los modelos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos los modelos</SelectItem>
                    {modelos.map((modelo) => (
                      <SelectItem key={modelo} value={modelo}>
                        {modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Categoría</h3>
                <Select value={selectedCategoria} onValueChange={(value) => handleFilterChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Año</h3>
                <Select value={selectedAnio} onValueChange={(value) => handleFilterChange('anio', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los años" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos los años</SelectItem>
                    {anios.map((anio) => (
                      <SelectItem key={anio} value={anio}>
                        {anio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Reiniciar todos los filtros y volver a la página 1
                  handleFilterChange('search', "");
                  handleFilterChange('marca', "todas");
                  handleFilterChange('modelo', "todas");
                  handleFilterChange('categoria', "todas");
                  handleFilterChange('anio', "todas");
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
          
          {/* Productos */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredPiezas.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPiezas.map((pieza) => {
                    // Crear una función de cierre que capture el ID de la pieza
                    const addThisToCart = () => handleAddToCart(pieza.id);
                    
                    return (
                      <ProductCard
                        key={pieza.id}
                        pieza={pieza}
                        onAddToCart={addThisToCart}
                      />
                    );
                  })}
                </div>
                
                {/* Paginación */}
                <div className="mt-8 flex justify-center">
                  {paginationInfo.totalPages > 0 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => setCurrentPage(1)}
                            isActive={currentPage === 1}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: Math.min(3, paginationInfo.totalPages - 2) }).map((_, i) => {
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
                            <PaginationItem key={pageNum}>
                              <PaginationLink 
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {currentPage < paginationInfo.totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        {paginationInfo.totalPages > 1 && (
                          <PaginationItem>
                            <PaginationLink 
                              onClick={() => setCurrentPage(paginationInfo.totalPages)}
                              isActive={currentPage === paginationInfo.totalPages}
                            >
                              {paginationInfo.totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))}
                            className={currentPage === paginationInfo.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No se encontraron recambios</h3>
                <p className="text-muted-foreground">Prueba a cambiar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default RecambiosPage;
