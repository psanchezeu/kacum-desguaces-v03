
import React from "react";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { collapsed } = useSidebar();
  const { isDarkMode } = useTheme();
  
  return (
    <div className={cn(
      "border-b px-4 py-3 flex items-center justify-between fixed top-0 right-0 z-30 transition-all duration-300",
      "bg-background text-foreground",
      collapsed ? "left-16" : "left-64"
    )}>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-primary hidden sm:block">
          Kacum APP
        </h1>
      </div>
      
      <div className="flex-1 px-4 mx-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar vehículos, piezas, clientes..."
            className="w-full pl-8 pr-4 py-2 border rounded-md bg-white dark:bg-white text-foreground dark:text-black text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Usuario</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
