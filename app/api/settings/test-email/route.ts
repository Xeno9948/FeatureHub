export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const recipientEmail = body.email || session?.user?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email provided" }, { status: 400 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "";
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 30px;">
        <div style="text-align: center; padding-bottom: 20px;">
          ${appUrl ? `<img src="${appUrl}/logo.jpg" alt="Klantenvertellen" style="max-height: 45px; margin: 0 auto;" />` : `<h2 style="color: #ea580c; margin: 0;">Klantenvertellen</h2>`}
        </div>
        <h2 style="color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-top: 0;">
          ⚙️ Systeem Test E-mail
        </h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #1f2937;">Hallo,</p>
          <p style="color: #1f2937;">Dit is een test e-mail ter verificatie van de notificatie instellingen voor FeatureHub.</p>
          <p style="color: #16a34a; font-weight: bold; margin-top: 20px;">✓ Als u dit leest, werkt de e-mail integratie correct!</p>
        </div>
      </div>
    `;

    let status = "SENT";
    let errorMsg = null;
    
    try {
      await sendEmail({
        to: recipientEmail,
        subject: "FeatureHub: Test Email",
        htmlBody: htmlBody,
      });
    } catch (e: any) {
      status = "FAILED";
      errorMsg = e.message;
    }

    // Log the email
    await prisma.emailLog.create({
      data: {
        recipientEmail: recipientEmail,
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
