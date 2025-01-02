import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface QuoteItemProps {
  foodItem: any;
  quantity: number;
  onQuantityChange: (change: number) => void;
  onRemove: () => void;
}

export const QuoteItem = ({ 
  foodItem, 
  quantity, 
  onQuantityChange, 
  onRemove 
}: QuoteItemProps) => {
  return (
    <div className="flex justify-between items-start py-4">
      <div className="space-y-1">
        <h4 className="font-medium leading-none">{foodItem.name}</h4>
        <p className="text-sm text-muted-foreground">
          {foodItem.dietary_preference} • {foodItem.course_type}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};