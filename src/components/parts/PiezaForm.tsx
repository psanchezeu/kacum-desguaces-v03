
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pieza, Vehiculo } from "@/types";
import { vehiculosService } from "@/services/vehiculosService";
import { Loader2 } from "lucide-react";

const piezaSchema = z.object({
  id_vehiculo: z.number().min(1, { message: "Debes seleccionar un vehículo" }),
  tipo_pieza: z.string().min(2, { message: "El tipo de pieza es obligatorio" }),
  descripcion: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  estado: z.enum(["nueva", "usada", "dañada", "en_revision"]),
  ubicacion_almacen: z.string().min(2, { message: "La ubicación es obligatoria" }),
  codigo_qr: z.string().optional(),
  rfid: z.string().optional(),
  fecha_extraccion: z.coerce.date(),
  fecha_caducidad: z.coerce.date().optional().nullable(),
  lote: z.string().optional(),
  precio_coste: z.coerce.number().min(0, { message: "El precio de coste no puede ser negativo" }),
  precio_venta: z.coerce.number().min(0, { message: "El precio de venta no puede ser negativo" }),
  reciclable: z.boolean().default(false),
  bloqueada_venta: z.boolean().default(false),
  observaciones: z.string().optional(),
});

type PiezaFormData = z.infer<typeof piezaSchema>;

interface PiezaFormProps {
  initialData?: Pieza;
  onSubmit: (data: PiezaFormData) => void;
  isLoading?: boolean;
  vehiculoId?: number;
}

const PiezaForm: React.FC<PiezaFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  vehiculoId
}) => {
  // Garantizar que vehiculos siempre sea un array
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState<boolean>(true);
  const [errorVehiculos, setErrorVehiculos] = useState<string | null>(null);
  
  const form = useForm<PiezaFormData>({
    resolver: zodResolver(piezaSchema),
    defaultValues: initialData || {
      id_vehiculo: vehiculoId || 0,
      tipo_pieza: "",
      descripcion: "",
      estado: "usada",
      ubicacion_almacen: "Almacén principal",
      codigo_qr: "",
      rfid: "",
      fecha_extraccion: new Date(),
      fecha_caducidad: null,
      lote: "",
      precio_coste: 0,
      precio_venta: 0,
      reciclable: true,
      bloqueada_venta: false,
      observaciones: "",
    },
  });

  // Cargar vehículos desde el servicio
  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoadingVehiculos(true);
      try {
        // Solicitar todos los vehículos con un límite alto para asegurar que obtenemos todos
        const response = await vehiculosService.getAll({ page: 1, limit: 1000, count: true });
        
        // Asegurarnos de que siempre trabajamos con un array
        let vehiculosArray: Vehiculo[] = [];
        
        if (response) {
          // La estructura esperada es { data: Vehiculo[], pagination: {...} }
          if (response.data && Array.isArray(response.data)) {
            vehiculosArray = response.data;
          } 
          // Si por alguna razón response es directamente un array
          else if (Array.isArray(response)) {
            vehiculosArray = response;
          }
          // Si response tiene una estructura anidada
          else if (typeof response === 'object' && response !== null) {
            // Buscar en cualquier propiedad que pueda contener un array de vehículos
            for (const key in response) {
              if (Array.isArray(response[key])) {
                vehiculosArray = response[key];
                break;
              } else if (response[key] && typeof response[key] === 'object' && Array.isArray(response[key].data)) {
                vehiculosArray = response[key].data;
                break;
              }
            }
          }
        }
        
        // Establecer el estado con el array procesado
        setVehiculos(vehiculosArray);
        
        if (vehiculosArray.length > 0) {
          setErrorVehiculos(null);
        } else {
          console.warn('No se encontraron vehículos en la respuesta');
          setErrorVehiculos('No se encontraron vehículos');
        }
      } catch (err) {
        console.error('Error al cargar vehículos:', err);
        setErrorVehiculos('No se pudieron cargar los vehículos');
        setVehiculos([]);
      } finally {
        setLoadingVehiculos(false);
      }
    };
    
    fetchVehiculos();
  }, []);

  // Formateo de las fechas para los campos date
  useEffect(() => {
    if (initialData?.fecha_extraccion) {
      form.setValue('fecha_extraccion', new Date(initialData.fecha_extraccion));
    }
    
    if (initialData?.fecha_caducidad) {
      form.setValue('fecha_caducidad', new Date(initialData.fecha_caducidad));
    }
    
    if (vehiculoId) {
      form.setValue('id_vehiculo', vehiculoId);
    }
  }, [initialData, vehiculoId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="id_vehiculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehículo</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value !== null && field.value !== undefined && field.value !== 0 ? field.value.toString() : ""}
                  disabled={loadingVehiculos || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      {loadingVehiculos ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Cargando vehículos...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Selecciona un vehículo" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {errorVehiculos ? (
                      <div className="p-2 text-center text-red-500 text-sm">
                        {errorVehiculos}
                      </div>
                    ) : vehiculos.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        No hay vehículos disponibles
                      </div>
                    ) : (
                      vehiculos.map((vehiculo: Vehiculo) => (
                        <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                          {vehiculo.marca} {vehiculo.modelo} ({vehiculo.matricula})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo_pieza"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pieza</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Motor">Motor</SelectItem>
                    <SelectItem value="Caja de cambios">Caja de cambios</SelectItem>
                    <SelectItem value="Suspensión">Suspensión</SelectItem>
                    <SelectItem value="Frenos">Frenos</SelectItem>
                    <SelectItem value="Carrocería">Carrocería</SelectItem>
                    <SelectItem value="Eléctrica">Eléctrica</SelectItem>
                    <SelectItem value="Interior">Interior</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción detallada de la pieza" {...field} />
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="nueva">Nueva</SelectItem>
                    <SelectItem value="usada">Usada</SelectItem>
                    <SelectItem value="dañada">Dañada</SelectItem>
                    <SelectItem value="en_revision">En revisión</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ubicacion_almacen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación en Almacén</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona ubicación" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Almacén principal">Almacén principal</SelectItem>
                    <SelectItem value="Almacén secundario">Almacén secundario</SelectItem>
                    <SelectItem value="Estantería A">Estantería A</SelectItem>
                    <SelectItem value="Estantería B">Estantería B</SelectItem>
                    <SelectItem value="Estantería C">Estantería C</SelectItem>
                    <SelectItem value="Zona exterior">Zona exterior</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo_qr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código QR</FormLabel>
                <FormControl>
                  <Input placeholder="Código QR (opcional)" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rfid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFID</FormLabel>
                <FormControl>
                  <Input placeholder="RFID (opcional)" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_extraccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Extracción</FormLabel>
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
            name="fecha_caducidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Caducidad</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Solo para componentes con caducidad
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lote</FormLabel>
                <FormControl>
                  <Input placeholder="Número de lote (opcional)" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio_coste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Coste (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio_venta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Venta (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="reciclable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Reciclable
                    </FormLabel>
                    <FormDescription>
                      La pieza puede ser reciclada
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bloqueada_venta"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Bloquear Venta
                    </FormLabel>
                    <FormDescription>
                      La pieza no puede ser vendida
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones sobre la pieza" 
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
            {isLoading ? "Guardando..." : initialData ? "Actualizar Pieza" : "Registrar Pieza"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PiezaForm;
