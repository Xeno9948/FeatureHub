export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { RequestStatus, Role, Priority } from "@prisma/client";

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
      if (existingRequest.status !== RequestStatus.FINAL_REVIEW) {
        return NextResponse.json(
          { error: "Request must be in final review to accept" },
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
      if (existingRequest.status !== RequestStatus.FINAL_REVIEW) {
        return NextResponse.json(
          { error: "Request must be in final review to decline" },
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
      if (existingRequest.status !== RequestStatus.FINAL_REVIEW) {
        return NextResponse.json(
          { error: "Request must be in final review to return" },
          { status: 400 }
        );
      }
      updateData = {
        status: RequestStatus.RETURNED,
        adminNotes: adminNotes || existingRequest.adminNotes,
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
