export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts by status
    const statusCounts = await prisma.request.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // Get counts by priority
    const priorityCounts = await prisma.request.groupBy({
      by: ["priority"],
      _count: { priority: true },
      where: { priority: { not: null } },
    });

    // Get counts by category
    const categoryCounts = await prisma.request.groupBy({
      by: ["categoryId"],
      _count: { categoryId: true },
      where: { categoryId: { not: null } },
    });

    // Get category names
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    // Get requests over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRequests = await prisma.request.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const requestsByDate: { [key: string]: number } = {};
    recentRequests.forEach((r) => {
      const date = r.createdAt.toISOString().split("T")[0];
      requestsByDate[date] = (requestsByDate[date] || 0) + 1;
    });

    // Convert to array
    const timelineData = Object.entries(requestsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    // Total requests
    const totalRequests = await prisma.request.count();

    // Pending requests (not accepted/declined)
    const pendingRequests = await prisma.request.count({
      where: {
        status: {
          notIn: ["ACCEPTED", "DECLINED"],
        },
      },
    });

    return NextResponse.json({
      totalRequests,
      pendingRequests,
      statusCounts: statusCounts.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      priorityCounts: priorityCounts.map((p) => ({
        priority: p.priority,
        count: p._count.priority,
      })),
      categoryCounts: categoryCounts.map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId ?? "")?.name || "Uncategorized",
        color: categoryMap.get(c.categoryId ?? "")?.color || "#888888",
        count: c._count.categoryId,
      })),
      timelineData,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
