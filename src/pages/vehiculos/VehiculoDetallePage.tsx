import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Car, Fuel, Gauge, User, Info, ShoppingCart, FileText, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { vehiculosOrigenService, VehiculoConImagenes } from "@/services/vehiculosOrigenService";
import { recambiosService } from "@/services/recambiosService";
import { Foto } from "@/services/fotosService";
import { PiezaTienda } from "@/services/recambiosService";
import ProductCard from "../recambios/components/ProductCard";
import ImageWithFallback from "@/components/common/ImageWithFallback";

const VehiculoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehiculo, setVehiculo] = useState<VehiculoConImagenes | null>(null);
  const [piezas, setPiezas] = useState<PiezaTienda[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Obtener datos del vehículo usando el servicio especializado
        const vehiculoData = await vehiculosOrigenService.getById(parseInt(id));
        if (!vehiculoData) {
          throw new Error('No se encontró el vehículo');
        }
        setVehiculo(vehiculoData);
        
        // Obtener piezas asociadas al vehículo
        const piezasData = await recambiosService.getByVehiculoId(parseInt(id));
        console.log('Piezas obtenidas del vehículo:', piezasData);
        
        // Verificar si las piezas tienen los datos necesarios
        if (piezasData && piezasData.length > 0) {
          console.log('Primera pieza - nombre:', piezasData[0].nombre);
          console.log('Primera pieza - referencia:', piezasData[0].datos_adicionales?.referencia || piezasData[0].datos_adicionales?.codigo);
          console.log('Primera pieza - precio:', piezasData[0].precio);
          console.log('Primera pieza - datos_adicionales:', piezasData[0].datos_adicionales);
        }
        
        setPiezas(piezasData);
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomeHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error || !vehiculo) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomeHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">
              {error || "No se pudo encontrar el vehículo solicitado."}
            </p>
            <Link to="/catalogo/vehiculos">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a vehículos
              </Button>
            </Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const vehiculoNombre = [
    vehiculo.marca,
    vehiculo.modelo,
    vehiculo.version
  ].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/catalogo/vehiculos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a vehículos
          </Link>
          
          <h1 className="text-3xl font-bold">{vehiculoNombre}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Carrusel de imágenes del vehículo */}
          <div className="bg-muted rounded-lg overflow-hidden h-[400px] relative">
            {vehiculo.imagenes && vehiculo.imagenes.length > 0 ? (
              <>
                <div className="relative w-full h-full">
                  <ImageWithFallback
                    src={vehiculo.imagenes[currentImageIndex].url}
                    fallbackSrc="/assets/logo-kacum.svg"
                    alt={`${vehiculoNombre} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Controles del carrusel */}
                  {vehiculo.imagenes.length > 1 && (
                    <>
                      {/* Botón anterior */}
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? vehiculo.imagenes!.length - 1 : prev - 1)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      
                      {/* Botón siguiente */}
                      <button 
                        onClick={() => setCurrentImageIndex(prev => (prev + 1) % vehiculo.imagenes!.length)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      
                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {vehiculo.imagenes.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageWithFallback
                  src={vehiculo.imagen_url || ''}
                  fallbackSrc="/assets/logo-kacum.svg"
                  alt={vehiculoNombre}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Información del vehículo */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información del vehículo</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Car className="h-5 w-5 mr-3 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Vehículo</h4>
                        <p className="dark:text-yellow-300">{vehiculoNombre}</p>
                      </div>
                    </div>
                    
                    {vehiculo.anio_fabricacion && (
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Año</h4>
                          <p className="dark:text-yellow-300">{vehiculo.anio_fabricacion}</p>
                        </div>
                      </div>
                    )}
                    
                    {vehiculo.tipo_combustible && (
                      <div className="flex items-start">
                        <Fuel className="h-5 w-5 mr-3 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Combustible</h4>
                          <p className="dark:text-yellow-300">{vehiculo.tipo_combustible || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {vehiculo.kilometraje && (
                      <div className="flex items-start">
                        <Gauge className="h-5 w-5 mr-3 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Kilometraje</h4>
                          <p className="dark:text-yellow-300">{vehiculo.kilometros?.toLocaleString() || 'N/A'} km</p>
                        </div>
                      </div>
                    )}
                    
                    {vehiculo.color && (
                      <div className="flex items-start">
                        <Tag className="h-5 w-5 mr-3 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Color</h4>
                          <p className="dark:text-yellow-300">{vehiculo.estado || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                    
                    {(vehiculo.bastidor || vehiculo.matricula) && (
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 mr-3 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Identificación</h4>
                          <p className="dark:text-yellow-300 font-mono">{vehiculo.bastidor || 'N/A'}</p>
                          <p className="dark:text-yellow-300">{vehiculo.matricula || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {vehiculo.observaciones && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-2">Observaciones</h4>
                    <p className="text-sm text-muted-foreground">{vehiculo.observaciones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Piezas disponibles</h3>
                <Badge variant="outline" className="text-sm">
                  {piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs con información adicional */}
        <div className="mb-8">
          <Tabs defaultValue="piezas">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="piezas">Piezas disponibles</TabsTrigger>
              <TabsTrigger value="detalles">Detalles técnicos</TabsTrigger>
            </TabsList>
            <TabsContent value="piezas" className="p-4 border rounded-md mt-2">
              {piezas.length > 0 ? (
                <div className="w-full overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted border-b border-t">
                        <th className="p-2 text-left w-10"></th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Referencia</th>
                        <th className="p-2 text-left">Bastidor</th>
                        <th className="p-2 text-right">Precio</th>
                        <th className="p-2 text-center">Cantidad</th>
                        <th className="p-2 text-center">Estado</th>
                        <th className="p-2 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {piezas.map(pieza => {
                        // Garantizar que siempre tengamos valores para mostrar
                        const nombrePieza = pieza.nombre || pieza.descripcion || `Pieza ${pieza.id}`;
                        const referenciaPieza = 
                          (pieza.datos_adicionales && typeof pieza.datos_adicionales === 'object' && 
                           (pieza.datos_adicionales.referencia || pieza.datos_adicionales.codigo)) ||
                          `REF-${pieza.id}`;
                        const precioPieza = 
                          (typeof pieza.precio === 'number' && pieza.precio > 0) ? 
                          `${pieza.precio.toFixed(2)} €` : "Consultar";
                        
                        return (
                          <tr key={pieza.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div className="w-8 h-8 bg-muted rounded-sm overflow-hidden">
                                {pieza.imagen_url ? (
                                  <img 
                                    src={pieza.imagen_url} 
                                    alt={nombrePieza} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/assets/logo-kacum.svg';
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <img
                                      src="/assets/logo-kacum.svg"
                                      alt="Logo Kacum"
                                      className="w-5 h-5 opacity-30"
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <Link 
                                to={`/recambios/${pieza.id}`} 
                                className="font-medium hover:text-primary dark:text-yellow-300 dark:hover:text-yellow-400"
                              >
                                {nombrePieza}
                              </Link>
                            </td>
                            <td className="p-2 text-muted-foreground">
                              {referenciaPieza}
                            </td>
                            <td className="p-2 text-muted-foreground">
                              {vehiculo?.vin || vehiculo?.bastidor || "N/A"}
                            </td>
                            <td className="p-2 text-right font-medium dark:text-yellow-300">
                              {precioPieza}
                            </td>
                            <td className="p-2 text-center">
                              <span className="font-medium">1</span>
                            </td>
                            <td className="p-2 text-center">
                              <Badge 
                                variant={pieza.estado === "Nuevo" ? "default" : "outline"}
                                className="text-xs px-2 py-0"
                              >
                                {pieza.estado || "Usado"}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex justify-center gap-1">
                                <Link to={`/recambios/${pieza.id}`}>
                                  <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                                    <Info className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700"
                                  onClick={() => console.log(`Añadir pieza ${pieza.id} al carrito`)}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No hay piezas disponibles</h3>
                  <p className="text-muted-foreground">
                    Actualmente no hay piezas disponibles para este vehículo
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="detalles" className="p-4 border rounded-md mt-2">
              <div className="prose max-w-none">
                <h3>Especificaciones técnicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-4">
                  {vehiculo.motor && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Motor:</h4>
                      <p>{vehiculo.motor}</p>
                    </div>
                  )}
                  {vehiculo.cilindrada && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Cilindrada:</h4>
                      <p>{vehiculo.cilindrada} cc</p>
                    </div>
                  )}
                  {vehiculo.potencia && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Potencia:</h4>
                      <p>{vehiculo.potencia} CV</p>
                    </div>
                  )}
                  {vehiculo.transmision && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">Transmisión:</h4>
                      <p>{vehiculo.transmision}</p>
                    </div>
                  )}
                </div>
                
                {vehiculo.datos_adicionales && typeof vehiculo.datos_adicionales === 'object' && (
                  <div className="mt-6">
                    <h3>Información adicional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-4">
                      {Object.entries(vehiculo.datos_adicionales)
                        .filter(([key, value]) => 
                          value && 
                          (typeof value === 'string' || typeof value === 'number') && 
                          !['id', 'marca', 'modelo', 'version', 'anio', 'año', 'combustible', 'color', 'bastidor', 'matricula', 'vin', 'kilometros', 'kilometraje'].includes(key.toLowerCase())
                        )
                        .map(([key, value]) => (
                          <div key={key} className="p-3 border rounded">
                            <h4 className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</h4>
                            <p>{value}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default VehiculoDetallePage;
