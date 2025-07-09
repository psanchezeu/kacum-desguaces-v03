
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { piezas, pedidos, vehiculos, clientes, incidencias } from "@/data/mockData";

const EstadisticasPage: React.FC = () => {
  // Datos para el gráfico de barras de piezas por estado
  const piezasPorEstado = [
    { name: "Nueva", value: piezas.filter(p => p.estado === "nueva").length },
    { name: "Usada", value: piezas.filter(p => p.estado === "usada").length },
    { name: "Dañada", value: piezas.filter(p => p.estado === "dañada").length },
    { name: "En Revisión", value: piezas.filter(p => p.estado === "en_revision").length },
  ];

  // Datos para el gráfico de barras de pedidos por estado
  const pedidosPorEstado = [
    { name: "Pendiente", value: pedidos.filter(p => p.estado === "pendiente").length },
    { name: "Pagado", value: pedidos.filter(p => p.estado === "pagado").length },
    { name: "Enviado", value: pedidos.filter(p => p.estado === "enviado").length },
    { name: "Entregado", value: pedidos.filter(p => p.estado === "entregado").length },
    { name: "Cancelado", value: pedidos.filter(p => p.estado === "cancelado").length },
    { name: "Devuelto", value: pedidos.filter(p => p.estado === "devuelto").length },
  ];

  // Datos para el gráfico de incidencias por tipo
  const incidenciasPorTipo = [
    { name: "Reclamación", value: incidencias.filter(i => i.tipo === "reclamacion").length },
    { name: "Logística", value: incidencias.filter(i => i.tipo === "logistica").length },
    { name: "Operación", value: incidencias.filter(i => i.tipo === "operacion").length },
    { name: "Seguridad", value: incidencias.filter(i => i.tipo === "seguridad").length },
    { name: "Otro", value: incidencias.filter(i => i.tipo === "otro").length },
  ];

  // Datos para el gráfico circular de tipos de clientes
  const clientesPorTipo = [
    { name: "Particular", value: clientes.filter(c => c.tipo_cliente === "particular").length },
    { name: "Empresa", value: clientes.filter(c => c.tipo_cliente === "empresa").length },
  ];

  // Colores para los gráficos
  const COLORS = ["#3b82f6", "#f97316", "#ef4444", "#a855f7", "#22c55e", "#f59e0b"];
  const PIE_COLORS = ["#3b82f6", "#f97316"];

  // Ventas mensuales (simuladas para demostración)
  const ventasMensuales = [
    { month: "Ene", ventas: 12500 },
    { month: "Feb", ventas: 15000 },
    { month: "Mar", ventas: 18000 },
    { month: "Abr", ventas: 16000 },
    { month: "May", ventas: 21000 },
    { month: "Jun", ventas: 19500 },
    { month: "Jul", ventas: 22000 },
    { month: "Ago", ventas: 24500 },
    { month: "Sep", ventas: 26000 },
    { month: "Oct", ventas: 28000 },
    { month: "Nov", ventas: 27000 },
    { month: "Dic", ventas: 29000 },
  ];

  return (
    <PageLayout title="Estadísticas">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas mensuales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} €`} />
                  <Legend />
                  <Bar dataKey="ventas" fill="#3b82f6" name="Ventas (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Piezas por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Piezas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={piezasPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total piezas</p>
                <p className="text-2xl font-bold">{piezas.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valor total</p>
                <p className="text-2xl font-bold">
                  {piezas.reduce((sum, pieza) => sum + pieza.precio_venta, 0).toLocaleString()} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pedidos por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pedidosPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Cantidad">
                    {pedidosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total pedidos</p>
                <p className="text-2xl font-bold">{pedidos.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Ingresos totales</p>
                <p className="text-2xl font-bold">
                  {pedidos.reduce((sum, pedido) => sum + pedido.total, 0).toLocaleString()} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Incidencias por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Incidencias por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidenciasPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Cantidad">
                    {incidenciasPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Tipo de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientesPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {clientesPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} clientes`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Total clientes</p>
              <p className="text-2xl font-bold">{clientes.length}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Resumen General */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-muted-foreground">Total Vehículos</p>
                <p className="text-2xl font-bold">{vehiculos.length}</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                <p className="text-sm text-muted-foreground">Total Piezas</p>
                <p className="text-2xl font-bold">{piezas.length}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{clientes.length}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-muted-foreground">Incidencias Abiertas</p>
                <p className="text-2xl font-bold">{incidencias.filter(i => i.estado !== "cerrada").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EstadisticasPage;
