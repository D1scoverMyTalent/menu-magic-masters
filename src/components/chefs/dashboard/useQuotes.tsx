import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useQuotes = (session: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['chef-quotes', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      // First, get the chef's menu items
      const { data: chefMenuItems, error: menuError } = await supabase
        .from('chef_menu_items')
        .select('food_item_id')
        .eq('chef_id', session.user.id)
        .eq('is_active', true);

      if (menuError) {
        console.error('Error fetching chef menu items:', menuError);
        throw menuError;
      }

      // Create a Set of the chef's food item IDs for efficient lookup
      const chefFoodItemIds = new Set(chefMenuItems?.map(item => item.food_item_id));

      // Fetch all quotes with their items and related data
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          profiles!quotes_customer_id_fkey (
            full_name,
            email,
            phone,
            role
          ),
          quote_items (
            quantity,
            food_items (
              id,
              name,
              dietary_preference,
              course_type
            )
          ),
          chef_quotes (
            id,
            chef_id,
            price,
            quote_status,
            profiles!chef_quotes_chef_id_fkey (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      // Filter quotes to only include those that have items in the chef's menu
      return quotes?.filter(quote => {
        // Check if any of the quote items are in the chef's menu
        const hasMatchingItems = quote.quote_items?.some(item => 
          chefFoodItemIds.has(item.food_items?.id)
        );

        return (
          // Show quotes that have items from chef's menu
          (hasMatchingItems && !quote.is_confirmed) ||
          // Or show quotes where this chef has already submitted a quote
          quote.chef_quotes?.some(q => q.chef_id === session.user.id)
        );
      }).filter(quote => 
        // Ensure we only show quotes from customers
        quote.profiles?.role === 'customer'
      ) || [];
    }
  });

  const handleQuoteSubmission = async (quoteId: string, price: number) => {
    try {
      // First check if this chef has already submitted a quote
      const { data: existingQuotes, error: checkError } = await supabase
        .from('chef_quotes')
        .select('id')
        .eq('quote_id', quoteId)
        .eq('chef_id', session.user.id);

      if (checkError) throw checkError;

      if (existingQuotes && existingQuotes.length > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You have already submitted a quote for this request",
        });
        return;
      }

      const { error } = await supabase
        .from('chef_quotes')
        .insert({
          quote_id: quoteId,
          chef_id: session.user.id,
          price: price,
          is_visible_to_customer: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote submitted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['chef-quotes'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return {
    quotes,
    isLoading,
    handleQuoteSubmission
  };
};