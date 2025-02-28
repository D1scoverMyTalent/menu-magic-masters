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
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteItems, setQuoteItems] = useState<Array<{ foodItem: any; quantity: number }>>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If there's a session, verify the profile exists
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profile) {
            console.log('Profile not found');
            // Clear local state first
            setUser(null);
            setQuoteItems([]);
            setShowQuoteForm(false);
            setIsQuoteOpen(false);
            
            try {
              // Attempt to sign out, but don't wait for it
              supabase.auth.signOut({ scope: 'local' }).catch(() => {
                // Ignore sign out errors since we've already cleared local state
                console.log('Sign out failed, but local state is cleared');
              });
            } catch (error) {
              // Ignore sign out errors
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
              console.log('No profile found for user:', session.user.id);
              // Clear local state first
              setUser(null);
              setQuoteItems([]);
              setShowQuoteForm(false);
              setIsQuoteOpen(false);
              
              try {
                // Attempt to sign out, but don't wait for it
                supabase.auth.signOut({ scope: 'local' }).catch(() => {
                  // Ignore sign out errors since we've already cleared local state
                  console.log('Sign out failed, but local state is cleared');
                });
              } catch (error) {
                // Ignore sign out errors
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
            setQuoteItems([]);
            setShowQuoteForm(false);
            setIsQuoteOpen(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        // Clear local state first
        setUser(null);
        setQuoteItems([]);
        setShowQuoteForm(false);
        setIsQuoteOpen(false);
        
        try {
          // Attempt to sign out, but don't wait for it
          supabase.auth.signOut({ scope: 'local' }).catch(() => {
            // Ignore sign out errors since we've already cleared local state
            console.log('Sign out failed, but local state is cleared');
          });
        } catch (error) {
          // Ignore sign out errors
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

  const handleAddToQuote = (item: any) => {
    if (!user) {
      setShowAuthDialog(true);
      toast({
        title: "Please sign in",
        description: "You need to sign in to create a quote",
      });
      return;
    }

    const existingItem = quoteItems.find(qi => qi.foodItem.id === item.id);
    if (existingItem) {
      setQuoteItems(quoteItems.map(qi => 
        qi.foodItem.id === item.id 
          ? { ...qi, quantity: qi.quantity + 1 }
          : qi
      ));
    } else {
      setQuoteItems([...quoteItems, { foodItem: item, quantity: 1 }]);
    }
    
    toast({
      title: "Added to quote",
      description: `${item.name} has been added to your quote.`,
    });
  };

  const handleQuoteSuccess = () => {
    setShowQuoteForm(false);
    setIsQuoteOpen(false);
    setQuoteItems([]);
    toast({
      title: "Quote Submitted",
      description: "Your quote has been submitted successfully.",
    });
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    toast({
      title: "Success",
      description: "You have successfully signed in.",
    });
  };

  if (!isInitialized) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <RestaurantNav 
        user={user}
        quoteItems={quoteItems}
        isQuoteOpen={isQuoteOpen}
        showQuoteForm={showQuoteForm}
        showAuthDialog={showAuthDialog}
        setIsQuoteOpen={setIsQuoteOpen}
        setShowQuoteForm={setShowQuoteForm}
        setShowAuthDialog={setShowAuthDialog}
        setQuoteItems={setQuoteItems}
        handleQuoteSuccess={handleQuoteSuccess}
        handleAuthSuccess={handleAuthSuccess}
      />

      <main>
        <HeroSection />
        <MenuSection 
          foodItems={foodItems}
          onAddToQuote={handleAddToQuote}
          onDietaryFilterChange={(value) => console.log('Dietary:', value)}
          onCourseFilterChange={(value) => console.log('Course:', value)}
        />
      </main>

      <FooterSection />
    </div>
  );
};