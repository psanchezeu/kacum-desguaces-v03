
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Incidencia } from "@/types";

const incidenciaSchema = z.object({
  tipo: z.enum(["reclamacion", "logistica", "operacion", "seguridad", "otro"]),
  descripcion: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  id_usuario_reporta: z.number(),
  id_entidad_afectada: z.number().optional(),
  entidad_tipo: z.enum(["pieza", "pedido", "vehiculo", "usuario", "grua"]).optional(),
  estado: z.enum(["abierta", "en_proceso", "cerrada"]),
  fecha_apertura: z.coerce.date(),
  fecha_cierre: z.coerce.date().optional().nullable(),
  resolucion: z.string().optional(),
});

type IncidenciaFormData = z.infer<typeof incidenciaSchema>;

interface IncidenciaFormProps {
  initialData?: Incidencia;
  onSubmit: (data: IncidenciaFormData) => void;
  isLoading?: boolean;
}

const IncidenciaForm: React.FC<IncidenciaFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<IncidenciaFormData>({
    resolver: zodResolver(incidenciaSchema),
    defaultValues: initialData || {
      tipo: "operacion",
      descripcion: "",
      id_usuario_reporta: 1, // Usuario actual en un entorno real
      id_entidad_afectada: undefined,
      entidad_tipo: undefined,
      estado: "abierta",
      fecha_apertura: new Date(),
      fecha_cierre: null,
      resolucion: "",
    },
  });

  const showResolucion = form.watch("estado") === "cerrada";

  // Formateo de las fechas para los campos date
  React.useEffect(() => {
    if (initialData?.fecha_apertura) {
      form.setValue('fecha_apertura', new Date(initialData.fecha_apertura));
    }
    
    if (initialData?.fecha_cierre) {
      form.setValue('fecha_cierre', new Date(initialData.fecha_cierre));
    }
  }, [initialData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Incidencia</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reclamacion">Reclamación</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                    <SelectItem value="operacion">Operación</SelectItem>
                    <SelectItem value="seguridad">Seguridad</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="abierta">Abierta</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_apertura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Apertura</FormLabel>
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

          {showResolucion && (
            <FormField
              control={form.control}
              name="fecha_cierre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Cierre</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="entidad_tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Entidad Afectada</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de entidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pieza">Pieza</SelectItem>
                    <SelectItem value="pedido">Pedido</SelectItem>
                    <SelectItem value="vehiculo">Vehículo</SelectItem>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="grua">Grúa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_entidad_afectada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de Entidad Afectada</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="ID de la entidad afectada" 
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe detalladamente la incidencia" 
                      className="resize-none min-h-[120px]" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showResolucion && (
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="resolucion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolución</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalle de cómo se ha resuelto la incidencia" 
                        className="resize-none min-h-[120px]" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar Incidencia" : "Crear Incidencia"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IncidenciaForm;
