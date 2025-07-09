import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Box, FileText, Camera, Calendar, Loader2, Upload, X, Check } from "lucide-react";
import TabsNavigation, { TabItem } from "@/components/common/TabsNavigation";
import { useToast } from "@/hooks/use-toast";
import { vehiculosService } from "@/services/vehiculosService";
import { clientesService } from "@/services/clientesService";
import { piezasService } from "@/services/piezasService";
import { vehiculoDocumentosService, VehiculoDocumento } from "@/services/vehiculoDocumentosService";
import { vehiculoFotosService } from "@/services/vehiculoFotosService";
import VehiculoFotosTab from "./VehiculoFotosTab";
import { Vehiculo, Cliente, Pieza } from "@/types";
import DataTable from "@/components/common/DataTable";
import { cn } from "@/lib/utils";

// Componente para mostrar la pestaña de piezas
const VehiculoPiezasTab: React.FC<{ vehiculoId: string }> = ({ vehiculoId }) => {
  const navigate = useNavigate();
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPiezas = async () => {
      if (!vehiculoId) return;
      
      setIsLoading(true);
      try {
        const response = await piezasService.getAll(Number(vehiculoId));
        setPiezas(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar piezas:', err);
        setError('No se pudieron cargar las piezas.');
        setPiezas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPiezas();
  }, [vehiculoId]);

  // Añadir logs para depuración
  useEffect(() => {
    if (piezas.length > 0) {
      console.log('Piezas cargadas en VehiculoPiezasTab:', piezas);
    }
  }, [piezas]);

  const columns = [
    { header: "ID", accessorKey: "id", accessor: (row: any) => row.id },
    { 
      header: "Nombre", 
      accessorKey: "nombre", 
      accessor: (row: any) => row.nombre || row.descripcion || `Pieza ${row.id}`,
      cell: (info: any) => info.getValue() || `Pieza ${info.row.original.id}`
    },
    { 
      header: "Referencia", 
      accessorKey: "referencia", 
      accessor: (row: any) => {
        if (row.datos_adicionales) {
          const datosAdicionales = typeof row.datos_adicionales === 'string' ? 
            JSON.parse(row.datos_adicionales) : row.datos_adicionales;
          return datosAdicionales.referencia || datosAdicionales.codigo || `REF-${row.id}`;
        }
        return row.referencia || `REF-${row.id}`;
      },
      cell: (info: any) => {
        const row = info.row.original;
        if (row.datos_adicionales) {
          const datosAdicionales = typeof row.datos_adicionales === 'string' ? 
            JSON.parse(row.datos_adicionales) : row.datos_adicionales;
          return datosAdicionales.referencia || datosAdicionales.codigo || `REF-${row.id}`;
        }
        return row.referencia || `REF-${row.id}`;
      }
    },
    { header: "Estado", accessorKey: "estado", accessor: (row: any) => row.estado },
    { 
      header: "Precio", 
      accessorKey: "precio", 
      accessor: (row: any) => row.precio,
      cell: (info: any) => {
        const precio = info.getValue();
        return (typeof precio === 'number' && precio > 0) ? 
          `${precio.toFixed(2)}€` : "Consultar";
      }
    },
    {
      header: "Acciones",
      accessor: (row: any) => row.id,
      cell: (info: any) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/piezas/${info.row.original.id}`)}
        >
          Ver detalle
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Piezas del Vehículo
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/piezas/nueva?vehiculo=${vehiculoId}`)}
          >
            Añadir pieza
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => navigate(`/piezas?vehiculo=${vehiculoId}`)}
            >
              Ver todas las piezas
            </Button>
          </div>
        ) : piezas.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={piezas} 
            paginated={true}
            idField="id"
            basePath="/piezas"
            emptyMessage="No hay piezas registradas para este vehículo."
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay piezas registradas para este vehículo.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => navigate(`/piezas/nueva?vehiculo=${vehiculoId}`)}
            >
              Añadir pieza
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para la pestaña de información
const VehiculoInfoTab: React.FC<{ vehiculo: Vehiculo; cliente: Cliente | null }> = ({ vehiculo, cliente }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Información del Vehículo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Datos del Vehículo</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Marca:</span>
                <span>{vehiculo.marca}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Modelo:</span>
                <span>{vehiculo.modelo}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Año:</span>
                <span>{vehiculo.anio_fabricacion || 'No disponible'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Matrícula:</span>
                <span>{vehiculo.matricula || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Bastidor:</span>
                <span className="break-all">{vehiculo.bastidor || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Color:</span>
                <span>{vehiculo.color || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Combustible:</span>
                <span>{vehiculo.tipo_combustible || 'No disponible'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Kilometraje:</span>
                <span>{vehiculo.kilometraje ? `${vehiculo.kilometraje} km` : '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={vehiculo.estado === 'Activo' ? 'default' : 'secondary'}>
                  {vehiculo.estado}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Datos del Cliente</h3>
            {cliente ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span>{cliente.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{cliente.email || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span>{cliente.telefono || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span>{cliente.direccion || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">CIF/NIF:</span>
                  <span>{cliente.dni_nif || cliente.cif || 'No disponible'}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No hay cliente asociado a este vehículo.</p>
            )}
            
            <h3 className="font-semibold mt-6 mb-4">Fechas</h3>
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="font-medium">Fecha de matriculación:</span>
                <span>{vehiculo.fecha_matriculacion ? new Date(vehiculo.fecha_matriculacion).toLocaleDateString() : 'No disponible'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Kilómetros:</span>
                <span>{vehiculo.kilometros ? `${vehiculo.kilometros} km` : 'No disponible'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para la pestaña de documentos
const VehiculoDocumentosTab: React.FC<{ vehiculoId: string }> = ({ vehiculoId }) => {
  const { toast } = useToast();
  const [documentos, setDocumentos] = useState<VehiculoDocumento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fetchDocumentos = async () => {
    if (!vehiculoId) return;
    
    setIsLoading(true);
    try {
      const data = await vehiculoDocumentosService.getByVehiculoId(Number(vehiculoId));
      setDocumentos(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
      setError('No se pudieron cargar los documentos del vehículo.');
      setDocumentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [vehiculoId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Procesar cada archivo
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nombre', file.name);
      
      try {
        await vehiculoDocumentosService.upload(Number(vehiculoId), formData);
        successCount++;
      } catch (err) {
        console.error(`Error al subir documento ${file.name}:`, err);
        errorCount++;
      }
    }
    
    // Mostrar mensajes de resultado
    if (successCount > 0) {
      toast({
        title: successCount > 1 ? `${successCount} documentos subidos` : "Documento subido",
        description: successCount > 1 
          ? `Se han subido ${successCount} documentos correctamente.` 
          : "El documento se ha subido correctamente."
      });
    }
    
    if (errorCount > 0) {
      toast({
        title: errorCount > 1 ? `Error en ${errorCount} documentos` : "Error",
        description: errorCount > 1 
          ? `No se pudieron subir ${errorCount} documentos. Inténtalo de nuevo.` 
          : "No se pudo subir el documento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
    
    // Actualizar la lista de documentos
    fetchDocumentos();
    
    // Resetear el input
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return;
    
    try {
      await vehiculoDocumentosService.delete(id);
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente."
      });
      // Actualizar estado local
      setDocumentos(documentos.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Error al eliminar documento:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Vehículo
          </div>
          <div>
            <input
              type="file"
              id="document-upload"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir documento
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : documentos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((documento) => (
              <div 
                key={documento.id} 
                className="border rounded-md p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium truncate" title={documento.nombre}>
                    {documento.nombre}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => handleDelete(documento.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Subido el {new Date(documento.fecha_subida).toLocaleDateString('es-ES')}
                </div>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(documento.url, '_blank')}
                  >
                    Ver documento
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay documentos registrados para este vehículo.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => fileInputRef.current?.click()}
            >
              Subir documento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
// Componente principal para la vista de detalle de vehículo
const VehiculoView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehiculoId = id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehiculoData = async () => {
      if (!vehiculoId) return;
      
      setIsLoading(true);
      try {
        // Obtener datos del vehículo
        const vehiculoData = await vehiculosService.getById(Number(vehiculoId));
        setVehiculo(vehiculoData);
        
        // Si el vehículo tiene cliente asociado, obtener sus datos
        if (vehiculoData.id_cliente) {
          try {
            const clienteData = await clientesService.getById(vehiculoData.id_cliente);
            setCliente(clienteData);
          } catch (err) {
            console.error('Error al cargar datos del cliente:', err);
            // No establecemos error global si falla solo la carga del cliente
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del vehículo:', err);
        setError('No se pudieron cargar los datos del vehículo.');
        setVehiculo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehiculoData();
  }, [vehiculoId]);

  const handleDelete = async () => {
    if (!vehiculo) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar el vehículo ${vehiculo.marca} ${vehiculo.modelo}?`)) {
      return;
    }
    
    try {
      await vehiculosService.delete(vehiculo.id);
      toast({
        title: "Vehículo eliminado",
        description: "El vehículo ha sido eliminado correctamente."
      });
      navigate('/vehiculos');
    } catch (err) {
      console.error('Error al eliminar vehículo:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const tabs: TabItem[] = [
    { value: 'info', label: 'Información', path: `/vehiculos/${vehiculoId}/info` },
    { value: 'piezas', label: 'Piezas', path: `/vehiculos/${vehiculoId}/piezas` },
    { value: 'fotos', label: 'Fotos', path: `/vehiculos/${vehiculoId}/fotos` },
    { value: 'documentos', label: 'Documentos', path: `/vehiculos/${vehiculoId}/documentos` },
  ];

  if (isLoading) {
    return (
      <PageLayout title="Cargando vehículo...">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !vehiculo) {
    return (
      <PageLayout title="Error">
        <div className="flex flex-col justify-center items-center h-[50vh]">
          <p className="text-red-500 mb-4">{error || 'No se encontró el vehículo solicitado.'}</p>
          <Button onClick={() => navigate('/vehiculos')}>Volver a vehículos</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.version || ''} - Matrícula: ${vehiculo.matricula || 'No disponible'}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/vehiculos/${vehiculo.id}/editar`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <TabsNavigation 
          tabs={tabs} 
          className="mb-4"
        />
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="info" replace />} />
        <Route path="info" element={<VehiculoInfoTab vehiculo={vehiculo} cliente={cliente} />} />
        <Route path="piezas" element={<VehiculoPiezasTab vehiculoId={vehiculoId} />} />
        <Route path="fotos" element={<VehiculoFotosTab vehiculoId={vehiculoId} />} />
        <Route path="documentos" element={<VehiculoDocumentosTab vehiculoId={vehiculoId} />} />
      </Routes>
    </PageLayout>
  );
};

export default VehiculoView;
