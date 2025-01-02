import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { OrderProgress } from "./OrderProgress";
import type { Quote } from "@/integrations/supabase/types/quotes";
import { useState } from "react";

export interface QuotationTableProps {
  quotations: Quote[];
  onQuoteSubmit: (quoteId: string, price: number) => void;
}

export const QuotationTable = ({ 
  quotations, 
  onQuoteSubmit
}: QuotationTableProps) => {
  const [prices, setPrices] = useState<Record<string, string>>({});

  const handleSubmitQuote = (quotation: Quote) => {
    const price = parseFloat(prices[quotation.id] || "0");
    if (!price || price <= 0) return;
    
    onQuoteSubmit(quotation.id, price);
    
    setPrices(prev => ({
      ...prev,
      [quotation.id]: ''
    }));
  };

  return (
    <div className="rounded-md border border-[#600000]/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#600000]/5">
            <TableHead className="text-[#600000] font-semibold">Customer</TableHead>
            <TableHead className="text-[#600000] font-semibold">Party Details</TableHead>
            <TableHead className="text-[#600000] font-semibold">Menu Items</TableHead>
            <TableHead className="text-[#600000] font-semibold">Status</TableHead>
            <TableHead className="text-[#600000] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations?.map((quotation) => (
            <TableRow 
              key={quotation.id}
              className="border-b border-[#600000]/10"
            >
              <TableCell className="text-[#600000]">
                <div>
                  <p className="font-medium">
                    {quotation.profiles?.full_name || 'Unknown Customer'}
                  </p>
                  <p className="text-sm opacity-75">
                    {quotation.profiles?.email}
                  </p>
                  {quotation.profiles?.phone && (
                    <p className="text-sm opacity-75">
                      Phone: {quotation.profiles.phone}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-[#600000]">
                <div>
                  <p>Date: {quotation.party_date ? format(new Date(quotation.party_date), 'PPP') : 'N/A'}</p>
                  <p>Location: {quotation.party_location}</p>
                  <p>Veg Guests: {quotation.veg_guests}</p>
                  <p>Non-veg Guests: {quotation.non_veg_guests}</p>
                  {quotation.chef_quotes && quotation.chef_quotes.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Submitted Quotes:</p>
                      <ul className="text-sm space-y-1">
                        {quotation.chef_quotes.map((chefQuote) => (
                          <li key={chefQuote.id}>
                            Price: ${chefQuote.price}
                            {chefQuote.quote_status === 'approved' && (
                              <span className="ml-2 text-green-500">(Selected)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-[#600000]">
                <Card className="p-2 border border-[#600000]/10">
                  <ul className="text-sm space-y-1">
                    {quotation.quote_items?.map((item, index) => (
                      <li key={index}>
                        {item.food_items?.name} x{item.quantity}
                        <span className="text-xs ml-2 opacity-75">
                          ({item.food_items?.dietary_preference}, {item.food_items?.course_type})
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TableCell>
              <TableCell className="text-[#600000]">
                <OrderProgress isConfirmed={quotation.is_confirmed || false} />
              </TableCell>
              <TableCell>
                {!quotation.chef_quotes?.some(q => q.chef_id === quotation.customer_id) && !quotation.is_confirmed && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Enter price"
                        value={prices[quotation.id] || ''}
                        onChange={(e) => setPrices(prev => ({
                          ...prev,
                          [quotation.id]: e.target.value
                        }))}
                        className="w-32 border-[#600000]/20 text-[#600000]"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitQuote(quotation)}
                        className="bg-[#600000] hover:bg-[#600000]/90 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Submit Quote
                      </Button>
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};