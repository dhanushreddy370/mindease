import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch user profile with emergency contact
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.emergency_contact_phone) {
      console.error("Profile fetch error:", profileError);
      return new Response(JSON.stringify({ 
        error: "No emergency contact found" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get Twilio credentials from environment
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioSid || !twilioToken || !twilioWhatsAppNumber) {
      console.error("Twilio credentials not configured");
      return new Response(JSON.stringify({ 
        error: "Emergency alert system not configured. Please contact support." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const message = `🚨 URGENT ALERT 🚨\n\nYour emergency contact ${profile.emergency_contact_name} (${profile.email}) is experiencing severe distress and may need immediate help.\n\nPlease reach out to them as soon as possible.\n\n- MindEase Alert System`;

    // Send WhatsApp message via Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${profile.emergency_contact_phone}`,
          From: `whatsapp:${twilioWhatsAppNumber}`,
          Body: message,
        }),
      }
    );

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error("Twilio error:", errorText);
      return new Response(JSON.stringify({ 
        error: "Failed to send emergency alert" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Emergency alert sent to ${profile.emergency_contact_phone} for user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Emergency contact has been notified"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-emergency-alert:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
