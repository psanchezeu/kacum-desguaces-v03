
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pieza } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Tag } from "lucide-react";

interface PartsListProps {
  parts: Pieza[];
}

const PartsList: React.FC<PartsListProps> = ({ parts }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Piezas Disponibles</CardTitle>
        <Button variant="ghost" size="sm">Ver todas</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                <TableCell className="font-medium">
                  {part.tipo_pieza}
                  <div className="text-xs text-muted-foreground">
                    {part.descripcion}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    part.estado === "nueva" ? "border-green-500 text-green-500" :
                    part.estado === "usada" ? "border-blue-500 text-blue-500" :
                    part.estado === "dañada" ? "border-red-500 text-red-500" :
                    part.estado === "en_revision" ? "border-amber-500 text-amber-500" :
                    "border-gray-500 text-gray-500"
                  }>
                    {part.estado}
                  </Badge>
                </TableCell>
                <TableCell>{part.ubicacion_almacen}</TableCell>
                <TableCell className="font-medium">{part.precio_venta.toFixed(2)} €</TableCell>
                <TableCell className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Tag className="h-4 w-4" />
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

export default PartsList;
