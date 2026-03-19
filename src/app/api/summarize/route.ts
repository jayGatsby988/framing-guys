import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are AURA's audio analysis module. Given a transcript, provide:
1. A concise summary (2-3 sentences)
2. Key highlights as bullet points (4-6 items)
3. Any action items mentioned

Format:
SUMMARY: [summary text]
HIGHLIGHTS:
- [highlight 1]
- [highlight 2]
...
ACTION ITEMS:
- [item] (or "None identified")`,
        },
        {
          role: "user",
          content: `Analyze this transcript:\n\n${transcript}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content ?? "Unable to analyze transcript.";

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    console.error("Summarize API error:", error);
    const message = error instanceof Error ? error.message : "Failed to summarize";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
