import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-4">
        <h1 className="mb-4 text-5xl font-bold text-primary">MindEase</h1>
        <p className="text-xl text-muted-foreground mb-8">Your compassionate mental wellness companion</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/auth")} size="lg">Get Started</Button>
          <Button onClick={() => navigate("/auth")} variant="outline" size="lg">Sign In</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
