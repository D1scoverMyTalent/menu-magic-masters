import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "../SignInForm";
import { SignUpForm } from "../SignUpForm";

interface AuthDialogProps {
  showAuthDialog: boolean;
  setShowAuthDialog: (value: boolean) => void;
  handleAuthSuccess: () => void;
}

export const AuthDialog = ({ showAuthDialog, setShowAuthDialog, handleAuthSuccess }: AuthDialogProps) => {
  return (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm onSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};