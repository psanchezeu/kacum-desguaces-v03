import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Truck, CreditCard, RotateCcw, Clock, CheckCircle } from "lucide-react";

const GarantiasEnviosTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h3>Garantías y envíos</h3>
        <p>Información sobre nuestras garantías, envíos y política de devoluciones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start mb-4">
              <Shield className="h-6 w-6 mr-3 text-primary" />
              <h3 className="text-lg font-medium">Garantía</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                <span>Garantía de 3 meses en todas las piezas usadas</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                <span>Garantía de 1 año en piezas nuevas</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                <span>Todas las piezas son verificadas antes del envío</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start mb-4">
              <Truck className="h-6 w-6 mr-3 text-primary" />
              <h3 className="text-lg font-medium">Envíos</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>Entrega en 24/48h para península</span>
              </li>
              <li className="flex items-start">
                <Truck className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>Envío gratuito para pedidos superiores a 150€</span>
              </li>
              <li className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                <span>Múltiples métodos de pago disponibles</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start mb-4">
              <RotateCcw className="h-6 w-6 mr-3 text-primary" />
              <h3 className="text-lg font-medium">Devoluciones</h3>
            </div>
            <p className="mb-3">
              Si la pieza no es compatible con tu vehículo o presenta algún defecto, puedes devolverla en un plazo de 14 días naturales desde la recepción.
            </p>
            <p>
              Para iniciar una devolución, contacta con nuestro servicio de atención al cliente a través del formulario de contacto o llamando al teléfono que aparece en la web.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GarantiasEnviosTab;
