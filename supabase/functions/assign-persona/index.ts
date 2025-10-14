import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { companionConfig } from "../_shared/companionConfig.js";
import nacl from "https://cdn.jsdelivr.net/npm/tweetnacl@1.0.3/+esm";
import { decodeBase64, encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { decodeUTF8, encodeUTF8 } from "https://cdn.jsdelivr.net/npm/tweetnacl-util@0.15.1/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const decryptData = (encryptedData: string) => {
  const secretKey = Deno.env.get("VITE_ENCRYPTION_KEY")!;
  const secretKeyBytes = decodeBase64(secretKey);
  const dataWithNonce = decodeBase64(encryptedData);
  const nonce = dataWithNonce.slice(0, nacl.secretbox.nonceLength);
  const message = dataWithNonce.slice(
    nacl.secretbox.nonceLength,
    dataWithNonce.length
  );

  const decrypted = nacl.secretbox.open(message, nonce, secretKeyBytes);

  if (!decrypted) {
    throw new Error("Failed to decrypt data");
  }

  return JSON.parse(new TextDecoder().decode(decrypted));
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { answers } = await req.json();
    answers = decryptData(answers);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const scores = {
      friend: 0,
      mentor: 0,
      romanticPartner: 0,
      supporter: 0,
    };

    for (const answer of answers) {
      const question = companionConfig.questionnaire.find(q => q.id == answer.questionId);
      const option = question.options.find(o => o.id === answer.optionId);
      if (option && option.scores) {
        for (const persona in option.scores) {
          scores[persona] += option.scores[persona];
        }
      }
    }

    const determinedPersona = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});