import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companionConfig } from '../../supabase/functions/_shared/companionConfig.js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

const OnboardingQuestionnaire = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recommendedPersona, setRecommendedPersona] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setPersona } = useTheme();
  const navigate = useNavigate();

  const handleAnswer = async (option) => {
    const newAnswers = [...answers, { questionId: companionConfig.questionnaire[currentQuestionIndex].id, optionId: option.id }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < companionConfig.questionnaire.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('assign-persona', {
          body: { answers: newAnswers },
        });

        if (error) {
          throw error;
        }

        setRecommendedPersona(data.persona);
        setShowRecommendation(true);
        setLoading(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
        setLoading(false);
      }
    }
  };

  const handlePersonaSelection = (selectedPersona) => {
    setPersona(selectedPersona);
    toast({
      title: 'Persona set!',
      description: `Your AI companion is now ${companionConfig.personas[selectedPersona].name}.`,
    });
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Analyzing your responses...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we personalize your AI companion.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRecommendation) {
    const personas = Object.keys(companionConfig.personas);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Your Recommended AI Companion</CardTitle>
            <CardDescription>Based on your responses, we recommend:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
              <h3 className="text-xl font-bold text-primary mb-2">
                {companionConfig.personas[recommendedPersona].name}
              </h3>
              <p className="text-muted-foreground mb-4">
                This persona is tailored to your needs and preferences.
              </p>
              <Button 
                onClick={() => handlePersonaSelection(recommendedPersona)}
                className="w-full"
                size="lg"
              >
                Choose {companionConfig.personas[recommendedPersona].name}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Or choose a different companion:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {personas.filter(p => p !== recommendedPersona).map((personaKey) => (
                  <Button
                    key={personaKey}
                    variant="outline"
                    onClick={() => handlePersonaSelection(personaKey)}
                    className="h-auto py-3"
                  >
                    {companionConfig.personas[personaKey].name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = companionConfig.questionnaire[currentQuestionIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{currentQuestion.text}</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {companionConfig.questionnaire.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup onValueChange={(value) => handleAnswer(currentQuestion.options.find(o => o.id === value))}>
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 rounded hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                <Label htmlFor={`${currentQuestion.id}-${option.id}`} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingQuestionnaire;