import { useChefAuth } from "./dashboard/useChefAuth";
import { DashboardNav } from "../shared/DashboardNav";
import { ChefMenuManager } from "./menu/ChefMenuManager";

export const ChefDashboard = () => {
  const { session, chefName, handleSignOut } = useChefAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={chefName} onSignOut={handleSignOut} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ChefMenuManager chefId={session?.user?.id || ''} />
        </div>
      </div>
    </div>
  );
};