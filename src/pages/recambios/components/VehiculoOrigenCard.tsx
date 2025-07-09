import React from "react";
import { Link } from "react-router-dom";
import VehiculoImagen from "./VehiculoImagen";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Fuel, Gauge, ArrowRight } from "lucide-react";
import { Vehiculo } from "@/types";

interface VehiculoOrigenCardProps {
  vehiculo: Vehiculo;
}

/**
 * Tarjeta para mostrar un vehículo de origen en listados
 */
const VehiculoOrigenCard: React.FC<VehiculoOrigenCardProps> = ({ vehiculo }) => {
  return (
    <Link 
      to={`/catalogo/vehiculos/${vehiculo.id}`} 
      className="block no-underline text-foreground"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="h-48 bg-muted relative">
          <VehiculoImagen vehiculo={vehiculo} />
          
          {vehiculo.num_piezas && vehiculo.num_piezas > 0 && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              {vehiculo.num_piezas} {vehiculo.num_piezas === 1 ? 'pieza' : 'piezas'}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">
            {vehiculo.marca} {vehiculo.modelo}
          </h3>
          {vehiculo.version && (
            <p className="text-sm text-muted-foreground mb-2">{vehiculo.version}</p>
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
  );
};

export default VehiculoOrigenCard;
