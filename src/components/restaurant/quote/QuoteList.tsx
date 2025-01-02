import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EmptyQuote } from "./EmptyQuote";
import { QuoteItem } from "./QuoteItem";

interface QuoteListProps {
  items: Array<{ foodItem: any; quantity: number }>;
  setItems: React.Dispatch<React.SetStateAction<Array<{ foodItem: any; quantity: number }>>>;
}

export const QuoteList = ({ items, setItems }: QuoteListProps) => {
  const updateQuantity = (itemId: string, change: number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.foodItem.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 
            ? { ...item, quantity: newQuantity }
            : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.foodItem.id !== itemId));
  };

  if (items.length === 0) {
    return <EmptyQuote />;
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {items.map(({ foodItem, quantity }) => (
          <div key={foodItem.id}>
            <QuoteItem
              foodItem={foodItem}
              quantity={quantity}
              onQuantityChange={(change) => updateQuantity(foodItem.id, change)}
              onRemove={() => removeItem(foodItem.id)}
            />
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};