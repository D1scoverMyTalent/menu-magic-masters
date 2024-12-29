import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChefFormFields } from './ChefFormFields';
import { validateEmail, validatePassword } from './utils/formValidation';

interface ChefFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChefForm = ({ initialData, onSuccess, onCancel }: ChefFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    speciality: initialData?.speciality || '',
    experience_years: initialData?.experience_years || '',
    phone: initialData?.phone || '',
    password: '',
  });
  const { toast } = useToast();

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      const submissionData = {
        name: formData.name,
        email: formData.email,
        speciality: formData.speciality,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        phone: formData.phone,
      };

      if (initialData) {
        const { error } = await supabase
          .from('chefs')
          .update(submissionData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Chef updated successfully",
        });
      } else {
        validatePassword(formData.password);

        // Check if email already exists
        const { data: existingChef } = await supabase
          .from('chefs')
          .select('*')
          .eq('email', formData.email.trim().toLowerCase())
          .maybeSingle();

        if (existingChef) {
          throw new Error("A chef with this email already exists");
        }

        // Create new chef with auth account and correct role
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: {
              role: 'chef',
              full_name: formData.name
            }
          }
        });

        if (authError) {
          if (authError.message.includes("User already registered")) {
            throw new Error("This email is already registered. Please use a different email address.");
          }
          throw authError;
        }

        // Create chef record
        const { error: chefError } = await supabase
          .from('chefs')
          .insert([submissionData]);

        if (chefError) throw chefError;

        toast({
          title: "Success",
          description: "Chef created successfully",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ChefFormFields
        formData={formData}
        isNewChef={!initialData}
        onChange={handleFormDataChange}
      />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};