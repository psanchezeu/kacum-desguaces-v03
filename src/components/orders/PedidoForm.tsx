
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pedido, Cliente, Pieza } from "@/types";
import { clientes, piezas } from "@/data/mockData";

const pedidoSchema = z.object({
  id_cliente: z.number().min(1, { message: "Debes seleccionar un cliente" }),
  id_pieza: z.number().min(1, { message: "Debes seleccionar una pieza" }),
  tipo_venta: z.enum(["online", "presencial"]),
  fecha_pedido: z.coerce.date(),
  estado: z.enum(["pendiente", "pagado", "enviado", "entregado", "cancelado", "devuelto"]),
  metodo_pago: z.string().min(1, { message: "El método de pago es obligatorio" }),
  direccion_envio: z.string().min(5, { message: "La dirección de envío es obligatoria" }),
  empresa_envio: z.string().min(2, { message: "La empresa de envío es obligatoria" }),
  total: z.coerce.number().min(0, { message: "El total no puede ser negativo" }),
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

interface PedidoFormProps {
  initialData?: Pedido;
  onSubmit: (data: PedidoFormData) => void;
  isLoading?: boolean;
  clienteId?: number;
  piezaId?: number;
}

const PedidoForm: React.FC<PedidoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  clienteId,
  piezaId
}) => {
  const [selectedPiezaId, setSelectedPiezaId] = useState<number | null>(
    piezaId || (initialData?.id_pieza) || null
  );
  
  const selectedPieza = selectedPiezaId 
    ? piezas.find(p => p.id === selectedPiezaId)
    : null;

  const form = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: initialData || {
      id_cliente: clienteId || 0,
      id_pieza: piezaId || 0,
      tipo_venta: "presencial",
      fecha_pedido: new Date(),
      estado: "pendiente",
      metodo_pago: "efectivo",
      direccion_envio: "",
      empresa_envio: "Recogida en tienda",
      total: selectedPieza?.precio_venta || 0,
    },
  });

  // Actualizar el precio total cuando se cambia la pieza seleccionada
  useEffect(() => {
    if (selectedPieza) {
      form.setValue('total', selectedPieza.precio_venta);
    }
  }, [selectedPieza]);

  // Formateo de la fecha para el campo fecha de pedido
  useEffect(() => {
    if (initialData?.fecha_pedido) {
      form.setValue('fecha_pedido', new Date(initialData.fecha_pedido));
    }
    
    if (clienteId) {
      form.setValue('id_cliente', clienteId);
    }
    
    if (piezaId) {
      form.setValue('id_pieza', piezaId);
    }
  }, [initialData, clienteId, piezaId]);

  // Filtrar solo las piezas disponibles (no bloqueadas para venta)
  const piezasDisponibles = piezas.filter(p => !p.bloqueada_venta);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="id_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value ? field.value.toString() : ""}
                  disabled={!!clienteId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes.map((cliente: Cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nombre} {cliente.apellidos} {cliente.tipo_cliente === 'empresa' && `(${cliente.razon_social})`}
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
            name="id_pieza"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pieza</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    const pieceId = parseInt(value);
                    field.onChange(pieceId);
                    setSelectedPiezaId(pieceId);
                  }} 
                  value={field.value ? field.value.toString() : ""}
                  disabled={!!piezaId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una pieza" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {piezasDisponibles.map((pieza: Pieza) => (
                      <SelectItem key={pieza.id} value={pieza.id.toString()}>
                        {pieza.tipo_pieza} - {pieza.descripcion} ({pieza.precio_venta.toFixed(2)} €)
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
            name="tipo_venta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Venta</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de venta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_pedido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Pedido</FormLabel>
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
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="devuelto">Devuelto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metodo_pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pago</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="financiado">Financiado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="empresa_envio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa de Envío</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona empresa de envío" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Recogida en tienda">Recogida en tienda</SelectItem>
                    <SelectItem value="SEUR">SEUR</SelectItem>
                    <SelectItem value="MRW">MRW</SelectItem>
                    <SelectItem value="Correos Express">Correos Express</SelectItem>
                    <SelectItem value="GLS">GLS</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="direccion_envio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Envío</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Dirección completa de envío"
                    className="resize-none min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                {selectedPieza && (
                  <FormDescription>
                    Precio base de la pieza: {selectedPieza.precio_venta.toFixed(2)} €
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar Pedido" : "Crear Pedido"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PedidoForm;
