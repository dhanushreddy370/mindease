import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BookOpen, TrendingUp, Activity } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MindEase</h1>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/chat")}>
            <CardHeader>
              <MessageSquare className="w-10 h-10 text-primary mb-2" />
              <CardTitle>AI Companion</CardTitle>
              <CardDescription>Chat with your empathetic AI companion</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/journal")}>
            <CardHeader>
              <BookOpen className="w-10 h-10 text-secondary mb-2" />
              <CardTitle>Journal</CardTitle>
              <CardDescription>Write and reflect on your thoughts</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/insights")}>
            <CardHeader>
              <TrendingUp className="w-10 h-10 text-accent mb-2" />
              <CardTitle>Insights</CardTitle>
              <CardDescription>View your mood trends and patterns</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/mood-log")}>
            <CardHeader>
              <Activity className="w-10 h-10 text-destructive mb-2" />
              <CardTitle>Mood Log</CardTitle>
              <CardDescription>Quick mood check-in</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Check-in</CardTitle>
            <CardDescription>Take a moment to reflect on how you're feeling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Regular check-ins help you build awareness of your emotional patterns and mental wellbeing.
            </p>
            <Button onClick={() => navigate("/mood-log")}>Check In Now</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
