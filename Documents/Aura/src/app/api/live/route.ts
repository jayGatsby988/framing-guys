import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Phone POSTs a frame, or Desktop POSTs guidance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Phone sending a frame
    if (body.image) {
      const { sessionId, image } = body
      if (!sessionId || !image) {
        return NextResponse.json({ error: 'Missing sessionId or image' }, { status: 400 })
      }

      // Upsert frame into Supabase
      await supabase
        .from('live_sessions')
        .upsert({
          session_id: sessionId,
          frame_data: image,
          frame_updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' })

      // Return any pending guidance for the phone
      const { data: session } = await supabase
        .from('live_sessions')
        .select('guidance_text, guidance_updated_at')
        .eq('session_id', sessionId)
        .single()

      const guidanceAge = session?.guidance_updated_at
        ? Date.now() - new Date(session.guidance_updated_at).getTime()
        : null

      return NextResponse.json({
        ok: true,
        guidance: session?.guidance_text || null,
        guidanceAge,
      })
    }

    // Desktop sending guidance text back to phone
    if (body.guidance) {
      const { sessionId, guidance: text } = body
      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
      }

      await supabase
        .from('live_sessions')
        .upsert({
          session_id: sessionId,
          guidance_text: text,
          guidance_updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Desktop GETs the latest frame
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const { data: session } = await supabase
    .from('live_sessions')
    .select('frame_data, frame_updated_at')
    .eq('session_id', sessionId)
    .single()

  if (!session?.frame_data) {
    return NextResponse.json({ image: null, age: null })
  }

  return NextResponse.json({
    image: session.frame_data,
    age: Date.now() - new Date(session.frame_updated_at).getTime(),
  })
}
