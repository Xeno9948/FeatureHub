import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let settings = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: { id: "global", notificationEmails: "schouwman@ekomi-group.com" } });
    }
    return NextResponse.json(settings);
  } catch (error) { return NextResponse.json({ error: "Internal Error" }, { status: 500 }); }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { notificationEmails } = await req.json();
    const settings = await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: { notificationEmails },
      create: { id: "global", notificationEmails }
    });
    return NextResponse.json(settings);
  } catch (error) { return NextResponse.json({ error: "Internal Error" }, { status: 500 }); }
}
