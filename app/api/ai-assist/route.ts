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

    let systemPrompt = `Je bent een assistent die gebruikers helpt bij het schrijven van functieverzoeken. 
BELANGRIJKSTE REGEL: Gebruik GEEN formele, ingewikkelde zakelijke taal, passieve zinnen of "corporate jargon". Schrijf heel direct, menselijk, simpel, to-the-point en glashelder. Gebruik vlotte spreektaal (actief geschreven). Antwoord in het Nederlands.
    
BELANGRIJK: Geef NOOIT de naam van het veld op. Geef geen introducties of voorvoegsels (zoals "Titel:", "Beschrijving:", etc.). Genereer EXCLUSIEF alleen de uiteindelijke onbewerkte tekst.

Je helpt uitsluitend bij het "${field}" veld. Reageer alsof je de ruwe tekst bent die direct in dat tekstvak wordt geplakt.`;

    let userPrompt = "";

    switch (field) {
      case "description":
        systemPrompt += `

Voor beschrijvingen moet je:
- Super concreet zijn over wat het precies is en hoe het in de praktijk werkt
- Geen abstracte woorden gebruiken (dus geen "synergetisch platform" maar gewoon "als je op deze knop klikt, gebeurt X")
- Begrijpelijk schrijven alsof je het uitlegt aan een gewone collega (2-3 alinea's)`;
        userPrompt = currentValue
          ? `Herschrijf deze tekst zodat het directer en begrijpelijker is, zonder zakelijk jargon:\n\n"${currentValue}"\n\n${context ? `Context: ${context}` : ""}`
          : `Schrijf een simpele, heldere beschrijving op basis van dit idee:\n\n${context || "Een nieuwe functie"}`;
        break;

      case "businessJustification":
        systemPrompt += `

Voor zakelijke onderbouwing moet je:
- De waarde heel simpel en direct uitleggen (schrijf bijvoorbeeld "het bespaart ons 2 uur per dag" in plaats van "het maximaliseert de operationele efficiëntie voor de afdeling")
- Duidelijk maken wie er precies blij van wordt (onze klanten, dit team)
- Absoluut geen dure managementtermen of bullshit-bingo gebruiken, hou het praktisch!`;
        userPrompt = currentValue
          ? `Verbeter deze zakelijke onderbouwing om deze praktischer en directer te maken:\n\n"${currentValue}"\n\n${context ? `Extra context: ${context}` : ""}`
          : `Waom is dit idee nuttig? Schrijf een simpele, overtuigende reden:\n\n${context || "Een nieuwe functie"}`;
        break;

      case "reason":
        systemPrompt += `

Voor de redenering moet je:
- In simpele, menselijke taal vertellen waarom we dit NU nodig hebben
- Welk frustrerende probleem of welke pijnlijn het precies oplost
- Vermijden van passieve, formele of wollige taal (dus geen "hiermee wordt getracht te realiseren dat...", maar gewoon "we willen dit omdat...")`;
        userPrompt = currentValue
          ? `Verbeter deze redenering om deze overtuigender te maken:\n\n"${currentValue}"\n\n${context ? `Extra context: ${context}` : ""}`
          : `Schrijf een duidelijke redenering waarom deze functie nodig is:\n\n${context || "Een nieuwe functie"}`;
        break;

      case "title":
        systemPrompt += `

Voor titels moet je:
- Beknopt zijn (maximaal 5-10 woorden in totaal)
- De functie duidelijk beschrijven
- Actiewoorden gebruiken
- Jargon vermijden
- OPMERKING: Genereer uitsluitend de titel. Zet er geen getal of "Titel:" voor. Geef niet 3 suggesties, kies er zelf 1 die het sterkst is.`;
        userPrompt = currentValue
          ? `Stel 1 sterk verbeterde titel voor dit functieverzoek voor. Huidige titel: "${currentValue}"\n\n${context ? `Context: ${context}` : ""}`
          : `Stel 1 sterke, korte titel voor een functie met deze beschrijving voor:\n\n${context || "Een nieuwe functie"}`;
        break;

      default:
        userPrompt = `Help deze inhoud te verbeteren voor een functieverzoek:\n\n"${currentValue || context || ""}"`;
    }

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
