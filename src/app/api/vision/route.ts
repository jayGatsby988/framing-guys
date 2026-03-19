import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

const SYSTEM_PROMPT = `You are AURA's Vision Assist module. You analyze images for people with visual impairments.

When describing a scene, always include:
1. A brief overall scene summary (1 sentence)
2. Key objects with estimated distances and positions (left, right, ahead, etc.)
3. Any potential hazards or obstacles
4. Navigation advice (e.g., "Safe to walk forward", "Caution: stairs ahead")

Format your response as:
SCENE: [1 sentence overview]
OBJECTS:
- [Object] ([distance], [position]) — [confidence %]
- ...
HAZARDS: [any warnings, or "None detected"]
GUIDANCE: [navigation advice]

Be concise, clear, and prioritize safety-relevant information.`;

export async function POST(req: NextRequest) {
  try {
    const { image, systemPrompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const prompt = systemPrompt || SYSTEM_PROMPT;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for a visually impaired user.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${image}`, detail: "low" },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const description = completion.choices[0]?.message?.content ?? "Unable to analyze image.";

    return NextResponse.json({ description });
  } catch (error: unknown) {
    console.error("Vision API error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
