import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Truck, Edit, Trash, Plus } from 'lucide-react';
import { ChefForm } from './chefs/ChefForm';

export const StaffList = ({ role }: { role: 'chef' | 'delivery_staff' }) => {
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const { toast } = useToast();

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(role === 'chef' ? 'chefs' : 'delivery_personnel')
        .select('*');

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load staff members"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, [role]);

  const handleDelete = async () => {
    if (!selectedStaff) return;

    try {
      const { error } = await supabase
        .from(role === 'chef' ? 'chefs' : 'delivery_personnel')
        .delete()
        .eq('id', selectedStaff.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff member deleted successfully"
      });
      
      fetchStaffMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  const StaffIcon = role === 'chef' ? ChefHat : Truck;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => {
          setSelectedStaff(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add {role === 'chef' ? 'Chef' : 'Delivery Staff'}
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffMembers.map((staff) => (
            <Card key={staff.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <StaffIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">
                    {role === 'chef' 
                      ? `${staff.first_name} ${staff.last_name}`
                      : staff.name
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                  {staff.phone && (
                    <p className="text-sm text-muted-foreground">{staff.phone}</p>
                  )}
                  {role === 'chef' && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Business: {staff.business_name}
                      </p>
                      {staff.business_address && (
                        <p className="text-sm text-muted-foreground">
                          Address: {staff.business_address}
                        </p>
                      )}
                      {staff.speciality && (
                        <p className="text-sm text-muted-foreground">
                          Speciality: {staff.speciality}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Experience: {staff.experience_years || 0} years
                      </p>
                      {staff.min_people_served && staff.max_people_served && (
                        <p className="text-sm text-muted-foreground">
                          Capacity: {staff.min_people_served} - {staff.max_people_served} people
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chef Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? 'Edit' : 'Add'} {role === 'chef' ? 'Chef' : 'Delivery Staff'}
            </DialogTitle>
          </DialogHeader>
          {role === 'chef' && (
            <ChefForm
              initialData={selectedStaff}
              onSuccess={() => {
                setIsFormOpen(false);
                setSelectedStaff(null);
                fetchStaffMembers();
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedStaff(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStaff(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};