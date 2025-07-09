import React, { useState, useEffect, useRef } from "react";
import { vehiculoFotosService, VehiculoFoto } from "@/services/vehiculoFotosService";
import { piezasService } from "@/services/piezasService";
import { fotosService, Foto } from "@/services/fotosService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Camera, Upload, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehiculoFotosTabProps {
  vehiculoId: string;
}

const VehiculoFotosTab: React.FC<VehiculoFotosTabProps> = ({ vehiculoId }) => {
  const { toast } = useToast();
  const [fotos, setFotos] = useState<VehiculoFoto[]>([]);
  const [fotosPiezas, setFotosPiezas] = useState<Foto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFotos = async () => {
    if (!vehiculoId) return;
    
    setIsLoading(true);
    try {
      // Obtener fotos del vehículo
      const data = await vehiculoFotosService.getByVehiculoId(Number(vehiculoId));
      setFotos(data);

      // Obtener piezas asociadas al vehículo
      const piezasResponse = await piezasService.getAll(Number(vehiculoId));
      const piezasData = piezasResponse.data;
      
      // Si hay piezas, obtener las fotos de la primera pieza
      if (piezasData && piezasData.length > 0) {
        const primeraPieza = piezasData[0];
        
        try {
          const fotosPieza = await fotosService.getByPiezaId(primeraPieza.id);
          // Ordenar fotos por fecha más reciente y obtener las últimas 3
          if (fotosPieza && fotosPieza.length > 0) {
            const ultimasFotos = fotosPieza.sort((a, b) => {
              const fechaA = new Date(a.fecha_subida).getTime();
              const fechaB = new Date(b.fecha_subida).getTime();
              return fechaB - fechaA;
            }).slice(0, 3);
            
            setFotosPiezas(ultimasFotos);
          }
        } catch (err) {
          console.warn(`Error al obtener fotos para pieza ${primeraPieza.id}:`, err);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar fotografías:', err);
      setError('No se pudieron cargar las fotografías del vehículo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFotos();
  }, [vehiculoId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    let successCount = 0;
    let errorCount = 0;
    let invalidCount = 0;
    
    // Procesar cada archivo
    for (const file of files) {
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        invalidCount++;
        continue;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nombre', file.name);
      
      try {
        await vehiculoFotosService.upload(Number(vehiculoId), formData);
        successCount++;
      } catch (err) {
        console.error(`Error al subir fotografía ${file.name}:`, err);
        errorCount++;
      }
    }
    
    // Mostrar mensajes de resultado
    if (invalidCount > 0) {
      toast({
        title: invalidCount > 1 ? `${invalidCount} archivos no válidos` : "Archivo no válido",
        description: invalidCount > 1 
          ? `${invalidCount} archivos no son imágenes válidas (JPG, PNG, etc.).` 
          : "Un archivo no es una imagen válida (JPG, PNG, etc.).",
        variant: "destructive"
      });
    }
    
    if (successCount > 0) {
      toast({
        title: successCount > 1 ? `${successCount} fotografías subidas` : "Fotografía subida",
        description: successCount > 1 
          ? `Se han subido ${successCount} fotografías correctamente.` 
          : "La fotografía se ha subido correctamente."
      });
    }
    
    if (errorCount > 0) {
      toast({
        title: errorCount > 1 ? `Error en ${errorCount} fotografías` : "Error",
        description: errorCount > 1 
          ? `No se pudieron subir ${errorCount} fotografías. Inténtalo de nuevo.` 
          : "No se pudo subir la fotografía. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
    
    // Actualizar la lista de fotos
    fetchFotos();
    
    // Resetear el input
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta fotografía?')) return;
    
    try {
      await vehiculoFotosService.delete(id);
      toast({
        title: "Fotografía eliminada",
        description: "La fotografía ha sido eliminada correctamente."
      });
      setFotos(fotos.filter(foto => foto.id !== id));
    } catch (err) {
      console.error('Error al eliminar fotografía:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la fotografía. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleSetAsPrincipal = async (id: number) => {
    try {
      await vehiculoFotosService.setAsPrincipal(id);
      toast({
        title: "Fotografía principal actualizada",
        description: "Se ha establecido como fotografía principal."
      });
      // Actualizar estado local
      setFotos(fotos.map(foto => ({
        ...foto,
        es_principal: foto.id === id
      })));
    } catch (err) {
      console.error('Error al establecer foto principal:', err);
      toast({
        title: "Error",
        description: "No se pudo establecer como foto principal. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Fotografías del Vehículo
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            size="sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir Fotografía
              </>
            )}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*"
            multiple
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Cargando fotografías...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {fotos.length > 0 && (
              <>
                <h3 className="font-medium mb-3">Fotografías del vehículo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {fotos.map(foto => (
                    <div key={foto.id} className="relative group">
                      <div className={cn(
                        "relative aspect-square rounded-md overflow-hidden border",
                        foto.es_principal ? "ring-2 ring-primary" : ""
                      )}>
                        <img 
                          src={foto.url} 
                          alt={foto.nombre || 'Fotografía del vehículo'} 
                          className="object-cover w-full h-full"
                        />
                        {foto.es_principal && (
                          <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
                            <Star className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!foto.es_principal && (
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={() => handleSetAsPrincipal(foto.id)}
                            title="Establecer como principal"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDelete(foto.id)}
                          title="Eliminar fotografía"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {fotosPiezas.length > 0 && (
              <>
                <h3 className="font-medium mb-3 mt-6">Últimas fotografías de piezas asociadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotosPiezas.map(foto => (
                    <div key={`pieza-${foto.id}`} className="overflow-hidden rounded-md border bg-card shadow relative">
                      <div className="relative aspect-square">
                        <img 
                          src={foto.url} 
                          alt={foto.nombre} 
                          className="h-full w-full object-cover transition-all hover:scale-105"
                          onError={(e) => (e.target as HTMLImageElement).src = '/placeholder-image.png'}
                        />
                        {foto.es_principal && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500"><Star className="w-3 h-3 mr-1" /> Principal</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-xs text-muted-foreground truncate">
                        {foto.nombre}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {fotos.length === 0 && fotosPiezas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay fotografías disponibles para este vehículo.</p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Subir Fotografía
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VehiculoFotosTab;
