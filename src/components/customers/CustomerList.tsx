import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from 'lucide-react';
import { CustomerForm } from './CustomerForm';
import { CustomerCard } from './CustomerCard';
import { useNavigate } from 'react-router-dom';

export const CustomerList = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')  // Only fetch users with 'customer' role
        .order('full_name');

      if (error) throw error;
      
      // Map the profiles data to match the expected customer format
      const formattedCustomers = data?.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      })) || [];

      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load customers"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async () => {
    if (!selectedCustomer) return;

    try {
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedCustomer.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Customer deleted successfully"
      });
      
      fetchCustomers();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">Customers</h3>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={() => {
              setSelectedCustomer(customer);
              setIsFormOpen(true);
            }}
            onDelete={() => {
              setSelectedCustomer(customer);
              setIsDeleteDialogOpen(true);
            }}
          />
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialData={selectedCustomer}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};