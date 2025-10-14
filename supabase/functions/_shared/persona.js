import { calculatePersona } from "./scoring.js";

export async function assignPersona(supabase, answers) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const determinedPersona = calculatePersona(answers);

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: user.id, tone: determinedPersona }, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }

  return { persona: determinedPersona };
}