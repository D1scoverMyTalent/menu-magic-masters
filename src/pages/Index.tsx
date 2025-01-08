import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-primary">Welcome to Menu Magic Masters</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your one-stop platform for managing restaurant menus, chef services, and food delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="h-32 text-lg"
            onClick={() => navigate('/admin')}
          >
            Admin Dashboard
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-32 text-lg"
            onClick={() => navigate('/chef/login')}
          >
            Chef Portal
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-32 text-lg"
            onClick={() => navigate('/restaurant')}
          >
            Restaurant Menu
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-32 text-lg"
            onClick={() => navigate('/customer')}
          >
            Customer Dashboard
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="h-32 text-lg"
            onClick={() => navigate('/delivery')}
          >
            Delivery Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;