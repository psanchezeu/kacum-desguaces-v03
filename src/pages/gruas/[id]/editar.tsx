import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GruaForm from '../GruaForm';
import { Grua, GruaFormData, gruasService } from '../../../services/gruasService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import PageLayout from '../../../components/layout/PageLayout';
import { Truck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Importar el componente Loader con ruta relativa
import Loader from '../../../components/ui/loader';

const EditarGruaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grua, setGrua] = useState<Grua | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<GruaFormData | null>(null);

  useEffect(() => {
    const fetchGrua = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await gruasService.getById(Number(id));
        setGrua(data);
        
        // Preparar datos para el formulario
        setFormData({
          matricula: data.matricula,
          modelo: data.modelo,
          capacidad_kg: data.capacidad_kg,
          conductor_asignado: data.conductor_asignado,
          estado: data.estado,
          gps_ultimo_punto: data.gps_ultimo_punto || '',
          fecha_ultimo_mantenimiento: format(new Date(data.fecha_ultimo_mantenimiento), 'yyyy-MM-dd'),
          kilometraje: data.kilometraje,
          itv_estado: data.itv_estado,
          itv_fecha: format(new Date(data.itv_fecha), 'yyyy-MM-dd')
        });
      } catch (error) {
        console.error('Error al cargar grúa:', error);
        toast.error('Error al cargar los datos de la grúa');
        navigate('/gruas');
      } finally {
        setLoading(false);
      }
    };

    fetchGrua();
  }, [id, navigate]);

  const handleSubmit = async (data: GruaFormData) => {
    try {
      if (id && grua) {
        await gruasService.update(Number(id), data);
        toast.success('Grúa actualizada correctamente');
        navigate('/gruas');
      }
    } catch (error) {
      console.error('Error al actualizar grúa:', error);
      toast.error('Error al actualizar la grúa');
    }
  };

  if (loading) {
    return (
      <PageLayout title="Editar Grúa">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (!grua || !formData) {
    return (
      <PageLayout title="Grúa no encontrada">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Grúa no encontrada</h1>
          <p className="text-muted-foreground mt-2">
            No se encontró la grúa solicitada
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Editar Grúa">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2" />
            Editar Grúa
          </CardTitle>
          <CardDescription>
            Modifica los campos necesarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GruaForm 
            initialData={formData} 
            isEditing={true} 
            onSuccess={handleSubmit}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EditarGruaPage;
