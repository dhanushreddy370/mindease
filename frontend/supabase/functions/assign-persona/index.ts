import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { companionConfig } from "../_shared/companionConfig.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'Invalid answers format' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (answers.length === 0 || answers.length > 20) {
      return new Response(JSON.stringify({ error: 'Answers array must contain 1-20 items' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const scores: Record<string, number> = {
      friend: 0,
      mentor: 0,
      romanticPartner: 0,
      supporter: 0,
    };

    for (const answer of answers) {
      const question = companionConfig.questionnaire.find((q: any) => q.id == answer.questionId);
      if (!question) continue;
      
      const option = question.options.find((o: any) => o.id === answer.optionId);
      if (option && option.scores) {
        for (const persona in option.scores) {
          if (scores.hasOwnProperty(persona)) {
            scores[persona] += (option.scores as any)[persona];
          }
        }
      }
    }

    const determinedPersona = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: user.id, tone: determinedPersona }, { onConflict: 'user_id' });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ persona: determinedPersona }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});