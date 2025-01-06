import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm = ({ initialData, onSuccess, onCancel }: CustomerFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    password: '', // New password field
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          })
          .eq('id', initialData.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        // Check if customer with email already exists
        const { data: existingCustomer, error: checkError } = await supabase
          .from('customers')
          .select('id')
          .eq('email', formData.email.trim().toLowerCase())
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingCustomer) {
          throw new Error("A customer with this email already exists");
        }

        // Check if auth user exists
        const { data: existingAuth, error: authCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.email.trim().toLowerCase())
          .maybeSingle();

        if (authCheckError) throw authCheckError;
        if (existingAuth) {
          throw new Error("An account with this email already exists");
        }

        if (!formData.password || formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        // Create auth user with customer role
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: 'customer'
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create customer account");

        // Create customer record
        const { error: customerError } = await supabase
          .from('customers')
          .insert([{
            id: authData.user.id,
            name: formData.name,
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone,
            address: formData.address
          }]);

        if (customerError) throw customerError;

        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Customer form error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save customer",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Enter address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

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