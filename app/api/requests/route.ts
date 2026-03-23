export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { RequestStatus, Role } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const priority = searchParams.get("priority");

    let where: any = {};

    // Role-based filtering
    if (user.role === Role.USER) {
      where.createdById = user.id;
    } else if (user.role === Role.SUPPORT) {
      // Support sees SUBMITTED and RETURNED requests, plus requests they reviewed
      where.OR = [
        { status: RequestStatus.SUBMITTED },
        { status: RequestStatus.RETURNED },
        { supportReviewerId: user.id },
      ];
    }
    // ADMIN and VIEWER see all

    if (status) {
      // Handle comma-separated status values
      if (status.includes(",")) {
        const statuses = status.split(",").map(s => s.trim());
        where.status = { in: statuses };
      } else {
        where.status = status;
      }
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (priority) {
      where.priority = priority;
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        attachments: true,
        notes: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await request.json();
    const { title, description, businessJustification, reason, categoryId, requestedBy, attachments } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Get category name if categoryId is provided
    let categoryName = null;
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true },
      });
      categoryName = category?.name;
    }

    const newRequest = await prisma.request.create({
      data: {
        title,
        description,
        businessJustification: businessJustification || null,
        reason: reason || null,
        categoryId: categoryId || null,
        requestedBy: requestedBy || null,
        createdById: user.id,
        status: RequestStatus.SUBMITTED,
        attachments: attachments?.length
          ? {
              create: attachments.map((att: any) => ({
                fileName: att.fileName,
                cloudStoragePath: att.cloudStoragePath,
                isPublic: att.isPublic || false,
                contentType: att.contentType,
                size: att.size,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        attachments: true,
        notes: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    // Send email notification for new request
    try {
      const appUrl = process.env.NEXTAUTH_URL || '';
      const appName = appUrl ? new URL(appUrl).hostname.split('.')[0] : 'FeatureHub';
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 30px;">
          <div style="text-align: center; padding-bottom: 20px;">
            ${appUrl ? `<img src="${appUrl}/logo.jpg" alt="Klantenvertellen" style="max-height: 45px; margin: 0 auto;" />` : `<h2 style="color: #ea580c; margin: 0;">Klantenvertellen</h2>`}
          </div>
          <h2 style="color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-top: 0;">
            📝 Nieuw Functieverzoek Ingediend
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">${title}</h3>
            ${categoryName ? `<p style="margin: 10px 0;"><strong>Categorie:</strong> ${categoryName}</p>` : ''}
            ${requestedBy ? `<p style="margin: 10px 0;"><strong>Aangevraagd door:</strong> ${requestedBy}</p>` : ''}
            <p style="margin: 10px 0;"><strong>Ingediend door:</strong> ${user.name || user.email}</p>
            <p style="margin: 15px 0 5px 0;"><strong>Beschrijving:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ea580c;">
              ${description.replace(/\n/g, '<br>')}
            </div>
            ${businessJustification ? `
              <p style="margin: 15px 0 5px 0;"><strong>Zakelijke Onderbouwing:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #16a34a;">
                ${businessJustification.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
            ${attachments?.length ? `<p style="margin: 15px 0;"><strong>Bijlagen:</strong> ${attachments.length} bestand(en)</p>` : ''}
          </div>
          <p style="color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            Ingediend op: ${new Date().toLocaleString('nl-NL')}
          </p>
          ${appUrl ? `<p style="margin-top: 20px; text-align: center;"><a href="${appUrl}/dashboard/request/${newRequest.id}" style="background: #ea580c; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">Bekijk Verzoek</a></p>` : ''}
        </div>
      `;

      const systemSetting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
      const defaultEmails = systemSetting ? systemSetting.notificationEmails : "schouwman@ekomi-group.com";
      const recipientEmails = defaultEmails.split(",").map((e: string) => e.trim()).filter((e: string) => e);

      // Also notify all users with SUPPORT role
      const supportUsers = await prisma.user.findMany({
        where: { role: Role.SUPPORT, emailNotifications: true },
        select: { email: true }
      });
      
      for (const u of supportUsers) {
        if (u.email && !recipientEmails.includes(u.email)) {
          recipientEmails.push(u.email);
        }
      }

      for (const recipient of recipientEmails) {
        let status = 'SENT';
        let errorMsg = null;
        try {
          await sendEmail({
            to: recipient,
            subject: `Nieuw Functieverzoek: ${title}`,
            htmlBody: htmlBody,
          });
        } catch (e: any) {
          status = 'FAILED';
          errorMsg = e.message;
        }

        await prisma.emailLog.create({
          data: {
            recipientEmail: recipient,
            subject: `Nieuw Functieverzoek: ${title}`,
            body: htmlBody,
            status,
            error: errorMsg,
          },
        });
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
