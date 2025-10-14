import { Twilio } from "https://deno.land/x/twilio@2.2.1/mod.ts";

export async function sendEmergencyAlert({ userName, contactName, contactPhone, reason }) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioWhatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

  if (!accountSid || !authToken || !twilioWhatsappNumber) {
    console.error("Twilio credentials are not configured.");
    // In a real application, you might want to have a more robust error handling or notification system here.
    return;
  }

  const twilio = new Twilio(accountSid, authToken);

  const messageBody = `This is an automated SOS alert from the MindEase app for ${userName}. Our system has detected signs of severe emotional distress. Reason flagged: ${reason}. We strongly advise you to check in with them immediately. Please note: This is an automated message. For your privacy, no conversation data is shared.`;

  try {
    const message = await twilio.messages.create({
      from: `whatsapp:${twilioWhatsappNumber}`,
      to: `whatsapp:${contactPhone}`,
      body: messageBody,
    });
    console.log("Emergency alert sent successfully. SID:", message.sid);
  } catch (error) {
    console.error("Failed to send emergency alert:", error);
    // Handle the error appropriately, e.g., by logging it to a monitoring service.
  }
}