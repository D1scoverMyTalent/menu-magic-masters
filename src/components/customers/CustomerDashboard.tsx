import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DashboardNav } from "../shared/DashboardNav";

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/restaurant');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setCustomerName(profile.full_name);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.warn('Sign out error:', error);
    } finally {
      navigate('/restaurant');
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