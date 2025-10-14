import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { companionConfig } from "@/config/companionConfig.js";

const Questionnaire = () => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const scores = {
      friend: 0,
      mentor: 0,
      romanticPartner: 0,
      supporter: 0,
    };

    for (const questionId in answers) {
      const optionId = answers[questionId];
      const question = companionConfig.questionnaire.find(q => q.id == questionId);
      const option = question.options.find(o => o.id === optionId);
      if (option && option.scores) {
        for (const persona in option.scores) {
          scores[persona] += option.scores[persona];
        }
      }
    }

    const determinedPersona = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("user_preferences")
        .insert([{ user_id: user.id, tone: determinedPersona }]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save your preferences. Please try again.",
        });
        setLoading(false);
      } else {
        toast({
          title: "Preferences Saved",
          description: "Your persona has been set. You can now chat with your personalized AI.",
        });
        navigate("/dashboard");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save preferences.",
      });
      navigate("/auth");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Personalize Your AI</CardTitle>
          <CardDescription>
            Help us understand your preferences to create a better experience for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {companionConfig.questionnaire.map((question) => (
              <div key={question.id} className="space-y-4">
                <Label>{question.text}</Label>
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  value={answers[question.id] || ""}
                >
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                      <Label htmlFor={`${question.id}-${option.id}`}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || Object.keys(answers).length < companionConfig.questionnaire.length}
            >
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Questionnaire;