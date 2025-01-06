import { useState } from "react";
import { AuthDialog } from "../auth/AuthDialog";
import { MobileMenu } from "./MobileMenu";
import { DesktopMenu } from "./DesktopMenu";

interface RestaurantNavProps {
  user: any;
  quoteItems: Array<{ foodItem: any; quantity: number }>;
  isQuoteOpen: boolean;
  showQuoteForm: boolean;
  showAuthDialog: boolean;
  setIsQuoteOpen: (value: boolean) => void;
  setShowQuoteForm: (value: boolean) => void;
  setShowAuthDialog: (value: boolean) => void;
  setQuoteItems: (items: Array<{ foodItem: any; quantity: number }>) => void;
  handleQuoteSuccess: () => void;
  handleAuthSuccess: () => void;
}

export const RestaurantNav = ({
  user,
  quoteItems,
  isQuoteOpen,
  showQuoteForm,
  showAuthDialog,
  setIsQuoteOpen,
  setShowQuoteForm,
  setShowAuthDialog,
  setQuoteItems,
  handleQuoteSuccess,
  handleAuthSuccess
}: RestaurantNavProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserName("");
      setQuoteItems([]);
      setShowQuoteForm(false);
      setIsQuoteOpen(false);
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  return (
    <nav className="bg-primary/95 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <h1 className="text-[20px] md:text-[24px] font-bold text-secondary font-['Proza_Libre']">
          Flavours From Home
        </h1>
        
        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <MobileMenu
            isAuthenticated={isAuthenticated}
            userName={userName}
            quoteItemsCount={quoteItems.reduce((acc, item) => acc + item.quantity, 0)}
            setIsQuoteOpen={setIsQuoteOpen}
            setShowAuthDialog={setShowAuthDialog}
            handleSignOut={handleSignOut}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>

        {/* Desktop Menu */}
        <DesktopMenu
          isAuthenticated={isAuthenticated}
          userName={userName}
          quoteItems={quoteItems}
          isQuoteOpen={isQuoteOpen}
          showQuoteForm={showQuoteForm}
          setIsQuoteOpen={setIsQuoteOpen}
          setShowQuoteForm={setShowQuoteForm}
          setQuoteItems={setQuoteItems}
          setShowAuthDialog={setShowAuthDialog}
          handleQuoteSuccess={handleQuoteSuccess}
          handleSignOut={handleSignOut}
        />

        {/* Auth Dialog */}
        <AuthDialog
          showAuthDialog={showAuthDialog}
          setShowAuthDialog={setShowAuthDialog}
          handleAuthSuccess={handleAuthSuccess}
        />
      </div>
    </nav>
  );
};