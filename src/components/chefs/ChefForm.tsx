import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChefFormFields } from "./ChefFormFields";
import { ChefFormData, chefFormSchema } from "./types";

interface ChefFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChefForm = ({ initialData, onSuccess, onCancel }: ChefFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChefFormData>({
    resolver: zodResolver(chefFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      speciality: initialData?.speciality || "",
      experience_years: initialData?.experience_years?.toString() || "",
      phone: initialData?.phone || "",
    },
  });

  const handleSubmit = async (formData: ChefFormData) => {
    try {
      setIsSubmitting(true);

      if (initialData) {
        // Update existing chef
        const { error: updateError } = await supabase
          .from("chefs")
          .update({
            name: formData.name,
            email: formData.email,
            speciality: formData.speciality || null,
            experience_years: formData.experience_years || null,
            phone: formData.phone || null,
          })
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        // Check if chef with email already exists
        const { data: existingChef, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", formData.email.trim().toLowerCase())
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingChef) {
          throw new Error("A chef with this email already exists");
        }

        // Create new chef with auth account and explicitly set role as 'chef'
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: {
              role: 'chef',  // Explicitly set role as chef
              full_name: formData.name
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create chef account");

        // Create chef record
        const { error: insertError } = await supabase.from("chefs").insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          speciality: formData.speciality || null,
          experience_years: formData.experience_years || null,
          phone: formData.phone || null,
        });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: `Chef ${initialData ? "updated" : "created"} successfully`,
      });
      onSuccess();
    } catch (error: any) {
      console.error("Chef form error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save chef",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ChefFormFields form={form} isEditing={!!initialData} />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Chef" : "Add Chef"}
          </Button>
        </div>
      </form>
    </Form>
  );
};