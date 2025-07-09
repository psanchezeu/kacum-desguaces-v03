
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Car, ShoppingCart, Info, CreditCard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomeFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="ml-2 text-xl font-bold">Kacum</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Sistema integral de gestión para desguaces. Controla inventario, 
              ventas, clientes y operaciones desde una sola plataforma.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary dark:hover:text-yellow-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Navegación</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/caracteristicas" className="text-gray-400 hover:text-white dark:hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" /> Características
                </Link>
              </li>
              <li>
                <Link to="/precios" className="text-gray-400 hover:text-white dark:hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Precios
                </Link>
              </li>
              <li>
                <Link to="/precios#contactForm" className="text-gray-400 hover:text-white dark:hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Contacto
                </Link>
              </li>
              <li>
                <Link to="/catalogo/vehiculos" className="text-gray-400 hover:text-white dark:hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
                  <Car className="h-4 w-4" /> Vehículos
                </Link>
              </li>
              <li>
                <Link to="/recambios" className="text-gray-400 hover:text-white dark:hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> Recambios
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Estado del Sistema
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">info@kacum-desguaces.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">+34 912 345 678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Madrid, España</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-12 pt-8 pb-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="md:w-1/2">
                <h3 className="text-lg font-semibold mb-2">Suscríbete a nuestro newsletter</h3>
                <p className="text-gray-400 text-sm mb-4">Recibe las últimas novedades y actualizaciones de Kacum.</p>
              </div>
              <div className="md:w-1/2 flex flex-col sm:flex-row gap-3 w-full">
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
                />
                <Button variant="default">Suscribirse</Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 py-6">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {currentYear} Kacum. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Términos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
