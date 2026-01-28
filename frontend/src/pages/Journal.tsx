import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Journal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [moodRating, setMoodRating] = useState(3);
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
    if (!content.trim() || !user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-journal", {
        body: { content: content.trim(), userId: user.id },
      });

      if (error) throw error;

      await supabase.from("journals").insert({
        user_id: user.id,
        content: content.trim(),
        mood_rating: moodRating,
        detected_emotions: data.emotions || [],
      });

      toast({
        title: "Journal saved",
        description: "Your entry has been saved successfully.",
      });

      setContent("");
      setMoodRating(3);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save journal entry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Journal</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMoodRating(rating)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                      moodRating === rating
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                1 = Very Low, 5 = Very High
              </p>
            </div>

            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your thoughts, feelings, and experiences..."
                className="min-h-[300px]"
              />
            </div>

            <Button onClick={handleSave} disabled={loading || !content.trim()} className="w-full">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Journal;
