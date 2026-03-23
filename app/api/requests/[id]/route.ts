export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { RequestStatus, Role, Priority } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const req = await prisma.request.findUnique({
      where: { id: params.id },
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
    });

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(req);
  } catch (error) {
    console.error("Get request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await request.json();
    const {
      action,
      priority,
      finalPriority,
      supportNotes,
      adminNotes,
      declineReason,
      title,
      description,
      businessJustification,
      reason,
      categoryId,
    } = body;

    const existingRequest = await prisma.request.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    let updateData: any = {};

    // Handle different actions based on role
    if (action === "support_review" && user.role === Role.SUPPORT) {
      if (existingRequest.status !== RequestStatus.SUBMITTED && existingRequest.status !== RequestStatus.RETURNED) {
        return NextResponse.json(
          { error: "Request is not available for support review" },
          { status: 400 }
        );
      }
      updateData = {
        status: RequestStatus.UNDER_REVIEW,
        supportReviewerId: user.id,
        priority: priority || existingRequest.priority,
        supportNotes: supportNotes || existingRequest.supportNotes,
      };
    } else if (action === "submit_to_admin" && user.role === Role.SUPPORT) {
      if (existingRequest.status !== RequestStatus.UNDER_REVIEW) {
        return NextResponse.json(
          { error: "Request must be under review to submit to admin" },
          { status: 400 }
        );
      }
      updateData = {
        status: RequestStatus.FINAL_REVIEW,
        priority: priority || existingRequest.priority,
        supportNotes: supportNotes || existingRequest.supportNotes,
      };
    } else if (action === "accept" && user.role === Role.ADMIN) {
      if (existingRequest.status === RequestStatus.ACCEPTED || existingRequest.status === RequestStatus.DECLINED) {
        return NextResponse.json(
          { error: "Request is already processed" },
          { status: 400 }
        );
      }
      updateData = {
        status: RequestStatus.ACCEPTED,
        adminReviewerId: user.id,
        finalPriority: finalPriority || existingRequest.priority,
        adminNotes: adminNotes || existingRequest.adminNotes,
      };
    } else if (action === "decline" && user.role === Role.ADMIN) {
      if (existingRequest.status === RequestStatus.ACCEPTED || existingRequest.status === RequestStatus.DECLINED) {
        return NextResponse.json(
          { error: "Request is already processed" },
          { status: 400 }
        );
      }
      if (!declineReason) {
        return NextResponse.json(
          { error: "Decline reason is required" },
          { status: 400 }
        );
      }
      updateData = {
        status: RequestStatus.DECLINED,
        adminReviewerId: user.id,
        declineReason,
        adminNotes: adminNotes || existingRequest.adminNotes,
      };
    } else if (action === "return_to_support" && user.role === Role.ADMIN) {
      if (existingRequest.status === RequestStatus.ACCEPTED || existingRequest.status === RequestStatus.DECLINED) {
        return NextResponse.json(
          { error: "Request is already processed" },
          { status: 400 }
        );
      }
      updateData = {
        status: RequestStatus.RETURNED,
        adminNotes: adminNotes || existingRequest.adminNotes,
      };
    } else if (action === "return_to_submitter" && (user.role === Role.ADMIN || user.role === Role.SUPPORT)) {
      if (existingRequest.status === RequestStatus.ACCEPTED || existingRequest.status === RequestStatus.DECLINED) {
        return NextResponse.json(
          { error: "Request is already processed" },
          { status: 400 }
        );
      }
      const isSupport = user.role === Role.SUPPORT;
      updateData = {
        status: RequestStatus.SUBMITTED,
        ...(isSupport 
          ? { supportNotes: supportNotes || existingRequest.supportNotes } 
          : { adminNotes: adminNotes || existingRequest.adminNotes }),
      };
    } else if (user.role === Role.USER && existingRequest.createdById === user.id) {
      // Users can only update their own requests that are still submitted
      if (existingRequest.status !== RequestStatus.SUBMITTED) {
        return NextResponse.json(
          { error: "Can only edit requests that are still submitted" },
          { status: 400 }
        );
      }
      updateData = {
        ...(title && { title }),
        ...(description && { description }),
        ...(businessJustification !== undefined && { businessJustification }),
        ...(reason !== undefined && { reason }),
        ...(categoryId !== undefined && { categoryId }),
      };
    } else {
      return NextResponse.json(
        { error: "Unauthorized action" },
        { status: 403 }
      );
    }

    const updatedRequest = await prisma.request.update({
      where: { id: params.id },
      data: updateData,
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
    });

    if (action === "return_to_submitter" && updatedRequest.createdBy?.email) {
      const appUrl = process.env.NEXTAUTH_URL || "";
      const notes = user.role === Role.SUPPORT ? supportNotes : adminNotes;
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 30px;">
          <div style="text-align: center; padding-bottom: 20px;">
            ${appUrl ? `<img src="${appUrl}/logo.jpg" alt="Klantenvertellen" style="max-height: 45px; margin: 0 auto;" />` : `<h2 style="color: #ea580c; margin: 0;">Klantenvertellen</h2>`}
          </div>
          <h2 style="color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-top: 0;">
            ⚠️ Verzoek Teruggestuurd
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1f2937;">Hallo ${updatedRequest.createdBy.name || 'Gebruiker'},</p>
            <p style="color: #1f2937;">Je functieverzoek <strong>"${updatedRequest.title}"</strong> is teruggestuurd omdat we extra informatie nodig hebben.</p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ea580c; margin-top: 15px;">
              <strong>Notitie van beheerder:</strong><br/>
              ${(notes || "").replace(/\n/g, '<br>')}
            </div>
          </div>
          ${appUrl ? `<p style="margin-top: 20px; text-align: center;"><a href="${appUrl}/dashboard/request/${updatedRequest.id}" style="background: #ea580c; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">Verzoek Bewerken</a></p>` : ''}
        </div>
      `;

      try {
        await sendEmail({
          to: updatedRequest.createdBy.email,
          subject: `Actie vereist: Functieverzoek "${updatedRequest.title}"`,
          htmlBody: htmlBody,
        });

        await prisma.emailLog.create({
          data: {
            recipientEmail: updatedRequest.createdBy.email,
            subject: `Actie vereist: Functieverzoek "${updatedRequest.title}"`,
            body: htmlBody,
            status: "SENT",
          },
        });
      } catch (err: any) {
        console.error("Failed to send return email:", err);
      }
    }

    if (action === "return_to_support") {
      // Notify all users with SUPPORT role
      const supportUsers = await prisma.user.findMany({
        where: { role: Role.SUPPORT, emailNotifications: true },
        select: { email: true, name: true }
      });

      if (supportUsers.length > 0) {
        const appUrl = process.env.NEXTAUTH_URL || "";
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 30px;">
            <div style="text-align: center; padding-bottom: 20px;">
              ${appUrl ? `<img src="${appUrl}/logo.jpg" alt="Klantenvertellen" style="max-height: 45px; margin: 0 auto;" />` : `<h2 style="color: #ea580c; margin: 0;">Klantenvertellen</h2>`}
            </div>
            <h2 style="color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-top: 0;">
              🔄 Verzoek Teruggestuurd naar Support
            </h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1f2937;">Een functieverzoek is teruggestuurd door de admin voor aanvullende support review.</p>
              <h3 style="margin: 15px 0 5px 0; color: #1f2937;">${updatedRequest.title}</h3>
              <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ea580c; margin-top: 15px;">
                <strong>Notitie van admin:</strong><br/>
                ${(adminNotes || "").replace(/\n/g, '<br>')}
              </div>
            </div>
            ${appUrl ? `<p style="margin-top: 20px; text-align: center;"><a href="${appUrl}/dashboard/request/${updatedRequest.id}" style="background: #ea580c; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">Bekijk Verzoek</a></p>` : ''}
          </div>
        `;

        for (const u of supportUsers) {
          if (u.email) {
            try {
              await sendEmail({
                to: u.email,
                subject: `Actie vereist: Functieverzoek "${updatedRequest.title}" terug naar Support`,
                htmlBody: htmlBody,
              });

              await prisma.emailLog.create({
                data: {
                  recipientEmail: u.email,
                  subject: `Actie vereist: Functieverzoek "${updatedRequest.title}" terug naar Support`,
                  body: htmlBody,
                  status: "SENT",
                },
              });
            } catch (err: any) {
              console.error("Failed to send return-to-support email:", err);
            }
          }
        }
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const existingRequest = await prisma.request.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only creator (while submitted) or admin can delete
    if (
      user.role === Role.ADMIN ||
      (existingRequest.createdById === user.id &&
        existingRequest.status === RequestStatus.SUBMITTED)
    ) {
      await prisma.request.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Unauthorized to delete this request" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Delete request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
