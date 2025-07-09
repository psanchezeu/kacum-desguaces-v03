
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Vehiculo } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VehicleListProps {
  vehicles: Vehiculo[];
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Vehículos Recientes</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/vehiculos")}>Ver todos</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.matricula}</TableCell>
                <TableCell>
                  {vehicle.marca} {vehicle.modelo}
                  <div className="text-xs text-muted-foreground">
                    {vehicle.version} - {vehicle.anio_fabricacion}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    vehicle.estado === "activo" ? "border-green-500 text-green-500" :
                    vehicle.estado === "procesando" ? "border-blue-500 text-blue-500" :
                    vehicle.estado === "desguazado" ? "border-orange-500 text-orange-500" :
                    vehicle.estado === "baja" ? "border-red-500 text-red-500" :
                    "border-gray-500 text-gray-500"
                  }>
                    {vehicle.estado}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.ubicacion_actual}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate(`/vehiculos/${vehicle.id}`)}
                  >
                    <Eye className="h-4 w-4" />
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

export default VehicleList;
