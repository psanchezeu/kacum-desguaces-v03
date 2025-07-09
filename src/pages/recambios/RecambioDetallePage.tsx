import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, ArrowLeft, Check, AlertTriangle, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { recambiosService, PiezaTienda } from "../../services/recambiosService";
import CaracteristicasClave from "./components/CaracteristicasClave";
import VehiculoOrigenTab from "./components/VehiculoOrigenTab";
import GarantiasEnviosTab from "./components/GarantiasEnviosTab";
import ImageWithFallback from "@/components/common/ImageWithFallback";

// Definir un tipo para los datos del vehículo
interface VehiculoData {
  id?: number;
  id_vehiculo?: number;
  marca?: string;
  modelo?: string;
  version?: string;
  anio?: string;
  año?: string;
  combustible?: string;
  kilometraje?: string | number;
  color?: string;
  bastidor?: string;
  matricula?: string;
  oem?: string;
  referencia?: string;
  codigo_motor?: string;
  codigoMotor?: string;
  common_rail?: string;
  inyeccion?: string;
  turbo?: string;
  [key: string]: any;
}

const RecambioDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pieza, setPieza] = useState<PiezaTienda | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cantidad, setCantidad] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);

  useEffect(() => {
    const fetchPieza = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const piezaData = await recambiosService.getRecambioById(parseInt(id));
        setPieza(piezaData);
      } catch (error) {
        console.error("Error al cargar la pieza:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPieza();
  }, [id]);

  // Extraer datos del vehículo si están disponibles
  let vehiculoData: VehiculoData = {};
  
  if (pieza?.datos_adicionales) {
    // Si datos_adicionales es un string, intentar parsearlo
    if (typeof pieza.datos_adicionales === 'string') {
      try {
        vehiculoData = JSON.parse(pieza.datos_adicionales) as VehiculoData;
      } catch (e) {
        console.warn('Error al parsear datos_adicionales:', e);
      }
    } else if (typeof pieza.datos_adicionales === 'object') {
      // Si ya es un objeto, usarlo directamente
      vehiculoData = pieza.datos_adicionales as VehiculoData;
    }
  }
  
  // Asegurarse de que el ID del vehículo esté disponible si existe
  if (pieza?.id_vehiculo && !vehiculoData.id) {
    vehiculoData = {
      ...vehiculoData,
      id: pieza.id_vehiculo
    };
  }
  
  const handleAddToCart = () => {
    // Aquí iría la lógica para añadir al carrito
    console.log(`Añadiendo ${cantidad} unidad(es) de la pieza ${pieza?.id} al carrito`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <HomeHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (!pieza) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <HomeHeader />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col justify-center items-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Recambio no encontrado</h1>
          <p className="text-muted-foreground mb-6">No se ha podido encontrar el recambio solicitado</p>
          <Link to="/recambios">
            <Button>Ver todos los recambios</Button>
          </Link>
        </main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/recambios" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a recambios
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="bg-muted rounded-lg overflow-hidden h-[400px] flex items-center justify-center relative">
              {pieza.fotos && pieza.fotos.length > 0 ? (
                <>
                  <ImageWithFallback
                    src={pieza.fotos[currentImageIndex].url}
                    fallbackSrc="/assets/logo-kacum.svg"
                    alt={`${pieza.nombre} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowLightbox(true)}
                  />
                  
                  {/* Controles de navegación */}
                  {pieza.fotos.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? pieza.fotos!.length - 1 : prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev === pieza.fotos!.length - 1 ? 0 : prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => setShowLightbox(true)}
                        className="absolute top-2 right-2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                        aria-label="Ver a pantalla completa"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                        {pieza.fotos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 rounded-full transition-all ${currentImageIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                            aria-label={`Ver imagen ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : pieza.imagen_url ? (
                <ImageWithFallback
                  src={pieza.imagen_url}
                  fallbackSrc="/assets/logo-kacum.svg"
                  alt={pieza.nombre}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <img
                    src="/assets/logo-kacum.svg"
                    alt="Logo Kacum Desguaces"
                    className="w-32 h-32 mx-auto mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">Imagen no disponible</p>
                </div>
              )}
            </div>
            
            {/* Miniaturas (solo si hay más de 5 fotos) */}
            {pieza.fotos && pieza.fotos.length > 5 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {pieza.fotos.slice(0, 5).map((foto, index) => (
                  <div 
                    key={foto.id} 
                    className={`h-16 rounded overflow-hidden cursor-pointer border-2 ${currentImageIndex === index ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <ImageWithFallback
                      src={foto.url}
                      fallbackSrc="/assets/logo-kacum.svg"
                      alt={`${pieza.nombre} - Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {pieza.fotos.length > 5 && (
                  <div 
                    className="h-16 rounded overflow-hidden cursor-pointer bg-muted flex items-center justify-center"
                    onClick={() => setShowLightbox(true)}
                  >
                    <span className="text-sm font-medium">+{pieza.fotos.length - 5} más</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Modal de lightbox para ver todas las imágenes */}
            {showLightbox && pieza.fotos && (
              <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                <div className="flex justify-between items-center p-4 text-white">
                  <h3 className="text-lg font-medium">{pieza.nombre} - Imagen {currentImageIndex + 1} de {pieza.fotos.length}</h3>
                  <button 
                    onClick={() => setShowLightbox(false)}
                    className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    aria-label="Cerrar galería"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex-grow flex items-center justify-center relative">
                  <ImageWithFallback
                    src={pieza.fotos[currentImageIndex].url}
                    fallbackSrc="/assets/logo-kacum.svg"
                    alt={`${pieza.nombre} - Imagen ${currentImageIndex + 1}`}
                    className="max-h-[80vh] max-w-[90vw] object-contain"
                  />
                  
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? pieza.fotos!.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-3 hover:bg-black/50 transition-colors"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === pieza.fotos!.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-3 hover:bg-black/50 transition-colors"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <div className="flex gap-2 pb-2">
                    {pieza.fotos.map((foto, index) => (
                      <div 
                        key={foto.id} 
                        className={`h-16 w-24 flex-shrink-0 rounded overflow-hidden cursor-pointer border-2 ${currentImageIndex === index ? 'border-white' : 'border-transparent'}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <ImageWithFallback
                          src={foto.url}
                          fallbackSrc="/assets/logo-kacum.svg"
                          alt={`${pieza.nombre} - Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Información */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold dark:text-yellow-400">{pieza.nombre}</h1>
                {pieza.estado && (
                  <Badge variant={pieza.estado === "Nuevo" ? "default" : "secondary"}>
                    {pieza.estado}
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4">
                {pieza.descripcion || "Sin descripción disponible"}
              </p>
            </div>
            
            {/* Características clave */}
            <CaracteristicasClave 
              id={pieza.id}
              oem={vehiculoData.oem || vehiculoData.referencia}
              anio={vehiculoData.anio || vehiculoData.año}
              codigoMotor={vehiculoData.codigo_motor || vehiculoData.codigoMotor}
              combustible={vehiculoData.combustible}
              observaciones={pieza.notas}
            />
            
            <Separator />
            
            {/* Disponibilidad y compra */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {pieza.stock > 0 ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      <span>En stock ({pieza.stock} disponibles)</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-destructive">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>Sin stock</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-primary dark:text-yellow-400">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pieza.precio)}
                    </span>
                  </div>
                  {pieza.precio_original > pieza.precio && (
                    <span className="text-sm text-muted-foreground line-through">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pieza.precio_original)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                    disabled={pieza.stock <= 0}
                  >
                    -
                  </Button>
                  <div className="flex items-center justify-center h-10 w-10 text-center">
                    {cantidad}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => setCantidad(prev => Math.min(pieza.stock, prev + 1))}
                    disabled={pieza.stock <= 0}
                  >
                    +
                  </Button>
                </div>
                
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={pieza.stock <= 0}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Añadido
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Añadir al carrito
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs con información adicional */}
        <div className="mt-12">
          <Tabs defaultValue="detalles">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
              <TabsTrigger value="vehiculo">Vehículo de origen</TabsTrigger>
              <TabsTrigger value="especificaciones">Especificaciones</TabsTrigger>
              <TabsTrigger value="garantias">Garantías y envíos</TabsTrigger>
            </TabsList>
            <TabsContent value="detalles" className="p-9 border rounded-md mt-2">
              <div className="prose max-w-none">
                <h5>Descripción detallada</h5>
                <p>{pieza.descripcion || "No hay información detallada disponible para este recambio."}</p>
                
                {pieza.notas && (
                  <>
                    <h5>Notas adicionales</h5>
                    <p>{pieza.notas}</p>
                  </>
                )}
                
                {pieza.compatibilidad && (
                  <>
                    <h5>Compatibilidad</h5>
                    <div dangerouslySetInnerHTML={{ __html: pieza.compatibilidad }} />
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="vehiculo" className="p-4 border rounded-md mt-2">
              <VehiculoOrigenTab vehiculoData={vehiculoData} />
            </TabsContent>
            <TabsContent value="especificaciones" className="p-4 border rounded-md mt-2">
              <div className="prose max-w-none">
                <h5>Especificaciones técnicas</h5>
                {pieza.especificaciones ? (
                  <div dangerouslySetInnerHTML={{ __html: pieza.especificaciones }} />
                ) : (
                  <p>No hay especificaciones técnicas disponibles para este recambio.</p>
                )}
                
                {/* Información técnica adicional */}
                <h3 className="mt-6">Información técnica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-4">
                  {vehiculoData.common_rail && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">COMMON RAIL:</h4>
                      <p>{vehiculoData.common_rail}</p>
                    </div>
                  )}
                  {vehiculoData.inyeccion && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">INYECCIÓN:</h4>
                      <p>{vehiculoData.inyeccion}</p>
                    </div>
                  )}
                  {vehiculoData.turbo && (
                    <div className="p-3 border rounded">
                      <h4 className="font-medium">TURBO:</h4>
                      <p>{vehiculoData.turbo}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="garantias" className="p-4 border rounded-md mt-2">
              <GarantiasEnviosTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default RecambioDetallePage;
