import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
  alt: string;
}

/**
 * Componente para mostrar imágenes con manejo de errores y fallback
 * @param props Propiedades de la imagen incluyendo fallbackSrc para imagen de respaldo
 * @returns Componente de imagen con manejo de errores
 */
const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  ...props
}) => {
  const [error, setError] = useState(false);

  // Determinar la fuente final de la imagen
  const finalSrc = error ? fallbackSrc : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={() => {
        if (!error) {
          console.error(`Error cargando imagen: ${src}`);
          setError(true);
        }
      }}
      {...props}
    />
  );
};

export default ImageWithFallback;
