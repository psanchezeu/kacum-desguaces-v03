
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileDown,
  FilePlus2, 
  FileSpreadsheet, 
  FileText, 
  FileBarChart,
  Car, 
  Box, 
  ShoppingCart, 
  Calendar, 
  Users,
  AlertTriangle
} from "lucide-react";

const InformesPage: React.FC = () => {
  const handleGenerateReport = (reportType: string) => {
    // En una aplicación real, aquí se implementaría la generación del informe
    console.log(`Generando informe de ${reportType}`);
  };

  return (
    <PageLayout title="Informes">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Genera informes personalizados y exporta datos del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informe de Inventario */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-orange-500" />
              <CardTitle>Inventario de Piezas</CardTitle>
            </div>
            <CardDescription>
              Listado detallado de todas las piezas disponibles en stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Incluye:</span>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Tipos de piezas</li>
                  <li>Estados</li>
                  <li>Ubicaciones</li>
                  <li>Precios</li>
                  <li>Vehículos de origen</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('inventario-pdf')}
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('inventario-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informe de Ventas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <CardTitle>Ventas y Pedidos</CardTitle>
            </div>
            <CardDescription>
              Resumen de ventas e informe detallado de pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Incluye:</span>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Pedidos por periodo</li>
                  <li>Clientes más frecuentes</li>
                  <li>Piezas más vendidas</li>
                  <li>Ingresos totales</li>
                  <li>Métodos de pago</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('ventas-pdf')}
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('ventas-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informe de Vehículos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-500" />
              <CardTitle>Vehículos Procesados</CardTitle>
            </div>
            <CardDescription>
              Reporte de vehículos gestionados en el desguace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Incluye:</span>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Estados de vehículos</li>
                  <li>Marcas y modelos</li>
                  <li>Piezas extraídas</li>
                  <li>Ubicaciones</li>
                  <li>Valores residuales</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('vehiculos-pdf')}
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('vehiculos-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informe de Clientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <CardTitle>Clientes</CardTitle>
            </div>
            <CardDescription>
              Base de datos de clientes y actividad comercial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Incluye:</span>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Listado de clientes</li>
                  <li>Clasificación por tipo</li>
                  <li>Historial de compras</li>
                  <li>Vehículos entregados</li>
                  <li>Comunicaciones</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('clientes-pdf')}
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('clientes-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informe de Incidencias */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle>Incidencias y Problemas</CardTitle>
            </div>
            <CardDescription>
              Registro de incidencias y su resolución
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Incluye:</span>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Tipos de incidencias</li>
                  <li>Estados y resoluciones</li>
                  <li>Tiempo de resolución</li>
                  <li>Entidades afectadas</li>
                  <li>Usuarios responsables</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('incidencias-pdf')}
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('incidencias-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informe de Actividad */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-500" />
              <CardTitle>Actividad del Sistema</CardTitle>
            </div>
            <CardDescription>
              Registro cronológico de actividades en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Incluye:</span>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Registro de acciones</li>
                  <li>Usuarios activos</li>
                  <li>Cambios en entidades</li>
                  <li>Timeline de operaciones</li>
                  <li>Auditoría de seguridad</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('actividad-pdf')}
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleGenerateReport('actividad-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Informe Personalizado</CardTitle>
            <CardDescription>
              Crea un informe personalizado seleccionando los datos que necesitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleGenerateReport('personalizado')}>
              <FilePlus2 className="mr-2 h-4 w-4" /> Crear Informe Personalizado
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button className="h-auto py-8 flex flex-col">
          <FileBarChart className="h-12 w-12 mb-2" />
          <span className="text-lg font-medium">Informe Financiero</span>
          <span className="text-xs text-muted-foreground mt-1">Datos completos sobre facturación e ingresos</span>
        </Button>
        
        <Button variant="outline" className="h-auto py-8 flex flex-col">
          <FileText className="h-12 w-12 mb-2" />
          <span className="text-lg font-medium">Informe Operativo</span>
          <span className="text-xs text-muted-foreground mt-1">Actividad diaria del desguace y operaciones</span>
        </Button>
        
        <Button variant="outline" className="h-auto py-8 flex flex-col">
          <FileSpreadsheet className="h-12 w-12 mb-2" />
          <span className="text-lg font-medium">Exportar Base de Datos</span>
          <span className="text-xs text-muted-foreground mt-1">Exportación completa de datos en CSV/Excel</span>
        </Button>
      </div>
    </PageLayout>
  );
};

export default InformesPage;
