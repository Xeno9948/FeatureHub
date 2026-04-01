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
        activities: {
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
    } else if (!action && existingRequest.createdById === user.id) {
      // Any role can edit their own requests when no workflow action is specified
      if (
        existingRequest.status !== RequestStatus.SUBMITTED &&
        existingRequest.status !== RequestStatus.RETURNED
      ) {
        return NextResponse.json(
          { error: "Can only edit requests that are submitted or returned" },
          { status: 400 }
        );
      }
      updateData = {
        ...(title && { title }),
        ...(description && { description }),
        ...(businessJustification !== undefined && { businessJustification }),
        ...(reason !== undefined && { reason }),
        ...(categoryId !== undefined && { categoryId }),
        ...(body.requestedBy !== undefined && { requestedBy: body.requestedBy }),
      };

      // Handle attachment changes: add new, remove deleted
      const { newAttachments, removedAttachmentIds } = body;
      if (removedAttachmentIds?.length) {
        await prisma.attachment.deleteMany({
          where: {
            id: { in: removedAttachmentIds },
            requestId: params.id,
          },
        });
      }
      if (newAttachments?.length) {
        await prisma.attachment.createMany({
          data: newAttachments.map((att: any) => ({
            fileName: att.fileName,
            cloudStoragePath: att.cloudStoragePath,
            isPublic: att.isPublic || false,
            contentType: att.contentType,
            size: att.size,
            requestId: params.id,
          })),
        });
      }
    } else {
      return NextResponse.json(
        { error: "Unauthorized action" },
        { status: 403 }
      );
    }

    // Capture changes for activity log
    const changes: Record<string, { from: any; to: any }> = {};
    for (const key of Object.keys(updateData)) {
      const val = updateData[key];
      const oldVal = (existingRequest as any)[key];
      if (val !== undefined && JSON.stringify(val) !== JSON.stringify(oldVal)) {
        changes[key] = { from: oldVal, to: val };
      }
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
      },
    });

    // Create Activity Log if there were changes
    if (Object.keys(changes).length > 0) {
      await prisma.activityLog.create({
        data: {
          action: action ? `ACTION_${action.toUpperCase()}` : "UPDATED",
          details: JSON.stringify(changes),
          userId: user.id,
          requestId: params.id,
        },
      });

      // Send Email Notifications
      try {
        const appUrl = process.env.NEXTAUTH_URL || "";
        const isCreatorEdit = !action && user.id === existingRequest.createdById;
        const modifiedBy = user.name || user.email;

        // Base notification body
        const notificationHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #ea580c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Request Update</h1>
            </div>
            <div style="padding: 24px; color: #374151;">
              <p>The request <strong>"${updatedRequest.title}"</strong> has been updated by <strong>${modifiedBy}</strong>.</p>
              
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
                <h3 style="margin-top: 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Changes:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                  ${Object.entries(changes).map(([field, vals]) => `
                    <li style="margin-bottom: 8px;">
                      <strong>${field}:</strong> 
                      <span style="color: #991b1b; text-decoration: line-through; opacity: 0.7;">${vals.from || 'none'}</span> 
                      &rarr; 
                      <span style="color: #166534; font-weight: bold;">${vals.to || 'none'}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              ${appUrl ? `<div style="text-align: center; margin-top: 32px;">
                <a href="${appUrl}/dashboard/request/${updatedRequest.id}" style="background-color: #ea580c; color: white !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">View Request</a>
              </div>` : ''}
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
              This is an automated notification from FeatureHub.
            </div>
          </div>
        `;

        // Case 1: Creator (USER) edited the request -> Notify Support/Admin
        if (isCreatorEdit) {
          const systemSetting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
          const defaultEmails = systemSetting ? systemSetting.notificationEmails : "schouwman@ekomi-group.com";
          const recipientEmails = defaultEmails.split(",").map((e: string) => e.trim()).filter((e: string) => e);

          const supportUsers = await prisma.user.findMany({
            where: { role: Role.SUPPORT, emailNotifications: true },
            select: { email: true }
          });
          
          supportUsers.forEach(u => {
            if (u.email && !recipientEmails.includes(u.email)) recipientEmails.push(u.email);
          });

          for (const recipient of recipientEmails) {
            await sendEmail({
              to: recipient,
              subject: `Request Updated by Creator: ${updatedRequest.title}`,
              htmlBody: notificationHtml,
            });
          }
        } 
        // Case 2: Workflow action (e.g. Return to Submitter) -> Notify Creator
        else if (action === "return_to_submitter") {
           if (updatedRequest.createdBy.email) {
             // We can use the more specific "Returned" template from before or this generic one
             await sendEmail({
               to: updatedRequest.createdBy.email,
               subject: `Action Required: Request Returned - ${updatedRequest.title}`,
               htmlBody: notificationHtml,
             });
           }
        }
        // Case 3: Admin/Support edited (status change, etc.) -> Notify Creator
        else if (updatedRequest.createdById !== user.id) {
          if (updatedRequest.createdBy.email) {
            await sendEmail({
              to: updatedRequest.createdBy.email,
              subject: `Update to your Request: ${updatedRequest.title}`,
              htmlBody: notificationHtml,
            });
          }
        }
      } catch (err) {
        console.error("Failed to send update notification:", err);
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
