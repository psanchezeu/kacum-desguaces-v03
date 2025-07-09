import React from 'react';
import { Vehiculo } from '@/types';

interface VehiculoImagenProps {
  vehiculo: Vehiculo | null;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Componente para mostrar la imagen de un vehículo con fallback
 */
const VehiculoImagen: React.FC<VehiculoImagenProps> = ({ 
  vehiculo, 
  className = "w-full h-full object-cover",
  fallbackClassName = "h-20 w-auto opacity-30" 
}) => {
  // Nombre completo del vehículo para el alt
  const vehiculoNombre = vehiculo 
    ? [vehiculo.marca, vehiculo.modelo, vehiculo.version].filter(Boolean).join(' ')
    : 'Vehículo';

  return (
    <>
      {vehiculo?.imagen_url ? (
        <img
          src={vehiculo.imagen_url}
          alt={vehiculoNombre}
          className={className}
        />
      ) : (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src="/assets/logo-kacum.svg"
            alt="Logo Kacum Desguaces"
            className={fallbackClassName}
          />
        </div>
      )}
    </>
  );
};

export default VehiculoImagen;
