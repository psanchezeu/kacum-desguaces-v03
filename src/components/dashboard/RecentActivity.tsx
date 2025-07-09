
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem } from "@/types";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  // Función para determinar el color del badge según el tipo de actividad
  const getBadgeVariant = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'vehículo':
      case 'vehiculo':
        return 'secondary';
      case 'pieza':
        return 'outline';
      case 'cliente':
        return 'default';
      case 'pedido':
        return 'destructive';
      case 'incidencia':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                <div className="w-0.5 h-full ml-0.5 bg-border"></div>
              </div>
              <div className="flex-1 pb-5">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(activity.tipo)}>
                    {activity.tipo}
                  </Badge>
                  <p className="text-sm font-semibold">
                    {activity.descripcion}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.fecha).toLocaleString('es-ES')} - {activity.usuario}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
