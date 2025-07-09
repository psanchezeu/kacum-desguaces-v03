import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  FileText,
  Edit,
  Copy,
  Trash2,
  Download,
  Upload,
  Car,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/common/DataTable";
import NuevaPlantillaDialog from "@/components/configuracion/NuevaPlantillaDialog";
import AsignarPlantillaDialog from "@/components/configuracion/AsignarPlantillaDialog";
import type { PlantillaVehiculo } from "@/types";

const PlantillasVehiculosTab: React.FC = () => {
  const { toast } = useToast();
  const [plantillas, setPlantillas] = useState<PlantillaVehiculo[]>([
    {
      id: 1,
      nombre: "Renault Megane IV - Despiece Básico",
      marca: "Renault",
      modelo: "Megane",
      version: "IV",
      piezas: [
        { id: 1, nombre: "Piloto trasero derecho", descripcion: "Piloto LED", categoria: "Carrocería", obligatoria: true },
        { id: 2, nombre: "Motor", descripcion: "Bloque motor completo", categoria: "Motor", obligatoria: true },
        { id: 3, nombre: "Puerta delantera izquierda", descripcion: "Puerta completa con cristal", categoria: "Carrocería", obligatoria: false }
      ],
      observaciones: "Plantilla estándar para Megane IV",
      fecha_creacion: new Date(),
      activa: true
    }
  ]);
  
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [mostrarNuevaPlantilla, setMostrarNuevaPlantilla] = useState(false);
  const [mostrarAsignarPlantilla, setMostrarAsignarPlantilla] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaVehiculo | null>(null);

  const plantillasFiltradas = plantillas.filter(plantilla => {
    const coincideTexto = plantilla.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                         plantilla.marca.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                         plantilla.modelo.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideMarca = !filtroMarca || plantilla.marca.toLowerCase().includes(filtroMarca.toLowerCase());
    
    return coincideTexto && coincideMarca;
  });

  const handleCrearPlantilla = (nuevaPlantilla: Omit<PlantillaVehiculo, 'id' | 'fecha_creacion'>) => {
    const plantilla: PlantillaVehiculo = {
      ...nuevaPlantilla,
      id: Math.max(0, ...plantillas.map(p => p.id)) + 1,
      fecha_creacion: new Date()
    };
    
    setPlantillas([...plantillas, plantilla]);
    setMostrarNuevaPlantilla(false);
    
    toast({
      title: "Plantilla creada",
      description: `La plantilla "${plantilla.nombre}" se ha creado correctamente.`
    });
  };

  const handleEditarPlantilla = (id: number) => {
    const plantilla = plantillas.find(p => p.id === id);
    if (plantilla) {
      setPlantillaSeleccionada(plantilla);
      setMostrarNuevaPlantilla(true);
    }
  };

  const handleClonarPlantilla = (id: number) => {
    const plantilla = plantillas.find(p => p.id === id);
    if (plantilla) {
      const plantillaClonada: PlantillaVehiculo = {
        ...plantilla,
        id: Math.max(0, ...plantillas.map(p => p.id)) + 1,
        nombre: `${plantilla.nombre} (Copia)`,
        fecha_creacion: new Date()
      };
      
      setPlantillas([...plantillas, plantillaClonada]);
      
      toast({
        title: "Plantilla clonada",
        description: `Se ha creado una copia de "${plantilla.nombre}".`
      });
    }
  };

  const handleEliminarPlantilla = (id: number) => {
    const plantilla = plantillas.find(p => p.id === id);
    if (plantilla && window.confirm(`¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`)) {
      setPlantillas(plantillas.filter(p => p.id !== id));
      
      toast({
        title: "Plantilla eliminada",
        description: `La plantilla "${plantilla.nombre}" se ha eliminado correctamente.`
      });
    }
  };

  const handleAsignarPlantilla = (plantilla: PlantillaVehiculo) => {
    setPlantillaSeleccionada(plantilla);
    setMostrarAsignarPlantilla(true);
  };

  const handleExportarPlantillas = () => {
    const dataStr = JSON.stringify(plantillas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantillas_vehiculos.json';
    link.click();
    
    toast({
      title: "Exportación completada",
      description: "Las plantillas se han exportado correctamente."
    });
  };

  const handleImportarPlantillas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const plantillasImportadas = JSON.parse(e.target?.result as string);
          // Asignar nuevos IDs para evitar conflictos
          const plantillasConNuevosIds = plantillasImportadas.map((plantilla: any, index: number) => ({
            ...plantilla,
            id: Math.max(0, ...plantillas.map(p => p.id)) + index + 1
          }));
          
          setPlantillas([...plantillas, ...plantillasConNuevosIds]);
          
          toast({
            title: "Importación completada",
            description: `Se han importado ${plantillasConNuevosIds.length} plantillas.`
          });
        } catch (error) {
          toast({
            title: "Error en importación",
            description: "El archivo no tiene el formato correcto.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const columnas = [
    {
      header: "Plantilla",
      accessor: (plantilla: PlantillaVehiculo) => (
        <div>
          <div className="font-medium">{plantilla.nombre}</div>
          <div className="text-sm text-muted-foreground">
            {plantilla.marca} {plantilla.modelo} {plantilla.version}
          </div>
        </div>
      )
    },
    {
      header: "Piezas",
      accessor: (plantilla: PlantillaVehiculo) => (
        <Badge variant="outline">
          {plantilla.piezas.length} piezas
        </Badge>
      )
    },
    {
      header: "Estado",
      accessor: (plantilla: PlantillaVehiculo) => (
        <Badge className={plantilla.activa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {plantilla.activa ? "Activa" : "Inactiva"}
        </Badge>
      )
    },
    {
      header: "Fecha Creación",
      accessor: (plantilla: PlantillaVehiculo) => plantilla.fecha_creacion.toLocaleDateString()
    },
    {
      header: "Acciones",
      accessor: (plantilla: PlantillaVehiculo) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEditarPlantilla(plantilla.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleClonarPlantilla(plantilla.id)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAsignarPlantilla(plantilla)}>
            <Car className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleEliminarPlantilla(plantilla.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión de Plantillas de Vehículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, marca o modelo..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por marca..."
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={() => setMostrarNuevaPlantilla(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
            <Button variant="outline" onClick={handleExportarPlantillas}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </label>
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportarPlantillas}
              className="hidden"
            />
          </div>

          <DataTable
            data={plantillasFiltradas}
            columns={columnas}
            idField="id"
            basePath="/configuracion/plantillas"
            noActions={true}
          />
        </CardContent>
      </Card>

      {mostrarNuevaPlantilla && (
        <NuevaPlantillaDialog
          plantilla={plantillaSeleccionada}
          onGuardar={handleCrearPlantilla}
          onCerrar={() => {
            setMostrarNuevaPlantilla(false);
            setPlantillaSeleccionada(null);
          }}
        />
      )}

      {mostrarAsignarPlantilla && plantillaSeleccionada && (
        <AsignarPlantillaDialog
          plantilla={plantillaSeleccionada}
          onCerrar={() => {
            setMostrarAsignarPlantilla(false);
            setPlantillaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
};

export default PlantillasVehiculosTab;
