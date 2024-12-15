import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { OrderProgress } from "../chefs/OrderProgress";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const CustomerDashboard = () => {
  const { toast } = useToast();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const quotationsPromise = supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (
            quantity,
            food_items (
              name,
              dietary_preference,
              course_type
            )
          )
        `)
        .order('created_at', { ascending: false });

      const quotesPromise = supabase
        .from('quotes')
        .select(`
          *,
          quote_items (
            quantity,
            food_items (
              name,
              dietary_preference,
              course_type
            )
          )
        `)
        .order('created_at', { ascending: false });

      const [quotationsResult, quotesResult] = await Promise.all([
        quotationsPromise,
        quotesPromise
      ]);

      if (quotationsResult.error) throw quotationsResult.error;
      if (quotesResult.error) throw quotesResult.error;

      return [...(quotationsResult.data || []), ...(quotesResult.data || [])];
    },
  });

  const markAsReceived = async (id: string, type: 'quotation' | 'quote') => {
    try {
      const { error } = await supabase
        .from(type === 'quotation' ? 'quotations' : 'quotes')
        .update({ status: 'received' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order marked as received",
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">My Orders</h2>
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
                  {'quotation_items' in order
                    ? order.quotation_items?.map((item, index) => (
                        <li key={index}>
                          {item.food_items?.name} x{item.quantity}
                          <span className="text-xs ml-2 text-muted-foreground">
                            ({item.food_items?.dietary_preference}, {item.food_items?.course_type})
                          </span>
                        </li>
                      ))
                    : order.quote_items?.map((item, index) => (
                        <li key={index}>
                          {item.food_items?.name} x{item.quantity}
                          <span className="text-xs ml-2 text-muted-foreground">
                            ({item.food_items?.dietary_preference}, {item.food_items?.course_type})
                          </span>
                        </li>
                      ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold mb-2">Order Status</h3>
                <OrderProgress status={order.status} />
                {order.status === 'delivered' && (
                  <Button
                    onClick={() => markAsReceived(
                      order.id,
                      'quotation_items' in order ? 'quotation' : 'quote'
                    )}
                  >
                    Mark as Received
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};