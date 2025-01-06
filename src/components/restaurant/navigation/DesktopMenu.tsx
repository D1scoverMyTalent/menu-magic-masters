import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, UserCircle2 } from "lucide-react";
import { QuoteList } from "../QuoteList";
import { QuoteForm } from "../QuoteForm";

interface DesktopMenuProps {
  isAuthenticated: boolean;
  userName?: string;
  quoteItems: Array<{ foodItem: any; quantity: number }>;
  isQuoteOpen: boolean;
  showQuoteForm: boolean;
  setIsQuoteOpen: (value: boolean) => void;
  setShowQuoteForm: (value: boolean) => void;
  setQuoteItems: (items: Array<{ foodItem: any; quantity: number }>) => void;
  setShowAuthDialog: (value: boolean) => void;
  handleQuoteSuccess: () => void;
  handleSignOut: () => void;
}

export const DesktopMenu = ({
  isAuthenticated,
  userName,
  quoteItems,
  isQuoteOpen,
  showQuoteForm,
  setIsQuoteOpen,
  setShowQuoteForm,
  setQuoteItems,
  setShowAuthDialog,
  handleQuoteSuccess,
  handleSignOut
}: DesktopMenuProps) => {
  return (
    <div className="hidden md:flex items-center gap-4">
      <Sheet open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="text-secondary gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Quote ({quoteItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your Quote</SheetTitle>
          </SheetHeader>
          {showQuoteForm ? (
            <QuoteForm items={quoteItems} onSuccess={handleQuoteSuccess} />
          ) : (
            <div className="space-y-4">
              <QuoteList items={quoteItems} setItems={setQuoteItems} />
              {quoteItems.length > 0 && (
                <Button 
                  className="w-full" 
                  onClick={() => setShowQuoteForm(true)}
                >
                  Proceed to Quote Details
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {!isAuthenticated ? (
        <Button 
          variant="ghost" 
          className="text-secondary gap-2"
          onClick={() => setShowAuthDialog(true)}
        >
          <UserCircle2 className="h-5 w-5" />
          <span>Sign In</span>
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-secondary">{userName}</span>
          <Button 
            variant="ghost" 
            className="text-secondary"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
};