'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CaptionsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/notes')
  }, [router])
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-white/30 text-sm">Redirecting to Lecture Notes...</p>
    </div>
  )
}
