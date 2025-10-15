import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const crisisKeywords = [
  "suicide", "kill myself", "end my life", "self-harm", "hurt myself",
  "want to die", "better off dead", "no reason to live"
];

const extremeDistressKeywords = [
  "can't go on", "giving up", "no hope", "can't take it anymore",
  "everything is falling apart", "completely alone", "nobody cares"
];

const detectCrisis = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return crisisKeywords.some(keyword => lowerText.includes(keyword));
};

const detectExtremeDistress = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return extremeDistressKeywords.some(keyword => lowerText.includes(keyword));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication and get user ID from session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = user.id; // Use server-verified ID
    const { message } = await req.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid message format' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Message too long (max 5,000 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const isCrisis = detectCrisis(message);
    const isExtremeDistress = detectExtremeDistress(message);

    if (isCrisis) {
      return new Response(
        JSON.stringify({
          response: `I notice you're going through a very difficult time. Your safety is the most important thing right now.\n\nPlease reach out to:\n• National Suicide Prevention Lifeline: 988 (US)\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\nYou deserve support from trained professionals who can help you through this.`,
          crisisDetected: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If extreme distress detected, trigger emergency alert in background
    if (isExtremeDistress) {
      // Non-blocking emergency alert
      fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-emergency-alert`, {
        method: "POST",
        headers: {
          "Authorization": authHeader!,
          "Content-Type": "application/json",
        },
      }).catch(err => console.error("Failed to send emergency alert:", err));
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true })
      .limit(20);

    const { data: preferences } = await supabase
        .from("user_preferences")
        .select("tone, specifics")
        .eq("user_id", userId)
        .single();

    const systemPrompt = `You are an empathetic mental wellness companion. Your role is to:
- Listen actively and validate emotions
- Provide supportive, non-judgmental responses
- Use principles of Cognitive Behavioral Therapy when appropriate
- Encourage healthy coping strategies
- Never provide medical diagnoses or emergency crisis intervention
- Be warm, compassionate, and understanding
- Keep responses conversational and caring, not clinical.
- Your tone should be ${preferences?.tone || 'friendly'}.
- If the user's message is short (1-2 sentences), keep your response to a similar length.
- If the user's message is longer and more detailed, provide a more thoughtful and comprehensive response.

When the user mentions a future event with a specific time, use the schedule_reminder tool to help them.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "schedule_reminder",
          description: "Schedule a reminder notification for a future event the user mentioned. Extract the event name, time, and create an encouraging message.",
          parameters: {
            type: "object",
            properties: {
              event_name: {
                type: "string",
                description: "Short name of the event (e.g., 'job interview', 'doctor appointment')"
              },
              scheduled_time: {
                type: "string",
                description: "ISO 8601 timestamp when the reminder should be sent (e.g., '2025-10-16T13:45:00Z')"
              },
              reminder_message: {
                type: "string",
                description: "An encouraging message to send with the reminder"
              },
              event_context: {
                type: "string",
                description: "Additional context about the event"
              }
            },
            required: ["event_name", "scheduled_time", "reminder_message"],
            additionalProperties: false
          }
        }
      }
    ];

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
        tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices[0];
    
    // Check if AI wants to use a tool
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function.name === "schedule_reminder") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Store notification in database
        await supabase.from('scheduled_notifications').insert({
          user_id: userId,
          scheduled_for: args.scheduled_time,
          message: args.reminder_message,
          event_context: args.event_context || args.event_name,
        });
        
        const aiResponse = `I've scheduled a reminder for your ${args.event_name}. I'll send you an encouraging message beforehand. You've got this! 💪`;
        
        return new Response(
          JSON.stringify({
            response: aiResponse,
            crisisDetected: false,
            reminderScheduled: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    const aiResponse = choice.message.content;

    return new Response(
      JSON.stringify({
        response: aiResponse,
        crisisDetected: false,
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
