import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FoodList } from "@/components/FoodList";
import { ChefMenuItems } from "./ChefMenuItems";
import { ChefMenuForm } from "./ChefMenuForm";

export const ChefMenuManager = ({ chefId }: { chefId: string }) => {
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<any>(null);

  const { data: menuItems, refetch: refetchMenuItems } = useQuery({
    queryKey: ["chef-menu-items", chefId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chef_menu_items")
        .select(`
          *,
          food_items (*)
        `)
        .eq("chef_id", chefId);
      
      if (error) throw error;
      return data;
    },
  });

  const handleFoodItemSelect = (item: any) => {
    setSelectedFoodItem(item);
    setIsAddMenuItemOpen(true);
  };

  const handleMenuItemAdded = () => {
    setIsAddMenuItemOpen(false);
    setSelectedFoodItem(null);
    refetchMenuItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Menu</h2>
        <Button onClick={() => setIsAddMenuItemOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <Tabs defaultValue="my-menu" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-menu">My Menu Items</TabsTrigger>
          <TabsTrigger value="available">Available Food Items</TabsTrigger>
        </TabsList>

        <TabsContent value="my-menu">
          <ChefMenuItems items={menuItems || []} onRefetch={refetchMenuItems} />
        </TabsContent>

        <TabsContent value="available">
          <FoodList onSelect={handleFoodItemSelect} />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddMenuItemOpen} onOpenChange={setIsAddMenuItemOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <ChefMenuForm
            chefId={chefId}
            foodItem={selectedFoodItem}
            onSuccess={handleMenuItemAdded}
            onCancel={() => setIsAddMenuItemOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};