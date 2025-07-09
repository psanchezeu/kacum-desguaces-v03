import React, { useState, useEffect, useCallback } from 'react';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Edit, Trash2, Car, ShoppingCart, Tag, Calendar, FileText, Image, Loader2, AlertCircle } from "lucide-react";
import TabsNavigation, { TabItem } from "@/components/common/TabsNavigation";
import { useToast } from "@/hooks/use-toast";
import { Pieza, Vehiculo, Pedido } from "@/types";
import { piezasService } from "@/services/piezasService";
import { vehiculosService } from "@/services/vehiculosService";
import { pedidosService } from "@/services/pedidosService";
import { documentosService, Documento } from "@/services/documentosService";
import { fotosService, Foto } from "@/services/fotosService";

const PiezaInfoTab: React.FC<{ pieza: Pieza; vehiculo: Vehiculo | null; isInPedido: boolean; pedidosRelacionados: Pedido[]; checkingPedidos: boolean }> = ({ pieza, vehiculo, isInPedido, pedidosRelacionados, checkingPedidos }) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Información de la Pieza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Pieza</p>
              <p>{pieza.tipo_pieza}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descripción</p>
              <p>{pieza.descripcion}</p>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
              <p>
                {vehiculo ? (
                  <span className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}>
                    {vehiculo.marca} {vehiculo.modelo} ({vehiculo.matricula})
                  </span>
                ) : (
                  "Vehículo no disponible"
                )}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ubicación en Almacén</p>
              <p>{pieza.ubicacion_almacen}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Extracción</p>
              <p>{new Date(pieza.fecha_extraccion).toLocaleDateString('es-ES')}</p>
            </div>
            
            {pieza.fecha_caducidad && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Caducidad</p>
                <p>{new Date(pieza.fecha_caducidad).toLocaleDateString('es-ES')}</p>
              </div>
            )}
            
            {pieza.lote && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lote</p>
                <p>{pieza.lote}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Precio de Coste</p>
              <p>{pieza.precio_coste.toFixed(2)} €</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Precio de Venta</p>
              <p className="font-medium">{pieza.precio_venta.toFixed(2)} €</p>
            </div>
            
            {pieza.observaciones && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                <p>{pieza.observaciones}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Datos Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Reciclable</p>
              <Badge variant={pieza.reciclable ? "default" : "outline"}>
                {pieza.reciclable ? "Sí" : "No"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Bloqueada para Venta</p>
              <Badge variant={pieza.bloqueada_venta ? "destructive" : "outline"}>
                {pieza.bloqueada_venta ? "Sí" : "No"}
              </Badge>
            </div>
            
            {pieza.codigo_qr && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código QR</p>
                <p>{pieza.codigo_qr}</p>
              </div>
            )}
            
            {pieza.rfid && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">RFID</p>
                <p>{pieza.rfid}</p>
              </div>
            )}
            
            {/* Mostrar datos de WooCommerce si están disponibles */}
            {pieza.datos_adicionales && (
              <>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold mb-2">Datos de WooCommerce</p>
                  
                  {(() => {
                    try {
                      const wooData = JSON.parse(pieza.datos_adicionales);
                      return (
                        <div className="space-y-3">
                          {wooData.woocommerce_id && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">ID en WooCommerce</p>
                              <p className="text-sm">{wooData.woocommerce_id}</p>
                            </div>
                          )}
                          
                          {wooData.woocommerce_url && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">URL del producto</p>
                              <a 
                                href={wooData.woocommerce_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Ver en tienda
                              </a>
                            </div>
                          )}
                          
                          {/* Datos del vehículo */}
                          {(wooData.marca || wooData.modelo) && (
                            <div className="border-t pt-3 mt-2">
                              <p className="text-xs font-medium mb-2">Datos del vehículo</p>
                              
                              {wooData.marca && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Marca:</p>
                                  <p className="text-sm">{wooData.marca}</p>
                                </div>
                              )}
                              
                              {wooData.modelo && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Modelo:</p>
                                  <p className="text-sm">{wooData.modelo}</p>
                                </div>
                              )}
                              
                              {wooData.version && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Versión:</p>
                                  <p className="text-sm">{wooData.version}</p>
                                </div>
                              )}
                              
                              {wooData.anio_vehiculo && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Año:</p>
                                  <p className="text-sm">{wooData.anio_vehiculo}</p>
                                </div>
                              )}
                              
                              {wooData.color && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Color:</p>
                                  <p className="text-sm">{wooData.color}</p>
                                </div>
                              )}
                              
                              {wooData.combustible && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Combustible:</p>
                                  <p className="text-sm">{wooData.combustible}</p>
                                </div>
                              )}
                              
                              {wooData.bastidor && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Bastidor:</p>
                                  <p className="text-sm">{wooData.bastidor}</p>
                                </div>
                              )}
                              
                              {wooData.matricula && (
                                <div className="grid grid-cols-2 gap-1">
                                  <p className="text-xs text-muted-foreground">Matrícula:</p>
                                  <p className="text-sm">{wooData.matricula}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-sm text-destructive">Error al procesar datos adicionales</p>;
                    }
                  })()}
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2 pt-4">
              <Car className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {vehiculo ? `Extraído de vehículo ${vehiculo.matricula}` : "Sin vehículo asociado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Margen: {(((pieza.precio_venta - pieza.precio_coste) / pieza.precio_coste) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isInPedido ? "Incluida en pedido" : "Disponible para venta"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Registrada el {new Date(pieza.fecha_extraccion).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {checkingPedidos ? (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500 mr-2" />
                <p className="text-sm font-medium">Verificando pedidos relacionados...</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Comprobando si la pieza está asociada a algún pedido</p>
            </div>
          ) : isInPedido ? (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-700">
                ⚠️ Esta pieza está asociada a {pedidosRelacionados.length} {pedidosRelacionados.length === 1 ? 'pedido' : 'pedidos'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">No se puede eliminar mientras esté incluida en pedidos</p>
              
              {pedidosRelacionados.length > 0 && (
                <div className="mt-2 border-t border-red-200 pt-2">
                  <p className="text-xs font-medium text-red-700">Pedidos relacionados:</p>
                  <ul className="list-disc pl-5 text-xs mt-1 text-red-700">
                    {pedidosRelacionados.map(pedido => (
                      <li key={pedido.id}>
                        Pedido #{pedido.id} - {new Date(pedido.fecha_pedido).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {pieza.bloqueada_venta && (
            <div className="mt-6 p-3 bg-destructive/20 rounded-md">
              <p className="text-sm font-medium">⚠️ Venta bloqueada</p>
              <p className="text-xs text-muted-foreground mt-1">Esta pieza no está disponible para la venta</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface PiezaDocumentosTabProps {
  pieza: Pieza;
}

const PiezaDocumentosTab: React.FC<PiezaDocumentosTabProps> = ({ pieza }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar documentos de la pieza desde la API
  const fetchDocumentos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentosService.getByPiezaId(pieza.id);
      setDocumentos(data);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
      setError('No se pudieron cargar los documentos');
      setDocumentos([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocumentos();
  }, [pieza.id]);
  
  // Referencia al input de archivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Manejar la subida de un documento
  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombre', file.name);
    formData.append('tipo', file.type);

    setIsUploading(true);
    try {
      await documentosService.upload(pieza.id, formData);
      toast({
        title: "Documento subido",
        description: "El documento se ha subido correctamente.",
      });
      fetchDocumentos(); // Recargar la lista de documentos
    } catch (err) {
      console.error('Error al subir documento:', err);
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Manejar la eliminación de un documento
  const handleDeleteDocument = async (documentoId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) return;

    try {
      await documentosService.delete(documentoId);
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente.",
      });
      // Actualizar la lista de documentos
      setDocumentos(documentos.filter(doc => doc.id !== documentoId));
    } catch (err) {
      console.error('Error al eliminar documento:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos de la Pieza: {pieza.tipo_pieza}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Input de archivo oculto */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleUploadDocument}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={fetchDocumentos}
            >
              Reintentar
            </Button>
          </div>
        ) : documentos.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                  </>
                ) : (
                  <>Subir Documento</>
                )}
              </Button>
            </div>
            <div className="border rounded-md divide-y">
              {documentos.map((doc) => (
                <div key={doc.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{doc.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.tamanio)} • {new Date(doc.fecha_subida).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay documentos disponibles para esta pieza.</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                </>
              ) : (
                <>Subir Documento</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PiezaFotosTabProps {
  pieza: Pieza;
}

const PiezaFotosTab: React.FC<PiezaFotosTabProps> = ({ pieza }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar fotos de la pieza desde la API
  const fetchFotos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fotosService.getByPiezaId(pieza.id);
      setFotos(data);
    } catch (err) {
      console.error('Error al cargar fotos:', err);
      setError('No se pudieron cargar las fotos');
      setFotos([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFotos();
  }, [pieza.id]);
  
  // Referencia al input de archivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Manejar la subida de una foto
  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Verificar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombre', file.name);
    formData.append('descripcion', '');

    setIsUploading(true);
    try {
      await fotosService.upload(pieza.id, formData);
      toast({
        title: "Foto subida",
        description: "La foto se ha subido correctamente.",
      });
      fetchFotos(); // Recargar la lista de fotos
    } catch (err) {
      console.error('Error al subir foto:', err);
      toast({
        title: "Error",
        description: "No se pudo subir la foto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Manejar la eliminación de una foto
  const handleDeletePhoto = async (fotoId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta foto?")) return;

    try {
      await fotosService.delete(fotoId);
      toast({
        title: "Foto eliminada",
        description: "La foto se ha eliminado correctamente.",
      });
      // Actualizar la lista de fotos
      setFotos(fotos.filter(foto => foto.id !== fotoId));
    } catch (err) {
      console.error('Error al eliminar foto:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Establecer una foto como principal
  const handleSetAsPrincipal = async (fotoId: number) => {
    try {
      await fotosService.setAsPrincipal(fotoId);
      toast({
        title: "Foto principal",
        description: "La foto se ha establecido como principal.",
      });
      // Actualizar el estado de las fotos
      setFotos(fotos.map(foto => ({
        ...foto,
        es_principal: foto.id === fotoId
      })));
    } catch (err) {
      console.error('Error al establecer foto como principal:', err);
      toast({
        title: "Error",
        description: "No se pudo establecer la foto como principal.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Fotografías de la Pieza: {pieza.tipo_pieza}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Input de archivo oculto */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleUploadPhoto}
          accept="image/*"
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={fetchFotos}
            >
              Reintentar
            </Button>
          </div>
        ) : fotos.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                  </>
                ) : (
                  <>Subir Fotografía</>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {fotos.map((foto) => (
                <div key={foto.id} className="border rounded-md overflow-hidden relative group">
                  <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                    {foto.es_principal && (
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full shadow-sm">
                        Principal
                      </span>
                    )}
                    {foto.origen && (
                      <span className={`text-white text-xs px-2 py-1 rounded-full shadow-sm ${
                        foto.origen === 'woocommerce' ? 'bg-blue-600' : 
                        foto.origen === 'bucket' ? 'bg-amber-600' : 'bg-slate-600'
                      }`}>
                        {foto.origen === 'woocommerce' ? 'WooCommerce' : 
                         foto.origen === 'bucket' ? 'Bucket' : foto.origen}
                      </span>
                    )}
                  </div>
                  <div className="relative pb-[75%] bg-slate-100">
                    {foto.url && (
                      <ImageWithFallback
                        key={`img-${foto.id}`}
                        src={foto.url}
                        fallbackSrc="/placeholder-pieza.jpg"
                        alt={foto.nombre || 'Foto de pieza'}
                        className="absolute inset-0 w-full h-full object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    )}
                  </div>
                  <div className="p-2 bg-white border-t flex justify-between items-center">
                    <p className="text-sm truncate max-w-[150px]" title={foto.nombre}>
                      {foto.nombre.length > 20 ? `${foto.nombre.substring(0, 20)}...` : foto.nombre}
                    </p>
                    <div className="flex gap-1">
                      {!foto.es_principal && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleSetAsPrincipal(foto.id)}
                          title="Establecer como principal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePhoto(foto.id)}
                        title="Eliminar foto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay fotografías disponibles para esta pieza.</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                </>
              ) : (
                <>Subir Fotografía</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PiezaView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pieza, setPieza] = useState<Pieza | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [checkingPedidos, setCheckingPedidos] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInPedido, setIsInPedido] = useState<boolean>(false);
  const [pedidosRelacionados, setPedidosRelacionados] = useState<Pedido[]>([]);
  
  // Verificar si la pieza está en algún pedido
  const checkPiezaInPedidos = async () => {
    setCheckingPedidos(true);
    try {
      const pedidosConPieza = await pedidosService.getByPiezaId(Number(id));
      setIsInPedido(pedidosConPieza.length > 0);
      setPedidosRelacionados(pedidosConPieza);
      
      if (pedidosConPieza.length > 0) {
        console.log(`Pieza encontrada en ${pedidosConPieza.length} pedidos`);
      } else {
        console.log('Pieza no encontrada en ningún pedido');
      }
    } catch (error) {
      console.error("Error al verificar pedidos relacionados:", error);
      toast({
        title: "Advertencia",
        description: "No se pudo verificar si la pieza está en pedidos. Se bloqueará la eliminación por precaución.",
        variant: "destructive",
      });
      // En caso de error, bloqueamos la eliminación por precaución
      setIsInPedido(true);
      setPedidosRelacionados([]);
    } finally {
      setCheckingPedidos(false);
    }
  };

  // Cargar datos de la pieza y el vehículo asociado
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Cargar datos de la pieza
        const piezaData = await piezasService.getById(Number(id));
        setPieza(piezaData);
        
        // Cargar datos del vehículo asociado
        try {
          const vehiculoData = await vehiculosService.getById(piezaData.id_vehiculo);
          setVehiculo(vehiculoData);
        } catch (err) {
          console.error('Error al cargar vehículo:', err);
          setVehiculo(null);
        }
        
        // Verificar si la pieza está en algún pedido
        await checkPiezaInPedidos();
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar pieza:', err);
        setError('No se pudo cargar la información de la pieza');
        setPieza(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Tabs para la navegación
  const tabs: TabItem[] = [
    { label: "Información", value: "info", path: `/piezas/${id}` },
    { label: "Documentos", value: "documentos", path: `/piezas/${id}/documentos` },
    { label: "Fotografías", value: "fotos", path: `/piezas/${id}/fotos` }
  ];

  const handleDelete = async () => {
    // Verificar nuevamente si la pieza está en pedidos antes de eliminar
    await checkPiezaInPedidos();
    
    if (isInPedido) {
      toast({
        title: "No se puede eliminar",
        description: "Esta pieza está asociada a pedidos y no puede ser eliminada.",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("¿Estás seguro de que deseas eliminar esta pieza?")) return;
    
    setIsDeleting(true);
    try {
      await piezasService.delete(Number(id));
      toast({
        title: "Pieza eliminada",
        description: "La pieza ha sido eliminada correctamente.",
      });
      navigate("/piezas");
    } catch (err) {
      console.error('Error al eliminar pieza:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la pieza. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Cargando pieza...">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mr-2" />
          <span className="text-lg">Cargando información de la pieza...</span>
        </div>
      </PageLayout>
    );
  }

  if (error || !pieza) {
    return (
      <PageLayout title="Error al cargar pieza">
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {error || `No se ha encontrado la pieza con ID ${id}`}
          </p>
          <Button
            onClick={() => navigate("/piezas")}
            variant="outline"
          >
            Volver al listado de piezas
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Pieza: ${pieza.tipo_pieza}`}>
      <div className="mb-6 flex justify-between items-center">
        <Badge variant="outline" className={`text-base py-1 px-3 
          ${pieza.estado === "nueva" ? "border-green-500 text-green-500" :
           pieza.estado === "usada" ? "border-blue-500 text-blue-500" :
           pieza.estado === "dañada" ? "border-red-500 text-red-500" :
           pieza.estado === "en_revision" ? "border-amber-500 text-amber-500" :
           "border-gray-500 text-gray-500"}`}>
          {pieza.estado}
        </Badge>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/piezas/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isInPedido || isDeleting || checkingPedidos}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </>
            )}
          </Button>
        </div>
      </div>

      <TabsNavigation tabs={tabs} className="mb-6" />

      <Routes>
        <Route path="/" element={
          <PiezaInfoTab 
            pieza={pieza} 
            vehiculo={vehiculo} 
            isInPedido={isInPedido} 
            pedidosRelacionados={pedidosRelacionados} 
            checkingPedidos={checkingPedidos} 
          />
        } />
        <Route path="/documentos" element={<PiezaDocumentosTab pieza={pieza} />} />
        <Route path="/fotos" element={<PiezaFotosTab pieza={pieza} />} />
        <Route path="*" element={<Navigate to={`/piezas/${id}`} replace />} />
      </Routes>
    </PageLayout>
  );
};

export default PiezaView;
