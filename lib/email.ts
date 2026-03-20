import { Resend } from 'resend';

export const sendEmail = async ({ to, subject, htmlBody }: { to: string; subject: string; htmlBody: string }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Email skipped.");
    return { id: "skipped" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sender = process.env.RESEND_FROM_EMAIL || "FeatureHub <onboarding@resend.dev>";
  
  const { data, error } = await resend.emails.send({
    from: sender,
    to,
    subject,
    html: htmlBody,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
