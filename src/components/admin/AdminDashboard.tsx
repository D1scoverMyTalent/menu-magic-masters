import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodList } from "@/components/FoodList";
import { ChefList } from "@/components/chefs/ChefList";
import { CustomerList } from "@/components/customers/CustomerList";
import { DashboardNav } from "@/components/shared/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have admin privileges",
        });
        navigate('/');
        return;
      }

      setAdminName(profile.full_name || 'Admin');
    };

    checkAuth();
  }, [navigate, toast]);

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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        title="Admin Dashboard" 
        userName={adminName}
        onSignOut={handleSignOut}
      />
      <main className="container mx-auto py-8">
        <Tabs defaultValue="food" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="food">Food Items</TabsTrigger>
            <TabsTrigger value="chefs">Chefs</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="food">
            <FoodList />
          </TabsContent>
          <TabsContent value="chefs">
            <ChefList />
          </TabsContent>
          <TabsContent value="customers">
            <CustomerList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};