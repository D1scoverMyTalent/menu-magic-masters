import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useQuote } from './hooks/useQuote';
import { RestaurantNav } from './navigation/RestaurantNav';
import { HeroSection } from './sections/HeroSection';
import { MenuSection } from './sections/MenuSection';
import { FooterSection } from './sections/FooterSection';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Sample food items data - this should come from your database
  const foodItems = [
    {
      id: '1',
      name: 'Sample Dish 1',
      description: 'A delicious sample dish',
      dietary_preference: 'vegetarian',
      course_type: 'main',
      image_url: '/placeholder.svg'
    },
    // Add more items as needed
  ];

  const handleAddToQuote = (item: any) => {
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