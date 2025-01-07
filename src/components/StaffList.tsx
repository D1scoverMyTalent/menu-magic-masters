import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Truck, Edit, Trash } from 'lucide-react';

export const StaffList = ({ role }: { role: 'chef' | 'delivery_staff' }) => {
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const { toast } = useToast();

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, chefs(*)')
        .eq('role', role === 'chef' ? 'chef' : 'delivery');

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
        .from('profiles')
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
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffMembers.map((staff) => (
            <Card key={staff.id} className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <StaffIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{staff.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                  {staff.phone && (
                    <p className="text-sm text-muted-foreground">{staff.phone}</p>
                  )}
                  {role === 'chef' && staff.chefs?.[0] && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Business: {staff.chefs[0].business_name}
                      </p>
                      {staff.chefs[0].speciality && (
                        <p className="text-sm text-muted-foreground">
                          Speciality: {staff.chefs[0].speciality}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Experience: {staff.chefs[0].experience_years || 0} years
                      </p>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedStaff(staff);
                      // setIsFormOpen(true);
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