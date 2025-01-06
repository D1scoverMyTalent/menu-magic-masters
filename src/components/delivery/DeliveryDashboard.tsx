import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeliveryList } from "./DeliveryList";
import { DashboardNav } from "../shared/DashboardNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const DeliveryDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deliveryName, setDeliveryName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setDeliveryName(profile.full_name);
      }
    };
    fetchProfile();
  }, [navigate]);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: async () => {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          profiles!quotes_customer_id_fkey (
            full_name,
            email
          ),
          quote_items (
            quantity,
            food_items (
              name,
              dietary_preference,
              course_type
            )
          )
        `)
        .in('order_status', ['ready_to_deliver', 'on_the_way', 'delivered', 'received'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return quotes || [];
    },
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  const handleStatusUpdate = async (id: string, type: 'quote', newStatus: 'on_the_way' | 'delivered'): Promise<void> => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ order_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order marked as ${newStatus.replace(/_/g, ' ')}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={deliveryName} onSignOut={handleSignOut} />
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-6">Delivery Dashboard</h2>
        <DeliveryList 
          orders={orders || []}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};