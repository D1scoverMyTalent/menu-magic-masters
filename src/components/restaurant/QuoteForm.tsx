import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomerInfoFields } from "./CustomerInfoFields";
import { PartyDetailsFields } from "./PartyDetailsFields";
import { PartyDatePicker } from "./PartyDatePicker";
import { QuoteFormData } from "./types";

interface QuoteFormProps {
  items: Array<{ foodItem: any; quantity: number }>;
  onSuccess: () => void;
}

export const QuoteForm = ({ items, onSuccess }: QuoteFormProps) => {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<QuoteFormData>();

  const onSubmit = async (data: QuoteFormData) => {
    try {
      if (!date) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a party date",
        });
        return;
      }

      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to submit a quote",
        });
        return;
      }

      // Create the quote with customer_id
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          customer_id: session.user.id,
          party_date: date.toISOString(),
          party_location: data.partyLocation,
          veg_guests: data.vegGuests,
          non_veg_guests: data.nonVegGuests,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items with proper UUID handling
      const quoteItems = items.map(item => ({
        quote_id: quote.id, // This will be a proper UUID from the quotes table
        food_item_id: item.foodItem.id, // Ensure this is a proper UUID
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Your quote has been submitted successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit quote. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CustomerInfoFields register={register} errors={errors} />
      <PartyDatePicker date={date} onDateChange={setDate} />
      <PartyDetailsFields register={register} errors={errors} />
      <Button type="submit" className="w-full">
        Submit Quote
      </Button>
    </form>
  );
};