import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardNav } from "../shared/DashboardNav";

export const CustomerDashboard = () => {
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/restaurant');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setCustomerName(profile.full_name || '');
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify authentication",
        });
        navigate('/restaurant');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/restaurant');
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
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
      <DashboardNav userName={customerName} onSignOut={handleSignOut} />
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your dashboard!</p>
      </div>
    </div>
  );
};