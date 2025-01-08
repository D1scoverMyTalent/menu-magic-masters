import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RestaurantNav } from "./navigation/RestaurantNav";
import { HeroSection } from "./sections/HeroSection";
import { MenuSection } from "./sections/MenuSection";
import { FooterSection } from "./sections/FooterSection";

export const RestaurantMenu = () => {
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
              supabase.auth.signOut({ scope: 'local' }).catch(() => {
                console.log('Sign out failed, but local state is cleared');
              });
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
              setShowAuthDialog(false);
              toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
              });
            } else {
              setUser(null);
              
              try {
                supabase.auth.signOut({ scope: 'local' }).catch(() => {
                  console.log('Sign out failed, but local state is cleared');
                });
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
          supabase.auth.signOut({ scope: 'local' }).catch(() => {
            console.log('Sign out failed, but local state is cleared');
          });
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

  const { data: foodItems, isLoading } = useQuery({
    queryKey: ['food-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_available', true);
      
      if (error) throw error;
      return data;
    },
  });

  if (!isInitialized) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <RestaurantNav 
        user={user}
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        handleAuthSuccess={() => {
          setShowAuthDialog(false);
          toast({
            title: "Success",
            description: "You have successfully signed in.",
          });
        }}
      />

      <main>
        <HeroSection />
        <MenuSection 
          foodItems={foodItems}
          onDietaryFilterChange={(value) => console.log('Dietary:', value)}
          onCourseFilterChange={(value) => console.log('Course:', value)}
        />
      </main>

      <FooterSection />
    </div>
  );
};