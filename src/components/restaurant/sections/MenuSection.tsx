import { FoodFilters } from '@/components/food/FoodFilters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface MenuSectionProps {
  foodItems: any[];
  onAddToQuote: (item: any) => void;
  onDietaryFilterChange: (value: string) => void;
  onCourseFilterChange: (value: string) => void;
}

export const MenuSection = ({ 
  foodItems, 
  onAddToQuote, 
  onDietaryFilterChange, 
  onCourseFilterChange 
}: MenuSectionProps) => {
  return (
    <section className="py-16 bg-accent">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Menu</h2>
        <div className="flex justify-center mb-8">
          <FoodFilters 
            onDietaryFilterChange={onDietaryFilterChange}
            onCourseFilterChange={onCourseFilterChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems?.map((item) => (
            <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              {item.description && (
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span className="capitalize">{item.dietary_preference}</span>
                <span className="capitalize">{item.course_type}</span>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => onAddToQuote(item)}
                  variant="secondary"
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add to Quote
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};