import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PiezaTienda } from "../../../services/recambiosService";
import ImageWithFallback from "@/components/common/ImageWithFallback";

interface ProductCardProps {
  pieza: PiezaTienda;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ pieza, onAddToCart }) => {
  // Extraer datos del vehículo si están disponibles
  const vehiculoData = pieza.datos_adicionales && typeof pieza.datos_adicionales === 'object'
    ? pieza.datos_adicionales
    : {};
  
  const marca = vehiculoData.marca || "Sin especificar";
  const modelo = vehiculoData.modelo || "Sin especificar";
  const version = vehiculoData.version || "";
  const anio = vehiculoData.anio || vehiculoData.año || "Sin especificar";
  
  // Determinar imágenes de la pieza
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imagenes = pieza.fotos && pieza.fotos.length > 0 
    ? pieza.fotos.map(foto => foto.url) 
    : [pieza.imagen_url || '/assets/logo-kacum.svg'];
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-muted">
        <ImageWithFallback
          src={imagenes[currentImageIndex]}
          fallbackSrc="/assets/logo-kacum.svg"
          alt={pieza.nombre}
          className="w-full h-full object-cover"
        />
        
        {/* Controles de navegación de imágenes (solo si hay más de una) */}
        {imagenes.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {imagenes.map((_, index) => (
                <span 
                  key={index} 
                  className={`block h-1.5 rounded-full ${currentImageIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        
        {pieza.estado && (
          <Badge 
            className="absolute top-2 right-2" 
            variant={pieza.estado === "Nuevo" ? "default" : "secondary"}
          >
            {pieza.estado}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 flex-grow">
        <div className="mb-2">
          <p className="text-xs text-muted-foreground">
            {marca} {modelo} {version} {anio !== "Sin especificar" ? `(${anio})` : ""}
          </p>
        </div>
        
        <h3 className="font-medium text-lg line-clamp-2 mb-1 dark:text-yellow-400">{pieza.nombre}</h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {pieza.descripcion || "Sin descripción disponible"}
        </p>
        
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold text-primary">
            {pieza.precio.toFixed(2)}€
          </span>
          {pieza.stock > 0 ? (
            <Badge variant="outline" className="text-xs">
              {pieza.stock} disponibles
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Sin stock
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={onAddToCart}
          disabled={pieza.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Añadir
        </Button>
        
        <Link to={`/recambios/${pieza.id}`} className="flex-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <Info className="h-4 w-4 mr-2" />
            Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
