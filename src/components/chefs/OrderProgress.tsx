import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface OrderProgressProps {
  isConfirmed: boolean;
}

export const OrderProgress = ({ isConfirmed }: OrderProgressProps) => {
  const getProgressValue = (isConfirmed: boolean) => {
    return isConfirmed ? 100 : 50;
  };

  const getStatusColor = (isConfirmed: boolean) => {
    return isConfirmed ? 'bg-green-600' : 'bg-yellow-600';
  };

  const getDisplayStatus = (isConfirmed: boolean) => {
    return isConfirmed ? 'Confirmed' : 'Pending';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Badge 
          variant={isConfirmed ? 'default' : 'secondary'}
          className="font-semibold"
        >
          {getDisplayStatus(isConfirmed)}
        </Badge>
      </div>
      <Progress 
        value={getProgressValue(isConfirmed)} 
        className={`${getStatusColor(isConfirmed)} h-3 rounded-lg`} 
      />
    </div>
  );
};