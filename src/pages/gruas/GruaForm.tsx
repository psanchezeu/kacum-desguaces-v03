import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GruaFormData, gruasService } from '../../services/gruasService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GruaFormProps {
  initialData?: GruaFormData;
  isEditing?: boolean;
  onSuccess?: (data: GruaFormData) => void;
}

const defaultFormData: GruaFormData = {
  matricula: '',
  modelo: '',
  capacidad_kg: 0,
  conductor_asignado: '',
  estado: 'Activa',
  gps_ultimo_punto: '',
  fecha_ultimo_mantenimiento: format(new Date(), 'yyyy-MM-dd'),
  kilometraje: 0,
  itv_estado: 'Vigente',
  itv_fecha: format(new Date(), 'yyyy-MM-dd')
};

const GruaForm: React.FC<GruaFormProps> = ({ 
  initialData = defaultFormData, 
  isEditing = false,
  onSuccess
}) => {
  const [formData, setFormData] = useState<GruaFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Asegurarse de que formData se actualiza cuando cambia initialData
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // Si estamos en modo edición, onSuccess se encargará de la actualización
        if (onSuccess) {
          onSuccess(formData);
        } else {
          // Fallback por si no hay onSuccess
          await gruasService.create(formData);
          toast.success('Grúa actualizada correctamente');
          navigate('/gruas');
        }
      } else {
        // Crear nueva grúa
        await gruasService.create(formData);
        toast.success('Grúa creada correctamente');
        navigate('/gruas');
      }
    } catch (error: any) {
      console.error('Error al guardar grúa:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al guardar la grúa');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Grúa' : 'Nueva Grúa'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula *</Label>
              <Input
                id="matricula"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                placeholder="Ej: 1234ABC"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Ej: Mercedes Actros"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacidad_kg">Capacidad (kg) *</Label>
              <Input
                id="capacidad_kg"
                name="capacidad_kg"
                type="number"
                value={formData.capacidad_kg}
                onChange={handleChange}
                min={0}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conductor_asignado">Conductor Asignado *</Label>
              <Input
                id="conductor_asignado"
                name="conductor_asignado"
                value={formData.conductor_asignado}
                onChange={handleChange}
                placeholder="Nombre del conductor"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleSelectChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activa">Activa</SelectItem>
                  <SelectItem value="En mantenimiento">En mantenimiento</SelectItem>
                  <SelectItem value="Inactiva">Inactiva</SelectItem>
                  <SelectItem value="En servicio">En servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kilometraje">Kilometraje *</Label>
              <Input
                id="kilometraje"
                name="kilometraje"
                type="number"
                value={formData.kilometraje}
                onChange={handleChange}
                min={0}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gps_ultimo_punto">Ubicación GPS</Label>
              <Input
                id="gps_ultimo_punto"
                name="gps_ultimo_punto"
                value={formData.gps_ultimo_punto || ''}
                onChange={handleChange}
                placeholder="Coordenadas GPS (opcional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha_ultimo_mantenimiento">Fecha Último Mantenimiento *</Label>
              <Input
                id="fecha_ultimo_mantenimiento"
                name="fecha_ultimo_mantenimiento"
                type="date"
                value={formData.fecha_ultimo_mantenimiento}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itv_estado">Estado ITV *</Label>
              <Select
                value={formData.itv_estado}
                onValueChange={(value) => handleSelectChange('itv_estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vigente">Vigente</SelectItem>
                  <SelectItem value="Próxima a vencer">Próxima a vencer</SelectItem>
                  <SelectItem value="Vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itv_fecha">Fecha ITV *</Label>
              <Input
                id="itv_fecha"
                name="itv_fecha"
                type="date"
                value={formData.itv_fecha}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/gruas')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GruaForm;
