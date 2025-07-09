import React from 'react';
import GruaForm from '../GruaForm';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { Truck } from 'lucide-react';
import PageLayout from '../../../components/layout/PageLayout';

const NuevaGruaPage: React.FC = () => {
  return (
    <PageLayout title="Nueva Grúa">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2" />
            Datos de la Grúa
          </CardTitle>
          <CardDescription>
            Completa todos los campos requeridos (*)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GruaForm />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default NuevaGruaPage;
