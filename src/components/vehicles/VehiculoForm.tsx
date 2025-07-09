
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehiculo, Cliente } from "@/types";
import { clientesService } from "@/services/clientesService";
import { campasService, Campa } from "@/services/campasService";
import { Loader2 } from "lucide-react";

const vehiculoSchema = z.object({
  id_cliente: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().optional().nullable()
  ),
  marca: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres" }),
  modelo: z.string().min(1, { message: "El modelo es obligatorio" }),
  version: z.string().optional().nullable().transform(e => e === '' ? null : e),
  anio_fabricacion: z.coerce.number().min(1900, { message: "El año debe ser posterior a 1900" }),
  color: z.string().min(2, { message: "El color es obligatorio" }),
  matricula: z.string().min(5, { message: "La matrícula es obligatoria" }),
  vin: z.string().optional().nullable().transform(e => e === '' ? null : e),
  tipo_combustible: z.string().min(1, { message: "El tipo de combustible es obligatorio" }),
  kilometros: z.coerce.number().min(0, { message: "Los kilómetros no pueden ser negativos" }),
  fecha_matriculacion: z.coerce.date(),
  estado: z.string().min(1, { message: "El estado es obligatorio" }),
  ubicacion_actual: z.string().min(1, { message: "La ubicación es obligatoria" }),
  ubicacion_gps: z.string().optional().nullable().transform(e => e === '' ? null : e),
  observaciones: z.string().optional().nullable().transform(e => e === '' ? null : e),
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoFormProps {
  initialData?: Vehiculo;
  onSubmit: (data: VehiculoFormData) => void;
  isLoading?: boolean;
}

const VehiculoForm: React.FC<VehiculoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [campas, setCampas] = useState<Campa[]>([]);
  const [loadingCampas, setLoadingCampas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: initialData || {
      id_cliente: undefined,
      marca: "",
      modelo: "",
      version: "",
      anio_fabricacion: new Date().getFullYear(),
      color: "",
      matricula: "",
      vin: "",
      tipo_combustible: "",
      kilometros: 0,
      fecha_matriculacion: new Date(),
      estado: "activo",
      ubicacion_actual: "Campa principal",
      ubicacion_gps: "",
      observaciones: "",
    },
  });

  // Cargar clientes desde el backend
  useEffect(() => {
    const fetchClientes = async () => {
      setLoadingClientes(true);
      try {
        const data = await clientesService.getAll();
        setClientes(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('Error al cargar los clientes. Por favor, inténtalo de nuevo.');
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);

  // Cargar campas desde el backend
  useEffect(() => {
    const fetchCampas = async () => {
      setLoadingCampas(true);
      try {
        const data = await campasService.getAll();
        setCampas(data);
      } catch (err) {
        console.error('Error al cargar campas:', err);
        // No es un error fatal, el campo puede quedar vacío o mostrar un mensaje
      } finally {
        setLoadingCampas(false);
      }
    };

    fetchCampas();
  }, []);

  // Formateo de la fecha para el campo de fecha de matriculación
  useEffect(() => {
    if (initialData?.fecha_matriculacion) {
      form.setValue('fecha_matriculacion', new Date(initialData.fecha_matriculacion));
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="id_cliente"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Cliente</FormLabel>
                {loadingClientes ? (
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cargando clientes...</span>
                  </div>
                ) : error ? (
                  <div className="text-sm text-red-500 p-2 border border-red-200 rounded-md">
                    {error}
                  </div>
                ) : (
                  <Combobox
                    options={[
                      { value: '0', label: 'Sin cliente asignado' },
                      ...clientes.map((cliente) => ({
                        value: cliente.id.toString(),
                        label: `${cliente.nombre} ${cliente.apellidos || ''} ${cliente.tipo_cliente === 'empresa' ? `(${cliente.razon_social})` : ''}`.trim(),
                      })),
                    ]}
                    value={field.value ? field.value.toString() : '0'}
                    onChange={(value) => {
                      field.onChange(value === '0' ? undefined : Number(value));
                    }}
                    placeholder="Selecciona un cliente..."
                    searchPlaceholder="Buscar cliente..."
                    emptyPlaceholder="No se encontraron clientes."
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Marca del vehículo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Modelo del vehículo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versión</FormLabel>
                <FormControl>
                  <Input placeholder="Versión (opcional)" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="anio_fabricacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año de Fabricación</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Color del vehículo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="matricula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="Matrícula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número VIN</FormLabel>
                <FormControl>
                  <Input placeholder="Número de bastidor (VIN)" {...field} maxLength={17} />
                </FormControl>
                <FormDescription>
                  El VIN debe tener exactamente 17 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo_combustible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Combustible</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="diesel">Diésel</SelectItem>
                    <SelectItem value="electrico">Eléctrico</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                    <SelectItem value="gas">Gas (GNC/GLP)</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kilometros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilómetros</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_matriculacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Matriculación</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="procesando">En procesamiento</SelectItem>
                    <SelectItem value="desguazado">Desguazado</SelectItem>
                    <SelectItem value="baja">Dado de baja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ubicacion_actual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación Actual</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingCampas}>
                  <FormControl>
                    <SelectTrigger>
                      {loadingCampas ? (
                        <span className="text-muted-foreground">Cargando campas...</span>
                      ) : (
                        <SelectValue placeholder="Selecciona una campa" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {campas.map((campa) => (
                      <SelectItem key={campa.id} value={campa.nombre}>
                        {campa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ubicacion_gps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación GPS</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Coordenadas GPS (opcional)" 
                    {...field} 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormDescription>
                  Formato: 00.000000, 00.000000
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones sobre el vehículo" 
                      className="resize-none min-h-[100px]" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar Vehículo" : "Registrar Vehículo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VehiculoForm;
