
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { incidencias } from '@/data/mockData';

// Mock data for seguimiento (tracking)
const mockSeguimiento = [
  {
    id: 1,
    id_incidencia: 1,
    fecha: '2025-05-15T10:30:00',
    usuario: 'Carlos García',
    accion: 'Apertura de incidencia',
    comentario: 'Cliente reporta problema con una pieza entregada que no corresponde a su pedido.'
  },
  {
    id: 2,
    id_incidencia: 1,
    fecha: '2025-05-15T11:45:00',
    usuario: 'Laura Pérez',
    accion: 'Asignación',
    comentario: 'Asignada al departamento de logística para verificación.'
  },
  {
    id: 3,
    id_incidencia: 1,
    fecha: '2025-05-16T09:15:00',
    usuario: 'Miguel Sánchez',
    accion: 'Actualización',
    comentario: 'Se ha verificado el pedido y efectivamente se envió una pieza incorrecta. Se procede a preparar la pieza correcta para envío.'
  },
  {
    id: 4,
    id_incidencia: 1,
    fecha: '2025-05-17T14:20:00',
    usuario: 'David Romero',
    accion: 'Actualización',
    comentario: 'Pieza correcta enviada por servicio express. Se ha notificado al cliente.'
  },
  {
    id: 5,
    id_incidencia: 1,
    fecha: '2025-05-18T16:00:00',
    usuario: 'Carlos García',
    accion: 'Cierre',
    comentario: 'Cliente confirma recepción de la pieza correcta. Incidencia resuelta satisfactoriamente.'
  }
];

const IncidenciaSeguimientoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // En una aplicación real, se obtendría la incidencia de una API
  const incidencia = incidencias.find(inc => inc.id === Number(id));
  
  // Filtrar el seguimiento correspondiente a esta incidencia
  const seguimiento = mockSeguimiento.filter(seg => seg.id_incidencia === Number(id));

  if (!incidencia) {
    return (
      <PageLayout title="Incidencia no encontrada">
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No se ha encontrado la incidencia con ID {id}
          </p>
          <Button
            onClick={() => navigate("/incidencias")}
            variant="link"
            className="mt-4"
          >
            Volver al listado de incidencias
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Seguimiento de Incidencia #${id}`}>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(`/incidencias/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la incidencia
        </Button>
      </div>

      <div className="space-y-8">
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-medium">Descripción de la incidencia:</p>
          <p className="text-muted-foreground mt-1">{incidencia.descripcion}</p>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {seguimiento.length > 0 ? (
            <div className="space-y-6">
              {seguimiento.map((item, index) => (
                <div key={item.id} className="relative pl-14">
                  <span className="absolute left-4 top-2 w-4 h-4 rounded-full bg-primary"></span>
                  
                  <Card className={index === 0 ? "border-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                        <p className="font-bold">{item.accion}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.fecha).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <p className="text-sm mb-2">{item.comentario}</p>
                      <p className="text-xs text-muted-foreground">
                        Por: {item.usuario}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay registros de seguimiento disponibles.</p>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Añadir nuevo seguimiento</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="comentario" className="block text-sm font-medium mb-1">
                  Comentario
                </label>
                <textarea
                  id="comentario"
                  className="resize-none w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Escribe un comentario sobre esta incidencia..."
                ></textarea>
              </div>
              <Button>Añadir seguimiento</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default IncidenciaSeguimientoPage;
