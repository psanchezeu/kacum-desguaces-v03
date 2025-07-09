import React, { useState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const PreciosPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    mensaje: "",
    tamanoDesguace: "pequeño"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, tamanoDesguace: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío
    setTimeout(() => {
      toast({
        title: "Solicitud enviada",
        description: "Nuestro equipo comercial se pondrá en contacto contigo pronto.",
      });
      setIsSubmitting(false);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        mensaje: "",
        tamanoDesguace: "pequeño"
      });
    }, 1500);
  };

  const features = [
    "Software completo de gestión de desguaces",
    "Instalación y configuración personalizada",
    "10 horas de personalización incluidas",
    "Soporte técnico prioritario 24/7",
    "Actualizaciones y mejoras continuas",
    "Formación para todo tu equipo",
    "Integración con WooCommerce",
    "Importación de datos existentes",
    "Copias de seguridad automáticas",
    "API completa para integraciones"
  ];

  const faqs = [
    {
      question: "¿Qué incluye el precio?",
      answer: "El precio incluye la licencia completa del software, instalación, configuración, 10 horas de personalización, formación inicial y soporte técnico durante el primer año."
    },
    {
      question: "¿Hay costes adicionales?",
      answer: "El precio base incluye todo lo necesario para empezar. Si necesitas más de 10 horas de personalización, se facturarán aparte según tus necesidades específicas."
    },
    {
      question: "¿Ofrecéis financiación?",
      answer: "Sí, disponemos de varias opciones de financiación para facilitar la implementación de Kacum en tu negocio. Nuestro equipo comercial te informará de todas las opciones disponibles."
    },
    {
      question: "¿Cuánto tiempo tarda la implementación?",
      answer: "El tiempo de implementación estándar es de 2-3 semanas, dependiendo de la complejidad de tu operación y las personalizaciones requeridas."
    },
    {
      question: "¿Puedo ampliar las horas de personalización?",
      answer: "Sí, ofrecemos paquetes adicionales de horas de personalización si necesitas adaptar más aspectos del software a tu negocio específico."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-200">
      <HomeHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6 text-foreground">Precio Único Todo Incluido</h1>
              <p className="text-xl mb-8 text-muted-foreground dark:text-gray-300">
                Software completo para la gestión eficiente de tu desguace con todas las funcionalidades que necesitas.
              </p>
            </div>
            
            {/* Pricing Card */}
            <div className="max-w-3xl mx-auto">
              <Card className="border-primary/20 shadow-lg bg-card dark:bg-gray-800/80 backdrop-blur-sm transition-all hover:shadow-xl dark:border-gray-700">
                <CardHeader className="border-b dark:border-gray-700 pb-4">
                  <Badge className="mx-auto mb-4 bg-primary">Software Completo</Badge>
                  <CardTitle className="text-3xl">Kacum Desguaces</CardTitle>
                  <div className="mt-4">
                    <CardTitle className="text-2xl font-bold text-foreground">7.999€</CardTitle>
                    <span className="text-sm text-muted-foreground dark:text-gray-400 ml-2">+ IVA</span>
                  </div>
                  <p className="text-muted-foreground dark:text-gray-300 mt-2">
                    Incluye 10 horas de personalización para adaptarlo a tu negocio
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start text-muted-foreground dark:text-gray-300">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                  <Button 
                    size="lg" 
                    className="w-full mt-6 bg-primary hover:bg-primary/90 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-foreground"
                    onClick={() => {
                      const formElement = document.getElementById('contactForm');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Solicitar Información
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-16 bg-primary/5 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 p-8 rounded-xl">
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold mb-4">¿Necesitas una solución personalizada?</h2>
                  <p className="text-lg mb-6">
                    Contacta con nuestro equipo de ventas para obtener un presupuesto adaptado
                    a las necesidades específicas de tu negocio.
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Integración con tus sistemas actuales</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Desarrollo de funcionalidades a medida</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Soporte técnico prioritario</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/3">
                  <Button size="lg" className="w-full" asChild>
                    <a href="/contacto">Contactar con Ventas</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-white dark:bg-gray-900" id="contactForm">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Contacta con Nuestro Departamento Comercial</h2>
              
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre completo *</Label>
                        <Input 
                          id="nombre" 
                          name="nombre" 
                          placeholder="Tu nombre" 
                          value={formData.nombre} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="tu@email.com" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input 
                          id="telefono" 
                          name="telefono" 
                          placeholder="Tu teléfono" 
                          value={formData.telefono} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa *</Label>
                        <Input 
                          id="empresa" 
                          name="empresa" 
                          placeholder="Nombre de tu empresa" 
                          value={formData.empresa} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tamanoDesguace">Tamaño del desguace</Label>
                      <Select 
                        value={formData.tamanoDesguace} 
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Selecciona el tamaño de tu desguace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pequeño">Pequeño (menos de 1.000 piezas)</SelectItem>
                          <SelectItem value="mediano">Mediano (1.000 - 5.000 piezas)</SelectItem>
                          <SelectItem value="grande">Grande (más de 5.000 piezas)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje</Label>
                      <Textarea 
                        className="dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
                        id="mensaje" 
                        name="mensaje" 
                        placeholder="Cuéntanos sobre tus necesidades específicas" 
                        value={formData.mensaje} 
                        onChange={handleChange} 
                        rows={5} 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                      {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">Precios Flexibles para tu Negocio</h1>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="w-full max-w-md mx-auto border-0 shadow-lg hover:shadow-xl transition-all bg-card dark:bg-gray-800/80 backdrop-blur-sm hover:scale-[1.02] dark:border-gray-700">
                    <h3 className="text-xl font-medium mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/95 dark:to-primary/80 -z-10" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-5">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0VjIwYzAtMS4xLS45LTItMi0yaC0xMmMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxMmMxLjEgMCAyLS45IDItMnpNNDggMzRWMjBjMC0xLjEtLjktMi0yLTJoLS45Yy0uNSAwLTEgLjQtMSAuOXYxNS4xYzAgLjYuNC45LjkuOWguNWMxLjEgMCAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center px-6 py-12 md:py-16 rounded-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  ¿Listo para transformar tu desguace?
                </h2>
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
                  Solicita una demostración personalizada y descubre cómo Kacum puede ayudarte a gestionar tu negocio de manera más eficiente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="default"
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100 px-8 py-6 text-lg font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => {
                      const formElement = document.getElementById('contactForm');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Solicitar Demo Gratuita
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-lg font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => {
                      window.location.href = '/contacto';
                    }}
                  >
                    Hablar con un Asesor
                  </Button>
                </div>
                <p className="mt-6 text-sm text-white/70">
                  Sin compromiso • Sin tarjeta de crédito • Cancelación en cualquier momento
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/100 to-transparent" />
        </section>
      </main>
      
      <HomeFooter />
    </div>
  );
};

export default PreciosPage;
