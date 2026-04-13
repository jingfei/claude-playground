import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatWindow from './ChatWindow'

// scrollIntoView is not implemented in jsdom
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  vi.useRealTimers()
})

// Use fireEvent (synchronous) for tests that also use fake timers.
// userEvent has its own internal setTimeout for pointer/key delays which
// deadlocks when vi.useFakeTimers() is active.
function typeAndSend(text) {
  fireEvent.change(screen.getByPlaceholderText('Type a message…'), {
    target: { value: text },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
}

// ─── Initial render ───────────────────────────────────────────────────────────

describe('initial render', () => {
  it('shows the empty-state prompt', () => {
    render(<ChatWindow />)
    expect(screen.getByText('Send a message to start the conversation.')).toBeInTheDocument()
  })

  it('renders the textarea and Send button', () => {
    render(<ChatWindow />)
    expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('Send button is disabled when input is empty', () => {
    render(<ChatWindow />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('Send button enables when input has text', async () => {
    // No fake timers here — userEvent is safe to use
    const user = userEvent.setup()
    render(<ChatWindow />)
    await user.type(screen.getByPlaceholderText('Type a message…'), 'hello')
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled()
  })
})

// ─── Sending a message ────────────────────────────────────────────────────────

describe('sending a message', () => {
  it('appends the user bubble and clears the input', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('Hello world')
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a message…')).toHaveValue('')
  })

  it('replaces Send with Stop while streaming', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument()
  })

  it('disables the textarea while streaming', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')
    expect(screen.getByPlaceholderText('Type a message…')).toBeDisabled()
  })

  it('shows "streaming…" indicator in the header', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')
    expect(screen.getByText('streaming…')).toBeInTheDocument()
  })
})

// ─── Streaming ────────────────────────────────────────────────────────────────

describe('streaming', () => {
  it('progressively fills the assistant bubble over time', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')

    // After one tick the first word should appear
    act(() => vi.advanceTimersByTime(40))
    const bubbles = document.querySelectorAll('[class*="rounded-2xl"]')
    const assistantBubble = bubbles[bubbles.length - 1]
    expect(assistantBubble.textContent.trim().length).toBeGreaterThan(0)

    // After all ticks streaming should be done
    act(() => vi.advanceTimersByTime(40 * 200))
    expect(screen.queryByRole('button', { name: 'Stop' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('restores Send button and enables textarea after streaming finishes', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')

    act(() => vi.advanceTimersByTime(40 * 200))

    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a message…')).toBeEnabled()
  })
})

// ─── Stop button ──────────────────────────────────────────────────────────────

describe('Stop button', () => {
  it('halts streaming and restores the Send button immediately', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')

    act(() => vi.advanceTimersByTime(40 * 5))
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))

    expect(screen.queryByRole('button', { name: 'Stop' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('keeps the partial text that was already streamed', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')

    act(() => vi.advanceTimersByTime(40 * 5))
    const bubbles = document.querySelectorAll('[class*="rounded-2xl"]')
    const textBeforeStop = bubbles[bubbles.length - 1].textContent.trim()

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))

    // Further timer advances should add no more words
    act(() => vi.advanceTimersByTime(40 * 200))
    const bubblesAfter = document.querySelectorAll('[class*="rounded-2xl"]')
    expect(bubblesAfter[bubblesAfter.length - 1].textContent.trim()).toBe(textBeforeStop)
  })

  it('does not add words after Stop even if timers are advanced', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')

    // Stop before any word has rendered
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    act(() => vi.advanceTimersByTime(40 * 200))

    // Only two bubbles: user + one empty/partial assistant bubble
    const bubbles = document.querySelectorAll('[class*="rounded-2xl"]')
    expect(bubbles.length).toBe(2)
  })
})

// ─── Auto-scroll ──────────────────────────────────────────────────────────────

describe('auto-scroll', () => {
  it('calls scrollIntoView when a message is sent', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('calls scrollIntoView again as words stream in', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    typeAndSend('hi')

    const callsAfterSend = window.HTMLElement.prototype.scrollIntoView.mock.calls.length
    act(() => vi.advanceTimersByTime(40 * 3))
    expect(window.HTMLElement.prototype.scrollIntoView.mock.calls.length).toBeGreaterThan(callsAfterSend)
  })
})

// ─── Keyboard shortcut ────────────────────────────────────────────────────────

describe('keyboard shortcut', () => {
  it('sends the message on Enter', () => {
    vi.useFakeTimers()
    render(<ChatWindow />)
    const textarea = screen.getByPlaceholderText('Type a message…')
    fireEvent.change(textarea, { target: { value: 'keyboard test' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    expect(screen.getByText('keyboard test')).toBeInTheDocument()
  })

  it('does not send on Shift+Enter', async () => {
    // No fake timers — userEvent is safe here
    const user = userEvent.setup()
    render(<ChatWindow />)
    const textarea = screen.getByPlaceholderText('Type a message…')
    await user.type(textarea, 'line one')
    await user.keyboard('{Shift>}{Enter}{/Shift}')

    // If no send happened the empty-state is still visible
    expect(screen.getByText('Send a message to start the conversation.')).toBeInTheDocument()
  })
})
