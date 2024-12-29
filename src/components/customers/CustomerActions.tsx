import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface CustomerActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const CustomerActions = ({ onEdit, onDelete }: CustomerActionsProps) => {
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};