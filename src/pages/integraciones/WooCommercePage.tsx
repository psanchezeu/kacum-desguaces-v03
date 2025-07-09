import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ShoppingCart } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import WooCommerceConfigTab from "../../components/integraciones/woocommerce/WooCommerceConfigTab";
import WooCommerceImportTab from "../../components/integraciones/woocommerce/WooCommerceImportTab";

const WooCommercePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("config");

  return (
    <PageLayout title="Integración con WooCommerce">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Configuración
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Importar Piezas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <WooCommerceConfigTab onConfigSaved={() => setActiveTab("import")} />
        </TabsContent>
        
        <TabsContent value="import">
          <WooCommerceImportTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default WooCommercePage;
