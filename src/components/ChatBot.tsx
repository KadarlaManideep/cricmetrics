import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react'
import './ChatBot.css'
import { useChatData } from '../hooks/useChatData'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm CricBot 🏏 Ask me anything about IPL stats — top scorers, bowlers, team records, head to head, match results, or any player stats!"
}

const SUGGESTED_QUESTIONS = [
  "Who has the most runs in IPL history?",
  "Top 5 wicket takers of all time?",
  "Which team has the best win record?",
  "Who has won the most Player of the Match awards?"
]

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getContext } = useChatData()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const context = getContext(text)
      const systemPrompt = `You are CricBot, an expert IPL cricket analytics assistant embedded in the CricMetrics dashboard.

You have access to real IPL data from 2008 to 2025. Use the data context provided to answer questions accurately.

Data available:
${context}

Rules:
- Answer only IPL-related questions using the data provided
- Be concise but informative — 2 to 4 sentences max unless a list is needed
- For lists (top 5 players, etc.) use a numbered format
- If data is not available for a specific query, say so honestly
- Use cricket terminology naturally
- Format numbers cleanly (e.g. "134.7 SR", "8004 runs", "170 wickets")
- Never make up statistics — only use what is in the context provided
- If asked about something outside IPL cricket, politely redirect to IPL topics`

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
if (!apiKey) {
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: 'API key not found. Please add VITE_ANTHROPIC_API_KEY to your .env file.'
  }])
  setLoading(false)
  return
}

const response = await fetch('https://api.anthropic/v1/messages', {
  method: 'POST',
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text }
    ]
  })
}) 
if (!response.ok) {
  const errText = await response.text()
  throw new Error(`API error ${response.status}: ${errText}`)
}

const data = await response.json()
const reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please try again.'

setMessages(prev => [...prev, { role: 'assistant', content: reply }])
} catch (err) {
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
  }])
} finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <button
        className={`chatbot-toggle ${open ? 'chatbot-toggle--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle CricBot"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="chatbot-toggle-label">CricBot</span>}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Bot size={18} />
              </div>
              <div>
                <div className="chatbot-header-title">CricBot</div>
                <div className="chatbot-header-sub">IPL Analytics Assistant</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chatbot-msg-avatar"><Bot size={14} /></div>
                )}
                <div className="chatbot-msg-bubble">
                  {m.content.split('\n').map((line, j, arr) => (
                    <React.Fragment key={j}>
                      {line}
                      {j < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg-avatar"><Bot size={14} /></div>
                <div className="chatbot-msg-bubble chatbot-msg-bubble--loading">
                  <Loader2 size={14} className="chatbot-spinner" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="chatbot-suggestions">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="chatbot-suggestion-btn"
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Ask about IPL stats..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
