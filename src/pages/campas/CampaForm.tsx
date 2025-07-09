import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { CampaFormData } from '../../services/campasService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// Definir el esquema de validación con Zod
const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  ubicacion_gps: z.string().optional(),
  capacidad_maxima: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive('La capacidad máxima debe ser un número positivo')
  ),
  estado: z.string().min(1, 'El estado es obligatorio'),
  observaciones: z.string().optional(),
});

interface CampaFormProps {
  onSubmit: (data: CampaFormData) => void;
  initialData?: CampaFormData;
  isSubmitting: boolean;
}

const CampaForm: React.FC<CampaFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CampaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nombre: '',
      direccion: '',
      ubicacion_gps: '',
      capacidad_maxima: 0,
      estado: 'activa',
      observaciones: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Campa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register('nombre')} />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...register('direccion')} />
              {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>}
            </div>
            <div>
              <Label htmlFor="capacidad_maxima">Capacidad Máxima</Label>
              <Input id="capacidad_maxima" type="number" {...register('capacidad_maxima')} />
              {errors.capacidad_maxima && <p className="text-red-500 text-sm mt-1">{errors.capacidad_maxima.message}</p>}
            </div>
             <div>
              <Label htmlFor="estado">Estado</Label>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activa">Activa</SelectItem>
                      <SelectItem value="inactiva">Inactiva</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="ubicacion_gps">Ubicación GPS (Lat, Lon)</Label>
              <Input id="ubicacion_gps" {...register('ubicacion_gps')} />
              {errors.ubicacion_gps && <p className="text-red-500 text-sm mt-1">{errors.ubicacion_gps.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" {...register('observaciones')} />
              {errors.observaciones && <p className="text-red-500 text-sm mt-1">{errors.observaciones.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default CampaForm;
