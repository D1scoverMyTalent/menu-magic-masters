import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderProgress } from "../chefs/OrderProgress";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const CustomerOrders = ({ orders, refetch }) => {
  const { toast } = useToast();

  const handleQuoteSelection = async (quoteId: string, chefQuoteId: string, price: number) => {
    try {
      // Reset all chef quotes to pending first
      const { error: resetError } = await supabase
        .from('chef_quotes')
        .update({ quote_status: 'pending' })
        .eq('quote_id', quoteId);

      if (resetError) throw resetError;

      // Then approve the selected quote
      const { error: chefQuoteError } = await supabase
        .from('chef_quotes')
        .update({ quote_status: 'approved' })
        .eq('id', chefQuoteId);

      if (chefQuoteError) throw chefQuoteError;

      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ 
          is_confirmed: false
        })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      toast({
        title: "Success",
        description: "Quote selected successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleConfirmQuote = async (id: string, selectedChefQuote?: any) => {
    try {
      const updateData = { 
        is_confirmed: true,
        chef_id: selectedChefQuote?.chef_id
      };

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote confirmed successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="grid gap-6">
      {orders?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).map((order) => (
        <Card key={order.id} className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Party Details</h3>
              <p>Date: {format(new Date(order.party_date), 'PPP')}</p>
              <p>Location: {order.party_location}</p>
              <p>Vegetarian Guests: {order.veg_guests}</p>
              <p>Non-vegetarian Guests: {order.non_veg_guests}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Menu Items</h3>
              <ul className="space-y-1">
                {order.quote_items?.map((item, index) => (
                  <li key={index}>
                    {item.food_items?.name} x{item.quantity}
                    <span className="text-xs ml-2 text-muted-foreground">
                      ({item.food_items?.dietary_preference}, {item.food_items?.course_type})
                    </span>
                  </li>
                ))}
              </ul>

              {order.chef_quotes && order.chef_quotes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Chef Quotes</h3>
                  <RadioGroup
                    defaultValue={order.chef_quotes.find(q => q.quote_status === 'approved')?.id}
                    className="space-y-2"
                  >
                    {order.chef_quotes
                      .filter(quote => quote.is_visible_to_customer)
                      .map((chefQuote) => (
                        <div key={chefQuote.id} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={chefQuote.id}
                            id={chefQuote.id}
                            disabled={order.is_confirmed}
                            onClick={() => !order.is_confirmed && 
                              handleQuoteSelection(order.id, chefQuote.id, chefQuote.price)}
                          />
                          <Label htmlFor={chefQuote.id} className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>{chefQuote.profiles?.full_name}</span>
                              <span className="font-semibold">${chefQuote.price}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold mb-2">Status</h3>
              <OrderProgress isConfirmed={order.is_confirmed} />
              
              {!order.is_confirmed && order.chef_quotes?.some(quote => quote.quote_status === 'approved') && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    const approvedChefQuote = order.chef_quotes?.find(
                      quote => quote.quote_status === 'approved'
                    );
                    if (!approvedChefQuote) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Please select a chef quote first",
                      });
                      return;
                    }
                    handleConfirmQuote(order.id, approvedChefQuote);
                  }}
                >
                  Confirm Quote
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};