
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Incidencia } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { incidencias } from "@/data/mockData";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const IncidenciasPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTipos, setFilteredTipos] = useState<string[]>([]);
  const [filteredEstados, setFilteredEstados] = useState<string[]>([]);
  
  const tiposIncidencias = ["reclamacion", "logistica", "operacion", "seguridad", "otro"];
  const estadosIncidencias = ["abierta", "en_proceso", "cerrada"];
  
  const handleToggleTipo = (tipo: string) => {
    setFilteredTipos(prev => 
      prev.includes(tipo) 
        ? prev.filter(t => t !== tipo) 
        : [...prev, tipo]
    );
  };
  
  const handleToggleEstado = (estado: string) => {
    setFilteredEstados(prev => 
      prev.includes(estado) 
        ? prev.filter(e => e !== estado) 
        : [...prev, estado]
    );
  };
  
  const filteredIncidencias = incidencias.filter(incidencia => {
    const searchMatch = 
      searchTerm === "" || 
      incidencia.id.toString().includes(searchTerm) ||
      incidencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const tipoMatch = filteredTipos.length === 0 || filteredTipos.includes(incidencia.tipo);
    const estadoMatch = filteredEstados.length === 0 || filteredEstados.includes(incidencia.estado);
    
    return searchMatch && tipoMatch && estadoMatch;
  });

  const columns = [
    {
      header: "ID",
      accessor: (incidencia: Incidencia) => incidencia.id.toString()
    },
    {
      header: "Tipo",
      accessor: (incidencia: Incidencia) => incidencia.tipo,
      render: (incidencia: Incidencia) => (
        <Badge variant={
          incidencia.tipo === "reclamacion" ? "default" :
          incidencia.tipo === "logistica" ? "secondary" :
          incidencia.tipo === "operacion" ? "outline" :
          incidencia.tipo === "seguridad" ? "destructive" :
          "outline"
        }>
          {incidencia.tipo}
        </Badge>
      )
    },
    {
      header: "Descripción",
      accessor: (incidencia: Incidencia) => incidencia.descripcion,
      render: (incidencia: Incidencia) => (
        <div className="max-w-md truncate">
          {incidencia.descripcion}
        </div>
      )
    },
    {
      header: "Entidad",
      accessor: (incidencia: Incidencia) => 
        incidencia.entidad_tipo ? `${incidencia.entidad_tipo} #${incidencia.id_entidad_afectada}` : "N/A"
    },
    {
      header: "Estado",
      accessor: (incidencia: Incidencia) => incidencia.estado,
      render: (incidencia: Incidencia) => (
        <Badge variant="outline" className={
          incidencia.estado === "cerrada" ? "border-green-500 text-green-500" :
          incidencia.estado === "en_proceso" ? "border-blue-500 text-blue-500" :
          incidencia.estado === "abierta" ? "border-orange-500 text-orange-500" :
          "border-gray-500 text-gray-500"
        }>
          {incidencia.estado}
        </Badge>
      )
    },
    {
      header: "Fecha",
      accessor: (incidencia: Incidencia) => new Date(incidencia.fecha_apertura).toLocaleDateString('es-ES')
    },
  ];

  const handleDelete = (id: number) => {
    toast({
      title: "Incidencia eliminada",
      description: `La incidencia con ID ${id} ha sido eliminada correctamente.`,
    });
  };

  return (
    <PageLayout title="Gestión de Incidencias">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <p className="text-muted-foreground">
            Administra y realiza seguimiento de incidencias
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar incidencias..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto gap-2">
                <Filter className="h-4 w-4" /> 
                Filtrar Tipo
                {filteredTipos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-6 px-2">
                    {filteredTipos.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {tiposIncidencias.map((tipo) => (
                <DropdownMenuCheckboxItem
                  key={tipo}
                  checked={filteredTipos.includes(tipo)}
                  onCheckedChange={() => handleToggleTipo(tipo)}
                >
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto gap-2">
                <Filter className="h-4 w-4" /> 
                Filtrar Estado
                {filteredEstados.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-6 px-2">
                    {filteredEstados.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {estadosIncidencias.map((estado) => (
                <DropdownMenuCheckboxItem
                  key={estado}
                  checked={filteredEstados.includes(estado)}
                  onCheckedChange={() => handleToggleEstado(estado)}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => navigate("/incidencias/nuevo")}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Incidencia
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredIncidencias}
        columns={columns}
        idField="id"
        basePath="/incidencias"
        onDelete={handleDelete}
      />
    </PageLayout>
  );
};

export default IncidenciasPage;
