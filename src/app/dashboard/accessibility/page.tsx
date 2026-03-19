'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccessibilityRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/settings')
  }, [router])
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-white/30 text-sm">Redirecting to Settings...</p>
    </div>
  )
}
