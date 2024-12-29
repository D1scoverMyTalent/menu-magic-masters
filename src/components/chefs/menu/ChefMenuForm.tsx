import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  custom_ingredients: z.string().optional(),
  recipe_notes: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

interface ChefMenuFormProps {
  chefId: string;
  foodItem: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChefMenuForm = ({ chefId, foodItem, onSuccess, onCancel }: ChefMenuFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custom_ingredients: "",
      recipe_notes: "",
      visibility: "private",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!foodItem) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("chef_menu_items").insert({
        chef_id: chefId,
        food_item_id: foodItem.id,
        custom_ingredients: values.custom_ingredients || null,
        recipe_notes: values.recipe_notes || null,
        visibility: values.visibility,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item added successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!foodItem) {
    return (
      <div className="text-center py-4">
        <p>Please select a food item first.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={foodItem.image_url || '/placeholder.svg'}
            alt={foodItem.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h3 className="font-semibold">{foodItem.name}</h3>
            <p className="text-sm text-muted-foreground">{foodItem.description}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="custom_ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Ingredients</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any custom ingredients..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipe_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your recipe notes..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add to Menu"}
          </Button>
        </div>
      </form>
    </Form>
  );
};