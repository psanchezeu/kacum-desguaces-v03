
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  value: string;
  path: string;
}

interface TabsNavigationProps {
  tabs: TabItem[];
  className?: string;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ tabs, className }) => {
  const location = useLocation();
  
  // Determinar la pestaña activa basada en la URL actual
  const getCurrentTab = () => {
    // Primero, intentamos hacer una coincidencia exacta de ruta
    const exactMatch = tabs.find(tab => location.pathname === tab.path);
    if (exactMatch) {
      return exactMatch.value;
    }
    
    // Si no hay coincidencia exacta, probamos si la ruta actual comienza con alguna de las rutas de pestaña
    const partialMatch = tabs.find(tab => location.pathname.startsWith(tab.path));
    if (partialMatch) {
      return partialMatch.value;
    }
    
    // Si no hay coincidencia, devolvemos la primera pestaña
    return tabs[0].value;
  };

  return (
    <Tabs value={getCurrentTab()} className={cn("w-full", className)}>
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex-1"
            asChild
          >
            <Link to={tab.path}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabsNavigation;
