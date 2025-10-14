import { useState } from 'react';
import { companionConfig } from '../../supabase/functions/_shared/companionConfig.js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const OnboardingQuestionnaire = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

        toast({
          title: 'Persona assigned!',
          description: 'Your AI companion is now personalized.',
        });
        onComplete(data.persona);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Assigning your persona...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we personalize your AI companion.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = companionConfig.questionnaire[currentQuestionIndex];

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{currentQuestion.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup onValueChange={(value) => handleAnswer(currentQuestion.options.find(o => o.id === value))}>
          {currentQuestion.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
              <Label htmlFor={`${currentQuestion.id}-${option.id}`}>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default OnboardingQuestionnaire;