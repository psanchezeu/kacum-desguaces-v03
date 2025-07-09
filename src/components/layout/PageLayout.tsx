
import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, actions }) => {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <Navbar />
        <main className="p-6 mt-16"> {/* Añadimos margen superior para el navbar fijo */}
          {(title || actions) && (
            <div className="flex justify-between items-center mb-6">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {actions && <div className="flex items-center">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
