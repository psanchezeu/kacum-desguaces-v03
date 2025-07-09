import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConfiguracionPlaceholderTabProps {
  title: string;
  description: string;
}

const ConfiguracionPlaceholderTab: React.FC<ConfiguracionPlaceholderTabProps> = ({
  title,
  description
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Funcionalidad en desarrollo</h3>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            {description}
          </p>
          <Button variant="outline" disabled>
            Próximamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionPlaceholderTab;
