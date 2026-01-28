import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type MoodData = {
  date: string;
  mood: number;
};

const Insights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadInsights(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const loadInsights = async (userId: string) => {
    const { data } = await supabase
      .from("mood_logs")
      .select("timestamp, mood_rating")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true })
      .limit(30);

    if (data) {
      const formatted = data.map((log) => ({
        date: new Date(log.timestamp).toLocaleDateString(),
        mood: log.mood_rating,
      }));
      setMoodData(formatted);
    }
  };

  const averageMood = moodData.length > 0
    ? (moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Insights</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-5xl space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Average Mood</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{averageMood}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>Mood logs tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-secondary">{moodData.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trend</CardTitle>
              <CardDescription>Overall direction</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">
                {moodData.length > 1 && moodData[moodData.length - 1].mood > moodData[0].mood ? "↑" : "→"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mood Trends</CardTitle>
            <CardDescription>Your mood over time</CardDescription>
          </CardHeader>
          <CardContent>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Start logging your mood to see trends and patterns
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Insights;
