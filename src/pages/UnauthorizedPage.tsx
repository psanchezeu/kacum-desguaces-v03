
import React from "react";
import HomeLayout from "@/components/home/HomeLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const UnauthorizedPage = () => {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <Shield className="h-24 w-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-8">
            No tienes permisos suficientes para acceder a esta página.
            Contacta con tu administrador si crees que esto es un error.
          </p>
          <div className="space-y-4">
            <Link to="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Ir a Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default UnauthorizedPage;
