import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, Download, AlertCircle, CheckCircle, X, DownloadCloud } from "lucide-react";
import { woocommerceService, WooCommerceProduct, ImportPiezaResult } from "@/services/woocommerceService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

const WooCommerceImportTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isImportingAll, setIsImportingAll] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(50); // Valor predeterminado más alto
  const perPageOptions = [10, 25, 50, 100, 200]; // Opciones para el selector
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    lastResult: ImportPiezaResult | null;
  }>({ current: 0, total: 0, percentage: 0, lastResult: null });
  const [importResults, setImportResults] = useState<{
    show: boolean;
    stats: {
      total: number;
      importadas: number;
      errores: number;
      detalles: Array<{
        producto: string;
        resultado: {
          success: boolean;
          message: string;
          piezaId?: number;
          error?: string;
        };
      }>;
    };
    isMassiveImport?: boolean;
  }>({ show: false, stats: { total: 0, importadas: 0, errores: 0, detalles: [] } });
  const [showResultsDialog, setShowResultsDialog] = useState<boolean>(false);

  // Cargar productos al montar el componente o cuando cambia la página o término de búsqueda
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setConnectionError(null);
        const data = await woocommerceService.getProducts(currentPage, perPage, searchTerm);
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
      } catch (error) {
        console.error("Error al cargar productos de WooCommerce:", error);
        setConnectionError(
          "No se pudieron cargar los productos de WooCommerce. Verifique su configuración de conexión."
        );
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, perPage, searchTerm]);

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se busca
  };

  // Manejar búsqueda al presionar Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
    }
  };

  // Manejar selección de todos los productos
  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      // Deseleccionar todos
      setSelectedProducts(new Set());
    } else {
      // Seleccionar todos
      const newSelected = new Set<number>();
      products.forEach(product => newSelected.add(product.id));
      setSelectedProducts(newSelected);
    }
  };

  // Manejar selección individual de producto
  const handleSelectProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Importar productos seleccionados
  const handleImportSelected = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Selección vacía",
        description: "Por favor, seleccione al menos un producto para importar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress({ current: 0, total: selectedProducts.size, percentage: 0, lastResult: null });
      setImportResults({ show: false, stats: { total: 0, importadas: 0, errores: 0, detalles: [] } });

      const productIds = Array.from(selectedProducts);

      const onProgress = (current: number, total: number, lastResult?: ImportPiezaResult) => {
        const percentage = Math.round((current / total) * 100);
        setImportProgress({ current, total, percentage, lastResult });
      };

      const results = await woocommerceService.importMultipleProducts(productIds, onProgress);

      setImportResults({
        show: true,
        stats: {
          total: results.total,
          importadas: results.importadas,
          errores: results.errores,
          detalles: results.detalles
        }
      });
      setShowResultsDialog(true);

      toast({
        title: "Importación completada",
        description: `Se importaron ${results.importadas} de ${results.total} productos. ${results.errores} errores.`,
        variant: results.errores > 0 ? "destructive" : "default"
      });
    } catch (error) {
      console.error("Error al importar productos:", error);
      toast({
        title: "Error en la importación",
        description: "Ocurrió un error durante el proceso de importación. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Recargar productos después de importar
      const data = await woocommerceService.getProducts(currentPage, perPage, searchTerm);
      setProducts(data.products);
      setSelectedProducts(new Set()); // Limpiar selección
    }
  };

  // Importar todos los productos de WooCommerce
  const handleImportAll = async () => {
    try {
      setIsImportingAll(true);
      setShowConfirmDialog(false);

      // Resetear el progreso
      setImportProgress({ current: 0, total: totalProducts, percentage: 0, lastResult: null });

      // Llamar al servicio para importar todos los productos
      const stats = await woocommerceService.importAllProducts(
        (current, total, lastResult) => {
          setImportProgress({ current, total, percentage: Math.round((current / total) * 100), lastResult });
        }
      );

      // Mostrar resultados
      setImportResults({
        show: true,
        stats: {
          total: stats.total,
          importadas: stats.importadas,
          errores: stats.errores,
          detalles: stats.detalles
        },
        isMassiveImport: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al importar todos los productos',
        variant: 'destructive'
      });
      console.error('Error al importar todos los productos:', error);
    } finally {
      setIsImportingAll(false);
    }
  };

  // Renderizar paginación
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationLink className="cursor-not-allowed opacity-50">...</PaginationLink>
                </PaginationItem>
              )}
            </>
          )}

          {pages}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink className="cursor-not-allowed opacity-50">...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (connectionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Importar Piezas desde WooCommerce</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/integraciones/woocommerce?tab=config"}
            >
              Ir a Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Importar Piezas desde WooCommerce</CardTitle>
          <CardDescription>
            Seleccione los productos de WooCommerce que desea importar como piezas en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                disabled={!searchTerm}
              >
                Limpiar
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Tabla de productos */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedProducts.size > 0 && selectedProducts.size === products.length}
                            onCheckedChange={handleSelectAll}
                            aria-label="Seleccionar todos"
                          />
                        </TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No se encontraron productos.
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => handleSelectProduct(product.id)}
                                aria-label={`Seleccionar ${product.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0].src}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <span>{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{product.sku || "-"}</TableCell>
                            <TableCell>{product.price || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={product.stock_status === "instock" ? "outline" : "secondary"}>
                                {product.stock_quantity !== null ? product.stock_quantity : "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.status === "publish" ? "default" : "secondary"}>
                                {product.status === "publish" ? "Publicado" : product.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación y selector de productos por página */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {products.length} de {totalProducts} productos
                    </p>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="perPageSelect" className="text-sm whitespace-nowrap">
                        Productos por página:
                      </Label>
                      <select
                        id="perPageSelect"
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(Number(e.target.value));
                          setCurrentPage(1); // Resetear a la primera página al cambiar
                        }}
                        className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {perPageOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {renderPagination()}
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Badge variant="outline" className="mr-2">
              {selectedProducts.size} productos seleccionados
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isImporting || isImportingAll}
              className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
            >
              {isImportingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando masivamente...
                </>
              ) : (
                <>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Importar Todos ({totalProducts})
                </>
              )}
            </Button>
            <Button
              onClick={handleImportSelected}
              disabled={isImporting || isImportingAll || selectedProducts.size === 0}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando... {importProgress.current}/{importProgress.total}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Importar Seleccionados
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {(isImporting || isImportingAll) && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de importación {isImportingAll ? "masiva" : ""}</span>
                <span>{importProgress.percentage}%</span>
              </div>
              <Progress value={importProgress.percentage} />
              <p className="text-sm text-muted-foreground text-center">
                Importando {importProgress.current} de {importProgress.total} productos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación para importación masiva */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar importación masiva</DialogTitle>
            <DialogDescription>
              Está a punto de iniciar la importación de todos los productos de WooCommerce ({totalProducts} productos). 
              Este proceso puede tardar mucho tiempo dependiendo de la cantidad de productos.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
            <AlertCircle className="h-5 w-5 text-amber-600 inline-block mr-2" />
            <span className="text-amber-800">
              Advertencia: La importación de un gran volumen de productos (más de 150.000) puede consumir muchos recursos y tiempo.
              Se recomienda realizar este proceso en horarios de baja actividad.
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => {
                setShowConfirmDialog(false);
                handleImportAll();
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Iniciar importación masiva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de resultados de importación */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Resultados de la importación {importResults.isMassiveImport ? "masiva" : ""}</DialogTitle>
            <DialogDescription>
              Resumen de los productos importados y posibles errores.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between mb-4">
              <div className="text-sm">
                <span className="font-medium">Total:</span> {importResults.stats.total}
              </div>
              <div className="text-sm text-green-600">
                <span className="font-medium">Importados:</span> {importResults.stats.importadas}
              </div>
              <div className="text-sm text-red-600">
                <span className="font-medium">Errores:</span> {importResults.stats.errores}
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {importResults.stats.detalles.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md border ${
                    item.resultado.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start">
                    {item.resultado.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{item.producto}</p>
                      <p className="text-sm">
                        {item.resultado.message}
                      </p>
                      {item.resultado.error && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {item.resultado.error}
                        </p>
                      )}
                      {item.resultado.piezaId && (
                        <p className="text-sm text-green-600 mt-1">
                          ID de pieza creada: {item.resultado.piezaId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setShowResultsDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WooCommerceImportTab;
