
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MapPin,
  Edit,
  Trash2,
  Car,
  Users,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/common/DataTable";
import NuevaCampaDialog from "@/components/configuracion/NuevaCampaDialog";
import VehiculosCampaDialog from "@/components/configuracion/VehiculosCampaDialog";
import type { CampaAlmacenamiento } from "@/types";

const CampasAlmacenamientoTab: React.FC = () => {
  const { toast } = useToast();
  const [campas, setCampas] = useState<CampaAlmacenamiento[]>([
    {
      id: 1,
      nombre: "Campa Principal",
      direccion: "Polígono Industrial El Desguace, Nave 1",
      ubicacion_gps: "40.4168,-3.7038",
      capacidad_maxima: 50,
      estado: "activa",
      observaciones: "Campa principal para vehículos recién llegados",
      fecha_creacion: new Date(),
      vehiculos_asignados: [
        {
          id: 1,
          id_vehiculo: 1,
          vehiculo_info: { marca: "Ford", modelo: "Focus", matricula: "1234ABC" },
          fecha_asignacion: new Date(),
          estado: "almacenado"
        },
        {
          id: 2,
          id_vehiculo: 2,
          vehiculo_info: { marca: "Volkswagen", modelo: "Golf", matricula: "5678DEF" },
          fecha_asignacion: new Date(),
          estado: "en_proceso"
        }
      ]
    },
    {
      id: 2,
      nombre: "Campa Secundaria",
      direccion: "Polígono Industrial El Desguace, Nave 2",
      capacidad_maxima: 30,
      estado: "activa",
      observaciones: "Para vehículos en proceso de despiece",
      fecha_creacion: new Date(),
      vehiculos_asignados: []
    }
  ]);
  
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarNuevaCampa, setMostrarNuevaCampa] = useState(false);
  const [mostrarVehiculos, setMostrarVehiculos] = useState(false);
  const [campaSeleccionada, setCampaSeleccionada] = useState<CampaAlmacenamiento | null>(null);

  const campasFiltradas = campas.filter(campa => {
    const coincideTexto = campa.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                         campa.direccion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideEstado = !filtroEstado || campa.estado === filtroEstado;
    
    return coincideTexto && coincideEstado;
  });

  const handleCrearCampa = (nuevaCampa: Omit<CampaAlmacenamiento, 'id' | 'fecha_creacion' | 'vehiculos_asignados'>) => {
    const campa: CampaAlmacenamiento = {
      ...nuevaCampa,
      id: Math.max(0, ...campas.map(c => c.id)) + 1,
      fecha_creacion: new Date(),
      vehiculos_asignados: []
    };
    
    setCampas([...campas, campa]);
    setMostrarNuevaCampa(false);
    
    toast({
      title: "Campa creada",
      description: `La campa "${campa.nombre}" se ha creado correctamente.`
    });
  };

  const handleEditarCampa = (id: number) => {
    const campa = campas.find(c => c.id === id);
    if (campa) {
      setCampaSeleccionada(campa);
      setMostrarNuevaCampa(true);
    }
  };

  const handleEliminarCampa = (id: number) => {
    const campa = campas.find(c => c.id === id);
    if (campa) {
      if (campa.vehiculos_asignados.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "La campa tiene vehículos asignados. Muévalos primero a otra campa.",
          variant: "destructive"
        });
        return;
      }
      
      if (window.confirm(`¿Estás seguro de eliminar la campa "${campa.nombre}"?`)) {
        setCampas(campas.filter(c => c.id !== id));
        
        toast({
          title: "Campa eliminada",
          description: `La campa "${campa.nombre}" se ha eliminado correctamente.`
        });
      }
    }
  };

  const handleVerVehiculos = (campa: CampaAlmacenamiento) => {
    setCampaSeleccionada(campa);
    setMostrarVehiculos(true);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case 'inactiva':
        return <Badge variant="secondary">Inactiva</Badge>;
      case 'mantenimiento':
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getOcupacionBadge = (campa: CampaAlmacenamiento) => {
    const ocupacion = campa.vehiculos_asignados.length;
    const porcentaje = (ocupacion / campa.capacidad_maxima) * 100;
    
    let color = "bg-green-100 text-green-800";
    if (porcentaje > 80) color = "bg-red-100 text-red-800";
    else if (porcentaje > 60) color = "bg-yellow-100 text-yellow-800";
    
    return (
      <Badge className={color}>
        {ocupacion}/{campa.capacidad_maxima} ({Math.round(porcentaje)}%)
      </Badge>
    );
  };

  const columnas = [
    {
      header: "Campa",
      accessor: (campa: CampaAlmacenamiento) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {campa.nombre}
          </div>
          <div className="text-sm text-muted-foreground">
            {campa.direccion}
          </div>
        </div>
      )
    },
    {
      header: "Estado",
      accessor: (campa: CampaAlmacenamiento) => getEstadoBadge(campa.estado)
    },
    {
      header: "Ocupación",
      accessor: (campa: CampaAlmacenamiento) => getOcupacionBadge(campa)
    },
    {
      header: "Capacidad",
      accessor: (campa: CampaAlmacenamiento) => `${campa.capacidad_maxima} vehículos`
    },
    {
      header: "Acciones",
      accessor: (campa: CampaAlmacenamiento) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEditarCampa(campa.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleVerVehiculos(campa)}>
            <Car className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleEliminarCampa(campa.id)}
            disabled={campa.vehiculos_asignados.length > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const estadisticas = {
    totalCampas: campas.length,
    campasActivas: campas.filter(c => c.estado === 'activa').length,
    vehiculosTotal: campas.reduce((total, campa) => total + campa.vehiculos_asignados.length, 0),
    capacidadTotal: campas.reduce((total, campa) => total + campa.capacidad_maxima, 0)
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{estadisticas.totalCampas}</div>
                <div className="text-sm text-muted-foreground">Total Campas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{estadisticas.campasActivas}</div>
                <div className="text-sm text-muted-foreground">Campas Activas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{estadisticas.vehiculosTotal}</div>
                <div className="text-sm text-muted-foreground">Vehículos Almacenados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{estadisticas.capacidadTotal}</div>
                <div className="text-sm text-muted-foreground">Capacidad Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gestión de Campas de Almacenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o dirección..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={() => setMostrarNuevaCampa(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Campa
            </Button>
          </div>

          <DataTable
            data={campasFiltradas}
            columns={columnas}
            idField="id"
            basePath="/configuracion/campas"
            noActions={true}
          />
        </CardContent>
      </Card>

      {mostrarNuevaCampa && (
        <NuevaCampaDialog
          campa={campaSeleccionada}
          onGuardar={handleCrearCampa}
          onCerrar={() => {
            setMostrarNuevaCampa(false);
            setCampaSeleccionada(null);
          }}
        />
      )}

      {mostrarVehiculos && campaSeleccionada && (
        <VehiculosCampaDialog
          campa={campaSeleccionada}
          onCerrar={() => {
            setMostrarVehiculos(false);
            setCampaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
};

export default CampasAlmacenamientoTab;
