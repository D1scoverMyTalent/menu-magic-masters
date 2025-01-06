import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useQuote = () => {
  const [quoteItems, setQuoteItems] = useState<Array<{ foodItem: any; quantity: number }>>([]);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const { toast } = useToast();

  const handleQuoteSuccess = () => {
    setShowQuoteForm(false);
    setIsQuoteOpen(false);
    setQuoteItems([]);
    toast({
      title: "Quote Submitted",
      description: "Your quote has been submitted successfully.",
    });
  };

  return {
    quoteItems,
    setQuoteItems,
    isQuoteOpen,
    setIsQuoteOpen,
    showQuoteForm,
    setShowQuoteForm,
    handleQuoteSuccess
  };
};