import twilio from "twilio";
import type { Twilio } from "twilio";

let _client: Twilio | null = null;

function getClient(): Twilio {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const message = await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
    statusCallback: `${process.env.NEXTAUTH_URL}/api/sms/webhook`,
  });
  return message.sid;
}

export function validateTwilioRequest(
  url: string,
  body: string,
  signature: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const params: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(body)) {
    params[k] = v;
  }

  return twilio.validateRequest(authToken, signature, url, params);
}

export function buildReviewSMS(
  customerName: string,
  businessName: string,
  link: string,
  template?: string | null
): string {
  if (template) {
    return template
      .replace("{name}", customerName)
      .replace("{business}", businessName)
      .replace("{link}", link);
  }
  return `Hi ${customerName}! Thanks for choosing ${businessName}. Your opinion matters — it takes 30 seconds: ${link}\n\nReply STOP to opt out.`;
}
