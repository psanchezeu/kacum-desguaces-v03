import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Car, Calendar, Fuel, Gauge, Palette, FileText } from "lucide-react";

interface VehiculoData {
  id?: number;
  id_vehiculo?: number; // Algunas veces puede venir con este nombre
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
  [key: string]: any;
}

interface VehiculoOrigenTabProps {
  vehiculoData: VehiculoData;
}

const VehiculoOrigenTab: React.FC<VehiculoOrigenTabProps> = ({ vehiculoData }) => {
  const anio = vehiculoData.anio || vehiculoData.año;
  const nombreCompleto = [
    vehiculoData.marca,
    vehiculoData.modelo,
    vehiculoData.version
  ].filter(Boolean).join(' ');
  
  // Obtener el ID del vehículo si está disponible
  const vehiculoId = vehiculoData.id || vehiculoData.id_vehiculo;

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h3>Vehículo de origen</h3>
        <p>Esta pieza proviene del siguiente vehículo:</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Car className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Vehículo</h4>
                  {vehiculoId ? (
                    <p>
                      <Link 
                        to={`/catalogo/vehiculos/${vehiculoId}`} 
                        className="text-primary hover:underline"
                      >
                        {nombreCompleto || "Ver detalles del vehículo"}
                      </Link>
                    </p>
                  ) : (
                    <p>{nombreCompleto || "No especificado"}</p>
                  )}
                </div>
              </div>
              
              {anio && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Año</h4>
                    <p>{anio}</p>
                  </div>
                </div>
              )}
              
              {vehiculoData.combustible && (
                <div className="flex items-start">
                  <Fuel className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Combustible</h4>
                    <p>{vehiculoData.combustible}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {vehiculoData.kilometraje && (
                <div className="flex items-start">
                  <Gauge className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Kilometraje</h4>
                    <p>{vehiculoData.kilometraje} km</p>
                  </div>
                </div>
              )}
              
              {vehiculoData.color && (
                <div className="flex items-start">
                  <Palette className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Color</h4>
                    <p>{vehiculoData.color}</p>
                  </div>
                </div>
              )}
              
              {(vehiculoData.bastidor || vehiculoData.matricula) && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Identificación</h4>
                    {vehiculoData.bastidor && <p>Bastidor: {vehiculoData.bastidor}</p>}
                    {vehiculoData.matricula && <p>Matrícula: {vehiculoData.matricula}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiculoOrigenTab;
