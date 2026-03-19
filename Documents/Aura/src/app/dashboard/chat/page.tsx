'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Mic, MicOff, Loader2, Plus,
  Trash2, Sparkles, Copy, Volume2, ChevronDown
} from 'lucide-react'
import { supabase, DEFAULT_PROFILE_ID, logActivity } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

const quickPrompts = [
  "What's around me?",
  "Help me read this page",
  "Summarize my last transcript",
  "What accessibility tools do you offer?",
  "How can you help with navigation?",
  "Describe common accessibility shortcuts",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('profile_id', DEFAULT_PROFILE_ID)
      .order('updated_at', { ascending: false })
      .limit(30)
    setConversations(data ?? [])
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages((data ?? []) as Message[])
    setActiveConv(convId)
    setShowSidebar(false)
  }

  async function newConversation() {
    setMessages([])
    setActiveConv(null)
    setShowSidebar(false)
    inputRef.current?.focus()
  }

  async function sendMessage(text?: string) {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const reply = data.reply
      const finalMessages: Message[] = [...newMessages, { role: 'assistant', content: reply }]
      setMessages(finalMessages)

      // Save to Supabase
      let convId = activeConv
      if (!convId) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ profile_id: DEFAULT_PROFILE_ID, title })
          .select('id')
          .single()
        convId = newConv?.id ?? null
        setActiveConv(convId)
      } else {
        await supabase.from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId)
      }

      if (convId) {
        await supabase.from('messages').insert([
          { conversation_id: convId, role: 'user', content },
          { conversation_id: convId, role: 'assistant', content: reply },
        ])
      }

      await logActivity('chat', 'Chat message', content.slice(0, 60))
      loadConversations()
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    }
    setLoading(false)
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setInput(text)
      setIsRecording(false)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }

  function speakText(text: string) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            AI Assistant
          </h1>
          <p className="text-white/50 mt-2">Chat with AURA — your accessibility companion.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            History
          </button>
          <button
            onClick={newConversation}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 hover:bg-indigo-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </motion.div>

      <div className="flex gap-4 relative">
        {/* Conversations sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 260 }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className="bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden flex-shrink-0"
            >
              <div className="p-3 border-b border-white/5">
                <p className="text-xs font-medium text-white/40">Conversations</p>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="p-4 text-xs text-white/20 text-center">No conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadMessages(conv.id)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors border-b border-white/3 ${
                        activeConv === conv.id ? 'bg-indigo-500/10 text-indigo-300' : 'text-white/50'
                      }`}
                    >
                      <p className="truncate">{conv.title}</p>
                      <p className="text-[10px] text-white/20 mt-0.5">{new Date(conv.updated_at).toLocaleDateString()}</p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 bg-[#0F0F12] border border-white/5 rounded-2xl overflow-hidden flex flex-col" style={{ height: '550px' }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white/60">Hi, I&apos;m AURA</h3>
                <p className="text-sm text-white/30 mt-1 max-w-sm">Your AI accessibility assistant. Ask me anything about navigating, reading, listening, or making the web more accessible.</p>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2 mt-6 max-w-md justify-center">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-500 text-white rounded-br-md'
                          : 'bg-white/5 text-white/80 rounded-bl-md'
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === 'assistant' && (
                        <div className="flex gap-1 mt-1">
                          <button onClick={() => speakText(msg.content)} className="p-1 text-white/20 hover:text-white/50" title="Read aloud">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1 text-white/20 hover:text-white/50" title="Copy">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="px-4 py-3 bg-white/5 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-4">
            <div className="flex items-end gap-3">
              <button
                onClick={toggleVoice}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-colors ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-white/40 hover:text-white/60 border border-white/10'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AURA anything..."
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 p-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
