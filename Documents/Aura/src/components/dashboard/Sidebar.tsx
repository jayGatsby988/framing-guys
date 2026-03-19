'use client'

import { useState, Dispatch, SetStateAction } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, MessageSquare, Volume2, Settings,
  LayoutDashboard, ChevronLeft, ChevronRight, Sparkles, Menu, X, Camera, LogOut, BookOpen, Globe
} from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#6366F1' },
  { href: '/dashboard/vision', icon: Eye, label: 'Vision Assist', color: '#8B5CF6' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Assistant', color: '#6366F1' },
  { href: '/dashboard/audio', icon: Volume2, label: 'Audio Tools', color: '#14B8A6' },
  { href: '/dashboard/notes', icon: BookOpen, label: 'Lecture Notes', color: '#10B981' },
  { href: '/dashboard/live', icon: Camera, label: 'Live Camera', color: '#EF4444' },
  { href: '/dashboard/extension', icon: Globe, label: 'Extension', color: '#A855F7' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', color: '#64748B' },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: Dispatch<SetStateAction<boolean>>
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="text-lg font-bold text-white tracking-tight">AURA</span>
            <p className="text-[10px] text-white/40 -mt-0.5">Adaptive Universal Real-time Accessibility</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon
                className="w-5 h-5 flex-shrink-0 relative z-10"
                style={{ color: active ? item.color : undefined }}
              />
              {!collapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a2e] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle - desktop only */}
      <div className="hidden lg:block border-t border-white/5 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[#0F0F12] border border-white/10 text-white/70"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-[#0A0A10] border-r border-white/5 z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/70"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-[#0A0A10] border-r border-white/5 z-30"
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}
