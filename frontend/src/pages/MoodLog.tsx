import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MoodLog = () => {
  const [user, setUser] = useState<User | null>(null);
  const [moodRating, setMoodRating] = useState(3);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase.from("mood_logs").insert({
      user_id: user.id,
      mood_rating: moodRating,
      context_trigger: context.trim() || null,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save mood log",
      });
    } else {
      toast({
        title: "Mood logged",
        description: "Thank you for checking in!",
      });
      setMoodRating(3);
      setContext("");
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Mood Check-in</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling right now?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-4 block">Select your mood</Label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMoodRating(rating)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                      moodRating === rating
                        ? "bg-primary text-primary-foreground scale-125"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-3 px-2">
                <span>Very Low</span>
                <span>Neutral</span>
                <span>Very High</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">What's happening? (Optional)</Label>
              <Input
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Work, Home, Social..."
              />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Mood"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MoodLog;
