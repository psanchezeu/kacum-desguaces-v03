
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit, Trash2, CheckCircle, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { incidencias } from "@/data/mockData";

const IncidenciaView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // En una aplicación real, se obtendría la incidencia de una API
  const incidencia = incidencias.find(inc => inc.id === Number(id));
  
  const handleDelete = () => {
    // Aquí se implementaría la lógica para eliminar la incidencia en una API real
    toast({
      title: "Incidencia eliminada",
      description: "La incidencia ha sido eliminada correctamente.",
    });
    navigate("/incidencias");
  };

  const handleChangeStatus = (newStatus: string) => {
    // Aquí se implementaría la lógica para cambiar el estado en una API real
    toast({
      title: "Estado actualizado",
      description: `La incidencia ahora está ${newStatus === 'cerrada' ? 'cerrada' : 'en proceso'}.`,
    });
  };

  if (!incidencia) {
    return (
      <PageLayout title="Incidencia no encontrada">
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No se ha encontrado la incidencia con ID {id}
          </p>
          <button
            onClick={() => navigate("/incidencias")}
            className="mt-4 text-primary hover:underline"
          >
            Volver al listado de incidencias
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Incidencia #${incidencia.id}`}>
      <div className="mb-6 flex justify-between items-center">
        <Badge variant="outline" className={`text-base py-1 px-3 
          ${incidencia.estado === "cerrada" ? "border-green-500 text-green-500" :
           incidencia.estado === "en_proceso" ? "border-blue-500 text-blue-500" :
           incidencia.estado === "abierta" ? "border-orange-500 text-orange-500" :
           "border-gray-500 text-gray-500"}`}>
          {incidencia.estado}
        </Badge>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/incidencias/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Detalles de la Incidencia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <Badge variant={
                incidencia.tipo === "reclamacion" ? "default" :
                incidencia.tipo === "logistica" ? "secondary" :
                incidencia.tipo === "operacion" ? "outline" :
                incidencia.tipo === "seguridad" ? "destructive" :
                "outline"
              }>
                {incidencia.tipo}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Descripción</p>
              <p className="whitespace-pre-wrap">{incidencia.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de apertura</p>
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> 
                  {new Date(incidencia.fecha_apertura).toLocaleDateString('es-ES')}
                </p>
              </div>
              
              {incidencia.fecha_cierre && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de cierre</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> 
                    {new Date(incidencia.fecha_cierre).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entidad afectada</p>
                <p className="capitalize">{incidencia.entidad_tipo} #{incidencia.id_entidad_afectada}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reportada por</p>
                <p className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" /> 
                  Usuario #{incidencia.id_usuario_reporta}
                </p>
              </div>
            </div>

            {incidencia.resolucion && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolución</p>
                <p className="whitespace-pre-wrap">{incidencia.resolucion}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate(`/incidencias/${id}/seguimiento`)}
            >
              <Calendar className="mr-2 h-4 w-4" /> Ver seguimiento
            </Button>
            
            {incidencia.entidad_tipo && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/${incidencia.entidad_tipo}s/${incidencia.id_entidad_afectada}`)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Ver {incidencia.entidad_tipo} afectado
              </Button>
            )}
            
            {incidencia.estado === "abierta" && (
              <Button 
                className="w-full justify-start bg-blue-500 hover:bg-blue-600"
                onClick={() => handleChangeStatus("en_proceso")}
              >
                <User className="mr-2 h-4 w-4" /> Marcar en proceso
              </Button>
            )}
            
            {(incidencia.estado === "abierta" || incidencia.estado === "en_proceso") && (
              <Button 
                className="w-full justify-start bg-green-500 hover:bg-green-600"
                onClick={() => handleChangeStatus("cerrada")}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Marcar como resuelta
              </Button>
            )}
            
            <div className="p-4 bg-muted rounded-lg mt-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full 
                  ${incidencia.estado === "cerrada" ? "bg-green-500" :
                   incidencia.estado === "en_proceso" ? "bg-blue-500" :
                   "bg-orange-500"}`}></span>
                {incidencia.estado === "cerrada" ? "Incidencia cerrada" : 
                 incidencia.estado === "en_proceso" ? "En proceso de resolución" : 
                 "Pendiente de atención"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {incidencia.estado === "cerrada" 
                  ? "Esta incidencia ha sido resuelta satisfactoriamente." 
                  : incidencia.estado === "en_proceso" 
                  ? "Esta incidencia está siendo atendida en este momento."
                  : "Esta incidencia está pendiente de ser atendida."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default IncidenciaView;
