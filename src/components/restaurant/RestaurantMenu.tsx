import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useQuote } from './hooks/useQuote';
import { RestaurantNav } from './navigation/RestaurantNav';
import { HeroSection } from './sections/HeroSection';
import { MenuSection } from './sections/MenuSection';
import { FooterSection } from './sections/FooterSection';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const RestaurantMenu = () => {
  const { user, isInitialized } = useAuth();
  const {
    quoteItems,
    setQuoteItems,
    isQuoteOpen,
    setIsQuoteOpen,
    showQuoteForm,
    setShowQuoteForm,
    handleQuoteSuccess
  } = useQuote();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const { data, error } = await supabase
          .from('food_items')
          .select('*')
          .eq('is_available', true);

        if (error) throw error;
        setFoodItems(data || []);
      } catch (error: any) {
        console.error('Error fetching food items:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load menu items",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, [toast]);

  const handleAddToQuote = async (item: any) => {
    try {
      const existingItem = quoteItems.find(
        (quoteItem) => quoteItem.foodItem.id === item.id
      );

      if (existingItem) {
        setQuoteItems(
          quoteItems.map((quoteItem) =>
            quoteItem.foodItem.id === item.id
              ? { ...quoteItem, quantity: quoteItem.quantity + 1 }
              : quoteItem
          )
        );
      } else {
        setQuoteItems([...quoteItems, { foodItem: item, quantity: 1 }]);
      }
      
      toast({
        title: "Added to Quote",
        description: `${item.name} has been added to your quote.`,
      });
    } catch (error) {
      console.error('Error adding to quote:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to quote. Please try again.",
      });
    }
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
          loading={loading}
        />
      </main>

      <FooterSection />
    </div>
  );
};