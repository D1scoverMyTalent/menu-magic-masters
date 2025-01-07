import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const chefFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  business_name: z.string().min(1, "Business name is required"),
  business_address: z.string().optional(),
  speciality: z.string().optional(),
  experience_years: z.string().optional(),
  phone: z.string().optional(),
  min_people_served: z.string().optional(),
  max_people_served: z.string().optional(),
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
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      business_name: initialData?.business_name || "",
      business_address: initialData?.business_address || "",
      speciality: initialData?.speciality || "",
      experience_years: initialData?.experience_years?.toString() || "",
      phone: initialData?.phone || "",
      min_people_served: initialData?.min_people_served?.toString() || "",
      max_people_served: initialData?.max_people_served?.toString() || "",
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
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            business_name: formData.business_name,
            business_address: formData.business_address || null,
            speciality: formData.speciality || null,
            experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
            phone: formData.phone || null,
            min_people_served: formData.min_people_served ? parseInt(formData.min_people_served) : null,
            max_people_served: formData.max_people_served ? parseInt(formData.max_people_served) : null,
          })
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        // Create new chef with auth account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: Math.random().toString(36).slice(-8), // Generate random password
          options: {
            data: {
              role: 'chef',
              full_name: `${formData.first_name} ${formData.last_name}`
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create chef account");

        // Create chef record
        const { error: insertError } = await supabase.from("chefs").insert({
          id: authData.user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email.trim().toLowerCase(),
          business_name: formData.business_name,
          business_address: formData.business_address || null,
          speciality: formData.speciality || null,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          phone: formData.phone || null,
          min_people_served: formData.min_people_served ? parseInt(formData.min_people_served) : null,
          max_people_served: formData.max_people_served ? parseInt(formData.max_people_served) : null,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_people_served"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum People Served</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_people_served"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum People Served</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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