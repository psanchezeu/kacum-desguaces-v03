import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

import { campasService, Campa } from '../../services/campasService';
import PageLayout from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog';
import Loader from '../../components/ui/loader';

const CampasPage: React.FC = () => {
  const [campas, setCampas] = useState<Campa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaToDelete, setCampaToDelete] = useState<Campa | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCampas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await campasService.getAll();
      setCampas(data);
      setError(null);
    } catch (err) {
      const errorMessage = 'Error al cargar las campas. Por favor, inténtelo de nuevo.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampas();
  }, [fetchCampas]);

  const handleNewCampa = () => {
    navigate('/campas/nueva');
  };

  const handleEdit = (id: number) => {
    navigate(`/campas/${id}/editar`);
  };

  const handleView = (id: number) => {
    navigate(`/campas/${id}`);
  };

  const handleDeleteClick = (campa: Campa) => {
    setCampaToDelete(campa);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaToDelete) return;

    try {
      await campasService.delete(campaToDelete.id);
      toast.success(`Campa "${campaToDelete.nombre}" eliminada correctamente.`);
      fetchCampas(); // Recargar la lista
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al eliminar la campa.';
      toast.error(errorMessage);
      console.error('Error al eliminar campa:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setCampaToDelete(null);
    }
  };

  if (loading) {
    return <Loader />; 
  }

  if (error) {
    return (
      <PageLayout title="Gestión de Campas">
        <div className="text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Gestión de Campas"
      actions={
        <Button onClick={handleNewCampa}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Campa
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Listado de Campas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead className="text-center">Capacidad Máx.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campas.length > 0 ? (
                campas.map((campa) => (
                  <TableRow key={campa.id}>
                    <TableCell className="font-medium">{campa.nombre}</TableCell>
                    <TableCell>{campa.direccion}</TableCell>
                    <TableCell className="text-center">{campa.capacidad_maxima}</TableCell>
                    <TableCell>{campa.estado}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleView(campa.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(campa.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(campa)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No hay campas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la campa "{campaToDelete?.nombre}"? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default CampasPage;
