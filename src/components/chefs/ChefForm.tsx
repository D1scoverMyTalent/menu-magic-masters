import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const chefFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  speciality: z.string().optional(),
  experience_years: z.string().transform(Number).optional(),
  phone: z.string().optional(),
});

type ChefFormData = z.infer<typeof chefFormSchema>;

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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={!!initialData} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!initialData && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="speciality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speciality (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience_years"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience (Optional)</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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