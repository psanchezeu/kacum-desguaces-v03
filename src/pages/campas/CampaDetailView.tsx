import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Warehouse, Edit, Trash2, ArrowLeft, Car } from 'lucide-react';

import { campasService, Campa, VehiculoCampa } from '../../services/campasService';
import { Vehiculo } from '@/types';
import PageLayout from '../../components/layout/PageLayout';
import Loader from '../../components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const CampaDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campa, setCampa] = useState<Campa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCampa = async () => {
      if (!id) {
        setError('No se ha especificado un ID de campa.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await campasService.getById(Number(id));
        setCampa(data);
      } catch (err) {
        console.error('Error al cargar la campa:', err);
        setError('No se pudieron cargar los datos de la campa.');
        toast.error('Error al cargar los datos de la campa');
      } finally {
        setLoading(false);
      }
    };

    fetchCampa();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await campasService.delete(Number(id));
      toast.success('Campa eliminada correctamente');
      navigate('/campas');
    } catch (error: any) {
      console.error('Error al eliminar la campa:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar la campa. Verifique si tiene vehículos asociados.';
      toast.error(errorMessage);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVA': return 'bg-green-500 hover:bg-green-600';
      case 'MANTENIMIENTO': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'INACTIVA': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <PageLayout title="Error">
        <div className="text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  if (!campa) return null;

  return (
    <PageLayout title={`Detalle de Campa: ${campa.nombre}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => navigate('/campas')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
            </Button>
            <div className="flex gap-2">
                <Button onClick={() => navigate(`/campas/${campa.id}/editar`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Warehouse className="h-6 w-6 mr-3" />{campa.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p className="font-semibold">Dirección</p><p>{campa.direccion || 'No especificada'}</p></div>
            <div><p className="font-semibold">Capacidad Máxima</p><p>{campa.capacidad_maxima}</p></div>
            <div><p className="font-semibold">Ocupación Actual</p><p>{campa.ocupacion_actual}</p></div>
            <div><p className="font-semibold">Estado</p><p><Badge className={getEstadoBadgeColor(campa.estado)}>{campa.estado}</Badge></p></div>
            <div><p className="font-semibold">Observaciones</p><p>{campa.observaciones || 'Ninguna'}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Car className="h-6 w-6 mr-3" />Vehículos en la Campa</CardTitle>
          </CardHeader>
          <CardContent>
            {campa.vehiculos && campa.vehiculos.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Matrícula</TableHead><TableHead>Marca</TableHead><TableHead>Modelo</TableHead><TableHead>Fecha de Entrada</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {campa.vehiculos.map((vc: VehiculoCampa) => (
                    <TableRow key={vc.id}>
                      <TableCell className="font-medium">{vc.vehiculo.matricula}</TableCell>
                      <TableCell>{vc.vehiculo.marca}</TableCell>
                      <TableCell>{vc.vehiculo.modelo}</TableCell>
                      <TableCell>{format(new Date(vc.fecha_asignacion), 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/vehiculos/${vc.vehiculo.id}`}>Ver Vehículo</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8"><p className="text-sm text-gray-600">No hay vehículos en esta campa.</p></div>
            )}
          </CardContent>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Confirmar eliminación</DialogTitle><DialogDescription>¿Seguro que quieres eliminar la campa "{campa.nombre}"? Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Eliminar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default CampaDetailView;
