import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-primary">Welcome to Menu Magic Masters</h1>
        <p className="text-lg text-muted-foreground">
          Choose your role to get started
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            variant="default" 
            className="w-full p-6"
            onClick={() => navigate("/admin")}
          >
            Admin Dashboard
          </Button>
          
          <Button 
            variant="default" 
            className="w-full p-6"
            onClick={() => navigate("/chef/login")}
          >
            Chef Portal
          </Button>
          
          <Button 
            variant="default" 
            className="w-full p-6"
            onClick={() => navigate("/restaurant")}
          >
            Restaurant Menu
          </Button>
          
          <Button 
            variant="default" 
            className="w-full p-6"
            onClick={() => navigate("/customer")}
          >
            Customer Dashboard
          </Button>
          
          <Button 
            variant="default" 
            className="w-full p-6"
            onClick={() => navigate("/delivery")}
          >
            Delivery Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;