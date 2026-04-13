import { useState, useRef, useEffect, useCallback } from 'react'

const RESPONSES = [
  "Sure! Here's a quick explanation. Streaming APIs send data incrementally, chunk by chunk, rather than waiting for the full response to be ready. This gives users immediate feedback and makes the interface feel faster and more responsive.",
  "Great question. Auto-scrolling works by keeping a ref attached to a sentinel element at the bottom of the message list. Whenever the messages state updates, a useEffect fires and calls scrollIntoView on that element, keeping the latest content visible.",
  "The Stop button sets an abort flag via a ref — not state — so the next scheduled setTimeout callback can read the latest value synchronously and bail out before appending more tokens. Using a ref avoids stale closure issues that would occur with plain state.",
  "React's useState updater function receives the previous state, which means each setTimeout callback safely reads the most recent messages array even though it was closed over an older snapshot at the time it was scheduled.",
  "Tailwind CSS v4 uses a single CSS import instead of PostCSS config files. The @tailwindcss/vite plugin processes your source files and generates only the utility classes you actually use, keeping the output bundle small.",
]

function pickResponse(input) {
  // Rotate through responses based on message content length for variety
  return RESPONSES[input.length % RESPONSES.length]
}

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef(null)
  const timeoutRef = useRef(null)
  const abortRef = useRef(false)

  // Auto-scroll whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startStreaming = useCallback((responseText) => {
    const words = responseText.split(' ')
    let index = 0

    // Append an empty assistant bubble to fill in
    setMessages((prev) => [...prev, { role: 'assistant', content: '', done: false }])

    const tick = () => {
      if (abortRef.current) {
        // Mark the bubble as done (stopped early)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], done: true }
          return updated
        })
        setIsStreaming(false)
        return
      }

      if (index >= words.length) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], done: true }
          return updated
        })
        setIsStreaming(false)
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        const sep = index === 0 ? '' : ' '
        updated[updated.length - 1] = {
          ...last,
          content: last.content + sep + words[index],
        }
        return updated
      })

      index++
      timeoutRef.current = setTimeout(tick, 40)
    }

    timeoutRef.current = setTimeout(tick, 40)
  }, [])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return

    setMessages((prev) => [...prev, { role: 'user', content: text, done: true }])
    setInput('')
    setIsStreaming(true)
    abortRef.current = false

    startStreaming(pickResponse(text))
  }, [input, isStreaming, startStreaming])

  const stopStreaming = () => {
    abortRef.current = true
    clearTimeout(timeoutRef.current)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-medium text-sm">Streaming Chat</span>
        {isStreaming && (
          <span className="text-xs text-gray-400 animate-pulse ml-1">streaming…</span>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-16">
            Send a message to start the conversation.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
              }`}
            >
              {msg.content}
              {/* Blinking cursor while this bubble is being streamed */}
              {!msg.done && (
                <span className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle animate-[blink_0.8s_step-end_infinite]" />
              )}
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-2 items-end">
        <textarea
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition max-h-32"
          rows={1}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />

        {isStreaming ? (
          <button
            onClick={stopStreaming}
            className="shrink-0 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 transition cursor-pointer"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 transition cursor-pointer"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
