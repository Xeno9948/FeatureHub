export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const { field, currentValue, context } = body;

    if (!field) {
      return NextResponse.json(
        { error: "Veld is verplicht" },
        { status: 400 }
      );
    }

    let systemPrompt = `Je bent een behulpzame assistent die gebruikers helpt bij het schrijven van hoogwaardige functieverzoeken voor een bedrijfsapplicatie. Je antwoorden moeten professioneel, duidelijk en uitvoerbaar zijn. Antwoord altijd in het Nederlands.

Je helpt bij het verbeteren van het "${field}" veld van een functieverzoek.`;

    let userPrompt = "";

    switch (field) {
      case "description":
        systemPrompt += `

Voor beschrijvingen moet je:
- Specifiek en gedetailleerd zijn over wat de functie moet doen
- Relevante use cases opnemen
- Verwacht gedrag beschrijven
- Beknopt maar uitgebreid houden (2-4 paragrafen)`;
        userPrompt = currentValue
          ? `Verbeter en breid deze functiebeschrijving uit:\n\n"${currentValue}"\n\n${context ? `Context: ${context}` : ""}`
          : `Schrijf een duidelijke, gedetailleerde functiebeschrijving op basis van deze context:\n\n${context || "Een nieuwe functie voor het platform"}`;
        break;

      case "businessJustification":
        systemPrompt += `

Voor zakelijke onderbouwing moet je:
- De zakelijke waarde en ROI uitleggen
- Voordelen waar mogelijk kwantificeren (tijdsbesparing, kostenreductie, omzetimpact)
- Vermelden wie er baat bij heeft (teams, afdelingen, klanten)
- Verbinden met bedrijfsdoelen of KPI's`;
        userPrompt = currentValue
          ? `Verbeter deze zakelijke onderbouwing om deze overtuigender te maken:\n\n"${currentValue}"\n\n${context ? `Extra context: ${context}` : ""}`
          : `Schrijf een overtuigende zakelijke onderbouwing voor een functie met deze beschrijving:\n\n${context || "Een nieuwe functie"}`;
        break;

      case "reason":
        systemPrompt += `

Voor de redenering moet je:
- Uitleggen waarom deze functie NU nodig is
- De pijnpunten of problemen beschrijven die het oplost
- Eventuele workarounds vermelden die momenteel worden gebruikt
- Urgentie benadrukken indien van toepassing`;
        userPrompt = currentValue
          ? `Verbeter deze redenering om deze overtuigender te maken:\n\n"${currentValue}"\n\n${context ? `Extra context: ${context}` : ""}`
          : `Schrijf een duidelijke redenering waarom deze functie nodig is:\n\n${context || "Een nieuwe functie"}`;
        break;

      case "title":
        systemPrompt += `

Voor titels moet je:
- Beknopt zijn (5-10 woorden)
- De functie duidelijk beschrijven
- Actiewoorden gebruiken
- Jargon vermijden`;
        userPrompt = currentValue
          ? `Stel 3 verbeterde titels voor voor dit functieverzoek. Huidige titel: "${currentValue}"\n\n${context ? `Context: ${context}` : ""}`
          : `Stel 3 goede titels voor voor een functie met deze beschrijving:\n\n${context || "Een nieuwe functie"}`;
        break;

      default:
        userPrompt = `Help deze inhoud te verbeteren voor een functieverzoek:\n\n"${currentValue || context || ""}"`;
    }

    const response = await fetch('https://medici-holding.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: true,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API fout: ${response.status}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          let partialRead = '';
          while (true) {
            const { done, value } = (await reader?.read()) || { done: true, value: undefined };
            if (done) break;
            
            partialRead += decoder.decode(value, { stream: true });
            const lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream fout:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("AI assist fout:", error);
    return NextResponse.json(
      { error: "Fout bij genereren AI-assistentie" },
      { status: 500 }
    );
  }
}
