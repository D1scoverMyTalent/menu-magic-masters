import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface FoodCardProps {
  item: any;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onSelect?: (item: any) => void;
}

export const FoodCard = ({ item, onEdit, onDelete, onSelect }: FoodCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <AspectRatio ratio={1}>
        <img
          src={item.image_url || '/placeholder.svg'}
          alt={item.name}
          className="object-cover w-full h-full"
        />
      </AspectRatio>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-primary mb-4">{item.description}</p>
        )}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span className="capitalize">{item.dietary_preference}</span>
          <span className="capitalize">{item.course_type}</span>
        </div>
        <div className="flex justify-end space-x-2">
          {onSelect ? (
            <Button 
              variant="secondary"
              onClick={() => onSelect(item)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Menu
            </Button>
          ) : (
            <>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDelete(item)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};