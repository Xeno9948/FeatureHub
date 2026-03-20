export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "";
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
          ⚙️ Systeem Test E-mail
        </h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hallo,</p>
          <p>Dit is een test e-mail ter verificatie van de notificatie instellingen voor FeatureHub.</p>
          <p>Als u dit leest, werkt de e-mail integratie correct!</p>
        </div>
      </div>
    `;

    let status = "SENT";
    let errorMsg = null;
    
    try {
      const emailRes = await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_NIEUW_FUNCTIEVERZOEK,
          subject: "FeatureHub: Test Email",
          body: htmlBody,
          is_html: true,
          recipient_email: session.user.email,
          sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : undefined,
          sender_alias: "FeatureHub (Test)",
        }),
      });

      if (!emailRes.ok) {
        status = "FAILED";
        errorMsg = `HTTP ${emailRes.status}`;
      }
    } catch (e: any) {
      status = "FAILED";
      errorMsg = e.message;
    }

    // Log the email
    await prisma.emailLog.create({
      data: {
        recipientEmail: session.user.email,
        subject: "FeatureHub: Test Email",
        body: htmlBody,
        status,
        error: errorMsg,
      },
    });

    if (status === "FAILED") {
      return NextResponse.json({ error: "Email delivery failed", details: errorMsg }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
