import { useState, useEffect } from "react";

/**
 * Hook personalizado para detectar cambios en media queries
 * @param query - Media query a evaluar (ej: "(max-width: 768px)")
 * @returns boolean que indica si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Establecer el valor inicial
    setMatches(media.matches);
    
    // Definir el callback para actualizar el estado
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Añadir el listener
    media.addEventListener("change", listener);
    
    // Limpiar el listener al desmontar
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
