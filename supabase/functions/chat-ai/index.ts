import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmergencyAlert } from "../_shared/notificationService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const crisisKeywords = [
  'kill myself', 'want to die', 'end it all', 'no reason to live', 'can\'t go on',
  'suicide', 'self-harm', 'hurt myself', 'better off dead'
];

const detectCrisisKeywords = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return crisisKeywords.some(keyword => lowerText.includes(keyword));
};

async function analyzeDistress(message, history) {
  if (!detectCrisisKeywords(message)) {
    return { riskLevel: "none", reason: "" };
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const systemPrompt = `You are a highly advanced AI safety and distress classification model. Your sole task is to analyze the following user message and conversation history for signs of immediate risk of self-harm. Do not respond to the user or generate conversational text. Based on the provided context, classify the user's situation into one of three risk levels: 'none', 'moderate', or 'severe'. Provide a brief, generic, and anonymous 'reason' for your classification. Your response MUST be in the following JSON format and nothing else:

{
  "riskLevel": "...",
  "reason": "..."
}

Example reasons:
- "The user is expressing feelings of hopelessness."
- "The user is making direct statements about self-harm."
- "The user's language indicates severe emotional distress and isolation."

Analyze this conversation:`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: message }
  ];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Safety Analysis error:", response.status, errorText);
    // Fallback to a default severe risk level if the safety model fails
    return { riskLevel: "severe", reason: "AI safety model call failed." };
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true })
      .limit(10); // Fetch last 10 messages for context

    const distressAnalysis = await analyzeDistress(message, history || []);

    if (distressAnalysis.riskLevel === 'severe') {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, emergency_contact_name, emergency_contact_phone")
        .eq("id", userId)
        .single();

      if (profile && profile.emergency_contact_phone) {
        await sendEmergencyAlert({
          userName: profile.display_name,
          contactName: profile.emergency_contact_name,
          contactPhone: profile.emergency_contact_phone,
          reason: distressAnalysis.reason,
        });
      }

      return new Response(
        JSON.stringify({
          response: `I notice you're going through a very difficult time. Your safety is the most important thing right now.\n\nPlease reach out to:\n• National Suicide Prevention Lifeline: 988 (US)\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\nYou deserve support from trained professionals who can help you through this.`,
          crisisDetected: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: preferences } = await supabase
        .from("user_preferences")
        .select("tone, specifics") // Assuming persona is now in 'tone'
        .eq("user_id", userId)
        .single();

    const personaInstructions = {
      friend: 'You are a warm, approachable, and supportive friend. Use casual language, be empathetic, and focus on mutual support and shared interests. You can use emojis to convey emotion.',
      mentor: 'You are a wise, focused, and inspiring mentor. Your goal is to help the user grow. Ask thought-provoking questions, provide structured advice, and maintain a calm, encouraging, and slightly formal tone.',
      romanticPartner: 'You are a deeply caring, affectionate, and intimate romantic partner. Your purpose is to make the user feel seen, cherished, and safe. Use warm, loving language, focus on emotional connection, and validate their feelings.',
      supporter: 'You are an energetic, positive, and motivating supporter or cheerleader. Your role is to uplift the user. Use bright, encouraging language, celebrate their wins, and provide pep talks to help them feel confident.',
    };

    const persona = preferences?.tone || 'friend'; // Using tone as persona
    const baseSystemPrompt = `You are an empathetic mental wellness companion. Your role is to:
- Listen actively and validate emotions
- Provide supportive, non-judgmental responses
- Use principles of Cognitive Behavioral Therapy when appropriate
- Encourage healthy coping strategies
- Never provide medical diagnoses or emergency crisis intervention
- Be warm, compassionate, and understanding
- Keep responses conversational and caring, not clinical.
- If the user's message is short (1-2 sentences), keep your response to a similar length.
- If the user's message is longer and more detailed, provide a more thoughtful and comprehensive response.`;

    const systemPrompt = `${personaInstructions[persona]}\n\n${baseSystemPrompt}`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...(history || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save the message and analysis to the database
    const { error: insertError } = await supabase.from('chat_messages').insert([
      { user_id: userId, role: 'user', content: message, distress_analysis: distressAnalysis },
      { user_id: userId, role: 'assistant', content: aiResponse }
    ]);

    if (insertError) {
      console.error("Error saving chat messages:", insertError);
      // Decide if you want to throw or just log
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        crisisDetected: distressAnalysis.riskLevel !== 'none',
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});