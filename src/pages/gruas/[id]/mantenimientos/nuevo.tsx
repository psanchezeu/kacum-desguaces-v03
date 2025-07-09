import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grua, MantenimientoFormData, gruasService } from '../../../../services/gruasService';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../../../components/ui/card';
import PageLayout from '../../../../components/layout/PageLayout';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, FileText } from 'lucide-react';

// Importar el componente Loader con ruta relativa
import Loader from '../../../../components/ui/loader';

const NuevoMantenimientoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grua, setGrua] = useState<Grua | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<MantenimientoFormData>({
    tipo: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    realizado_por: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchGrua = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await gruasService.getById(Number(id));
        setGrua(data);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData.tipo || !formData.fecha || !formData.realizado_por) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const dataToSubmit: MantenimientoFormData = {
        ...formData,
        documento: selectedFile || undefined
      };
      
      await gruasService.createMantenimiento(Number(id), dataToSubmit);
      toast.success('Mantenimiento registrado correctamente');
      navigate(`/gruas/${id}`);
    } catch (error) {
      console.error('Error al registrar mantenimiento:', error);
      toast.error('Error al registrar el mantenimiento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Nuevo Mantenimiento">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (!grua) {
    return (
      <PageLayout title="Grúa no encontrada">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Grúa no encontrada</h1>
          <p className="text-muted-foreground mt-2">
            No se encontró la grúa solicitada
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/gruas')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Nuevo Mantenimiento" 
      actions={(
        <Button 
          variant="outline" 
          onClick={() => navigate(`/gruas/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      )}
    >

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" />
            Registro de Mantenimiento
          </CardTitle>
          <CardDescription>
            Completa todos los campos requeridos (*)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Mantenimiento *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => handleSelectChange('tipo', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventivo">Preventivo</SelectItem>
                    <SelectItem value="Correctivo">Correctivo</SelectItem>
                    <SelectItem value="Revisión">Revisión</SelectItem>
                    <SelectItem value="ITV">ITV</SelectItem>
                    <SelectItem value="Cambio de aceite">Cambio de aceite</SelectItem>
                    <SelectItem value="Neumáticos">Neumáticos</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="realizado_por">Realizado por *</Label>
                <Input
                  id="realizado_por"
                  name="realizado_por"
                  value={formData.realizado_por}
                  onChange={handleChange}
                  placeholder="Nombre del técnico o empresa"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (opcional)</Label>
                <Input
                  id="documento"
                  name="documento"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-muted-foreground">
                  Formatos permitidos: PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/gruas/${id}`)}
              disabled={submitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Mantenimiento'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageLayout>
  );
};

export default NuevoMantenimientoPage;
