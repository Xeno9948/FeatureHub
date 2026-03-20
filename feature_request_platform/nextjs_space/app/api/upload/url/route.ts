export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getFileUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cloudStoragePath, isPublic } = body;

    if (!cloudStoragePath) {
      return NextResponse.json(
        { error: "cloudStoragePath is required" },
        { status: 400 }
      );
    }

    const url = await getFileUrl(cloudStoragePath, isPublic || false);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Get file URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
