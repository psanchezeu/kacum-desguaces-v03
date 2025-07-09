import React from "react";
import { Check, ArrowRight, Gauge, Database, ShieldCheck, BarChart4, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";

const CaracteristicasPage: React.FC = () => {
  const features = [
    {
      icon: <Gauge className="h-8 w-8 text-primary" />,
      title: "Gestión Eficiente",
      description: "Optimiza todos los procesos de tu desguace con un sistema integral diseñado específicamente para el sector."
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Catálogo Centralizado",
      description: "Mantén un inventario actualizado de vehículos y piezas con búsquedas avanzadas y filtros inteligentes."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Seguridad Avanzada",
      description: "Protección de datos y acceso controlado para mantener la información de tu negocio segura."
    },
    {
      icon: <BarChart4 className="h-8 w-8 text-primary" />,
      title: "Análisis y Reportes",
      description: "Obtén informes detallados sobre ventas, inventario y rendimiento para tomar decisiones basadas en datos."
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Gestión de Logística",
      description: "Control de recogidas, entregas y seguimiento de envíos integrado en el sistema."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Gestión de Clientes",
      description: "Administra tu cartera de clientes, historial de compras y comunicaciones desde un único lugar."
    }
  ];

  const benefits = [
    "Reduce tiempos de gestión hasta en un 40%",
    "Aumenta la visibilidad de tu inventario",
    "Mejora la satisfacción del cliente",
    "Optimiza la rotación de stock",
    "Reduce errores administrativos",
    "Facilita el cumplimiento normativo"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary dark:bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Gestiona tu Desguace con Eficiencia Total
              </h1>
              <p className="text-xl mb-8 text-primary-foreground/90 dark:text-blue-200">
                Sistema integral de gestión para desguaces. Controla inventario,
                ventas, clientes y operaciones desde una sola plataforma.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <a href="/contacto">Solicitar Demo</a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white dark:border-yellow-400 hover:bg-white/10 dark:hover:bg-yellow-400/10 text-white dark:text-yellow-400" asChild>
                  <a href="/precios">Ver Planes</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-muted/30 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Características Principales</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Kacum ofrece todas las herramientas que necesitas para gestionar tu desguace
                de forma eficiente y rentable.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card text-card-foreground dark:bg-gray-700/50">
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Beneficios para tu Negocio</h2>
                <p className="text-muted-foreground">
                  Implementar Kacum en tu desguace te permitirá optimizar operaciones y aumentar la rentabilidad.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start p-4 bg-muted/20 rounded-lg">
                    <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">¿Listo para transformar tu desguace?</h2>
              <p className="text-lg mb-8">
                Únete a los cientos de desguaces que ya han optimizado su gestión con Kacum.
              </p>
              <Button size="lg" className="gap-2" asChild>
                <a href="/contacto">
                  Solicitar Demostración <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
};

export default CaracteristicasPage;
