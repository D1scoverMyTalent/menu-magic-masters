import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile) {
            setUser(null);
            try {
              await supabase.auth.signOut({ scope: 'local' });
            } catch (error) {
              console.log('Sign out error caught:', error);
            }

            toast({
              variant: "destructive",
              title: "Session Error",
              description: "Your session has expired. Please sign in again.",
            });
          } else {
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
        
        setIsInitialized(true);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              setUser(session.user);
              toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
              });
            } else {
              setUser(null);
              try {
                await supabase.auth.signOut({ scope: 'local' });
              } catch (error) {
                console.log('Sign out error caught:', error);
              }

              toast({
                variant: "destructive",
                title: "Error",
                description: "User profile not found. Please contact support.",
              });
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        setUser(null);
        
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
          console.log('Sign out error caught:', error);
        }

        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem with authentication. Please try signing in again.",
        });
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [toast]);

  return { user, isInitialized };
};