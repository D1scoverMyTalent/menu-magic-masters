import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { CustomerActions } from "./CustomerActions";

interface CustomerCardProps {
  customer: any;
  onEdit: () => void;
  onDelete: () => void;
}

export const CustomerCard = ({ customer, onEdit, onDelete }: CustomerCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#800000]">{customer.name}</h3>
          <p className="text-sm text-[#800000]">{customer.email}</p>
          {customer.phone && (
            <p className="text-sm text-[#800000]">{customer.phone}</p>
          )}
          {customer.address && (
            <p className="text-sm text-[#800000]">{customer.address}</p>
          )}
        </div>
        <CustomerActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </Card>
  );
};