import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChefMenuItemsProps {
  items: any[];
  onRefetch: () => void;
}

export const ChefMenuItems = ({ items, onRefetch }: ChefMenuItemsProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("chef_menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item removed successfully"
      });
      
      onRefetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#600000]">No menu items added yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <AspectRatio ratio={16/9}>
            <img
              src={item.food_items.image_url || '/placeholder.svg'}
              alt={item.food_items.name}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-[#600000]">{item.food_items.name}</h3>
            {item.custom_ingredients && (
              <p className="text-sm text-[#600000] mb-2">
                Custom Ingredients: {item.custom_ingredients}
              </p>
            )}
            {item.recipe_notes && (
              <p className="text-sm text-[#600000] mb-4">
                Recipe Notes: {item.recipe_notes}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4 text-[#600000]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(item.id)}
              >
                <Trash className="h-4 w-4 text-[#600000]" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};