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
    // Use service role key for cron job access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch pending notifications that are due
    const { data: notifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*, profiles(email)')
      .eq('sent', false)
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No pending notifications",
        sent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const notification of notifications) {
      try {
        // TODO: Implement email sending with Resend
        // For now, just log and mark as sent
        console.log(`Would send notification to user ${notification.user_id}:`, notification.message);
        
        // Mark as sent
        await supabase
          .from('scheduled_notifications')
          .update({ sent: true })
          .eq('id', notification.id);

        results.push({ id: notification.id, success: true });
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.push({ id: notification.id, success: false, error: errorMsg });
      }
    }

    return new Response(JSON.stringify({ 
      message: "Notifications processed",
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-scheduled-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
