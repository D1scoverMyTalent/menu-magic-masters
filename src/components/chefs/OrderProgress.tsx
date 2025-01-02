import { Check, Clock } from "lucide-react";

export interface OrderProgressProps {
  isConfirmed: boolean;
}

export const OrderProgress = ({ isConfirmed }: OrderProgressProps) => {
  return (
    <div className="flex items-center gap-2">
      {isConfirmed ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-500">Confirmed</span>
        </>
      ) : (
        <>
          <Clock className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-500">Pending</span>
        </>
      )}
    </div>
  );
};