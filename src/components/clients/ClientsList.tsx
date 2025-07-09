
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cliente } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Phone } from "lucide-react";

interface ClientsListProps {
  clients: Cliente[];
}

const ClientsList: React.FC<ClientsListProps> = ({ clients }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Clientes Recientes</CardTitle>
        <Button variant="ghost" size="sm">Ver todos</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha alta</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  {client.nombre} {client.apellidos}
                  {client.tipo_cliente === 'empresa' && (
                    <div className="text-xs text-muted-foreground">
                      {client.razon_social}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={client.tipo_cliente === 'particular' ? "outline" : "default"}>
                    {client.tipo_cliente === 'particular' ? 'Particular' : 'Empresa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>{client.email}</div>
                  <div className="text-xs text-muted-foreground">{client.telefono}</div>
                </TableCell>
                <TableCell>{new Date(client.fecha_alta).toLocaleDateString('es-ES')}</TableCell>
                <TableCell className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientsList;
