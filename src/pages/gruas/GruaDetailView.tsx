import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grua, MantenimientoGrua, gruasService } from '../../services/gruasService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Truck, 
  Edit, 
  Trash2, 
  Calendar, 
  Plus,
  Download,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Loader from '../../components/ui/loader';
import PageLayout from '../../components/layout/PageLayout';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';

const GruaDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grua, setGrua] = useState<Grua | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMantenimientoDialogOpen, setDeleteMantenimientoDialogOpen] = useState(false);
  const [mantenimientoToDelete, setMantenimientoToDelete] = useState<MantenimientoGrua | null>(null);

  useEffect(() => {
    const fetchGrua = async () => {
      if (!id) {
        setError('No se ha especificado un ID de grúa.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await gruasService.getById(Number(id));
        setGrua(data);
      } catch (err) {
        console.error('Error al cargar grúa:', err);
        setError('No se pudieron cargar los datos de la grúa. Por favor, inténtalo de nuevo.');
        toast.error('Error al cargar los datos de la grúa');
      } finally {
        setLoading(false);
      }
    };

    fetchGrua();
  }, [id]);

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activa': return 'bg-green-500 hover:bg-green-600';
      case 'en mantenimiento': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'inactiva': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getITVBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'vigente': return 'bg-green-500 hover:bg-green-600';
      case 'próxima a vencer': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'vencida': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const confirmDelete = () => setDeleteDialogOpen(true);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await gruasService.delete(Number(id));
      toast.success('Grúa eliminada correctamente');
      navigate('/gruas');
    } catch (error) {
      console.error('Error al eliminar grúa:', error);
      toast.error('Error al eliminar la grúa');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const confirmDeleteMantenimiento = (mantenimiento: MantenimientoGrua) => {
    setMantenimientoToDelete(mantenimiento);
    setDeleteMantenimientoDialogOpen(true);
  };

  const handleDeleteMantenimiento = async () => {
    if (!mantenimientoToDelete) return;
    try {
      await gruasService.deleteMantenimiento(mantenimientoToDelete.id);
      if (grua && grua.mantenimientos) {
        setGrua({
          ...grua,
          mantenimientos: grua.mantenimientos.filter(m => m.id !== mantenimientoToDelete.id),
        });
      }
      toast.success('Mantenimiento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      toast.error('Error al eliminar el mantenimiento');
    } finally {
      setDeleteMantenimientoDialogOpen(false);
      setMantenimientoToDelete(null);
    }
  };

  const pageActions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" onClick={() => navigate('/gruas')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      {grua && (
        <>
          <Button onClick={() => navigate(`/gruas/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </>
      )}
    </div>
  );

  return (
    <PageLayout 
      title={grua ? `Detalles de Grúa: ${grua.matricula}` : 'Detalles de Grúa'}
      actions={pageActions}
    >
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && grua && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Truck className="h-6 w-6 mr-3" />Información General</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><p className="font-semibold">Matrícula</p><p>{grua.matricula}</p></div>
                <div><p className="font-semibold">Modelo</p><p>{grua.modelo}</p></div>
                <div><p className="font-semibold">Capacidad (KG)</p><p>{grua.capacidad_kg.toLocaleString('es-ES')}</p></div>
                <div><p className="font-semibold">Conductor</p><p>{grua.conductor_asignado}</p></div>
                <div><p className="font-semibold">Kilometraje</p><p>{grua.kilometraje.toLocaleString('es-ES')} km</p></div>
                <div><p className="font-semibold">Estado</p><Badge className={getEstadoBadgeColor(grua.estado)}>{grua.estado}</Badge></div>
                <div><p className="font-semibold">Estado ITV</p><Badge className={getITVBadgeColor(grua.itv_estado)}>{grua.itv_estado}</Badge></div>
                <div><p className="font-semibold">Fecha ITV</p><p>{format(new Date(grua.itv_fecha), 'dd/MM/yyyy', { locale: es })}</p></div>
                <div><p className="font-semibold">Último Mant.</p><p>{format(new Date(grua.fecha_ultimo_mantenimiento), 'dd/MM/yyyy', { locale: es })}</p></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center"><Calendar className="h-6 w-6 mr-3" />Historial de Mantenimientos</CardTitle>
              <Button onClick={() => navigate(`/gruas/${id}/mantenimientos/nuevo`)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </CardHeader>
            <CardContent>
              {grua.mantenimientos && grua.mantenimientos.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Fecha</TableHead><TableHead>Realizado por</TableHead><TableHead>Documento</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {grua.mantenimientos.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.tipo}</TableCell>
                        <TableCell>{format(new Date(m.fecha), 'dd/MM/yyyy', { locale: es })}</TableCell>
                        <TableCell>{m.realizado_por}</TableCell>
                        <TableCell>
                          {m.url_documento ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={m.url_documento} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-1" />Ver</a>
                            </Button>
                          ) : <span className="text-muted-foreground text-sm">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => confirmDeleteMantenimiento(m)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8"><p className="text-muted-foreground">No hay registros de mantenimiento.</p></div>
              )}
            </CardContent>
          </Card>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Confirmar eliminación</DialogTitle><DialogDescription>¿Seguro que quieres eliminar la grúa {grua.matricula}? Esta acción es irreversible.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Eliminar</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteMantenimientoDialogOpen} onOpenChange={setDeleteMantenimientoDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Confirmar eliminación</DialogTitle><DialogDescription>¿Seguro que quieres eliminar este mantenimiento? Esta acción es irreversible.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteMantenimientoDialogOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDeleteMantenimiento}>Eliminar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </PageLayout>
  );
}

export default GruaDetailView;
