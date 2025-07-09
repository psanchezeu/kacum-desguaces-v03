import React from 'react';

interface CaracteristicasClaveProps {
  id: string | number;
  oem?: string;
  anio?: string;
  codigoMotor?: string;
  combustible?: string;
  observaciones?: string;
}

const CaracteristicasClave: React.FC<CaracteristicasClaveProps> = ({
  id,
  oem,
  anio,
  codigoMotor,
  combustible,
  observaciones
}) => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-lg mb-3">Características clave:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">ID:</span>
          <span className="font-medium">{id}</span>
        </div>
        {oem && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">OEM:</span>
            <span className="font-medium">{oem}</span>
          </div>
        )}
        {anio && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Año:</span>
            <span className="font-medium">{anio}</span>
          </div>
        )}
        {codigoMotor && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Código Motor:</span>
            <span className="font-medium">{codigoMotor}</span>
          </div>
        )}
        {combustible && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Combustible:</span>
            <span className="font-medium">{combustible}</span>
          </div>
        )}
      </div>
      {observaciones && (
        <div className="mt-3 border-t pt-2">
          <h4 className="font-medium mb-1 dark:text-yellow-400">Observaciones:</h4>
          <p className="text-sm">{observaciones}</p>
        </div>
      )}
    </div>
  );
};

export default CaracteristicasClave;
