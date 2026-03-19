import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

const SYSTEM_PROMPT = `You are AURA, an AI-powered accessibility companion. You help people with vision and hearing impairments interact with the world. Your personality is warm, clear, calm, and helpful.

You can help with:
- Describing scenes and surroundings
- Reading and summarizing content
- Navigation guidance
- Starting live captions
- Improving website accessibility
- Answering general questions

Keep responses concise (2-4 sentences max). Be empathetic but not patronizing. Use clear, direct language. When relevant, mention AURA features that could help.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that. Could you try again?";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Failed to get response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
