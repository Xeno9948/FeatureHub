export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== Role.ADMIN && user.role !== Role.SUPPORT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { targetLanguage, textObjects } = await request.json();

    if (!targetLanguage || !textObjects) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert, professional translator. Translate the given JSON object values exclusively into ${targetLanguage === "nl" ? "Dutch" : "English"}. You MUST return a valid JSON object structure perfectly identically matching the input's keys. Only translate the text string values. Keep the tone professional but direct.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(textObjects) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI Error: ${response.status}`, errorText);
      return NextResponse.json({ error: `OpenAI Error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "{}";
    
    // Clean potential markdown wrapping which breaks JSON.parse natively
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const translatedTextObjects = JSON.parse(content);

    return NextResponse.json(translatedTextObjects);

  } catch (error: any) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to translate content" },
      { status: 500 }
    );
  }
}
