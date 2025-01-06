import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, UserCircle2 } from "lucide-react";

interface MobileMenuProps {
  isAuthenticated: boolean;
  userName?: string;
  quoteItemsCount: number;
  setIsQuoteOpen: (value: boolean) => void;
  setShowAuthDialog: (value: boolean) => void;
  handleSignOut: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export const MobileMenu = ({
  isAuthenticated,
  userName,
  quoteItemsCount,
  setIsQuoteOpen,
  setShowAuthDialog,
  handleSignOut,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: MobileMenuProps) => {
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-secondary">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <div className="flex flex-col gap-4 pt-4">
          <Button 
            variant="ghost" 
            className="text-primary w-full justify-start gap-2"
            onClick={() => {
              setIsQuoteOpen(true);
              setIsMobileMenuOpen(false);
            }}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Quote ({quoteItemsCount})</span>
          </Button>
          
          {!isAuthenticated ? (
            <Button 
              variant="ghost" 
              className="text-primary w-full justify-start gap-2"
              onClick={() => {
                setShowAuthDialog(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <UserCircle2 className="h-5 w-5" />
              <span>Sign In</span>
            </Button>
          ) : (
            <>
              <span className="text-primary px-4">{userName}</span>
              <Button 
                variant="ghost" 
                className="text-primary w-full justify-start"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};