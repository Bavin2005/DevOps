import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getConversations, getMessages, sendMessage } from '../../api/chatApi'
import { getDirectory } from '../../api/usersApi'

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Chat() {
  const { user } = useAuth()
  const userId = user?._id?.toString?.() || user?.id?.toString?.()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedPeer, setSelectedPeer] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const scrollRef = useRef(null)

  const loadConversations = () => {
    getConversations()
      .then((res) => setConversations(res?.conversations || []))
      .catch(() => setConversations([]))
  }

  const loadMessages = (peerId) => {
    if (!peerId) return
    getMessages(peerId)
      .then((res) => setMessages(res?.messages || []))
      .catch(() => setMessages([]))
  }

  useEffect(() => {
    loadConversations()
    getDirectory()
      .then((users) => setContacts(users || []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedPeer) {
      loadMessages(selectedPeer._id)
      loadConversations()
    } else {
      setMessages([])
    }
  }, [selectedPeer?._id])

  useEffect(() => {
    const t = selectedPeer ? setInterval(() => {
      loadMessages(selectedPeer._id)
      loadConversations()
    }, 5000) : null
    return () => clearInterval(t)
  }, [selectedPeer?._id])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !selectedPeer || sending) return

    setInput('')
    setSending(true)
    try {
      const res = await sendMessage(selectedPeer._id, text)
      setMessages((m) => [...m, res.message])
      loadConversations()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const startChatWith = (contact) => {
    const peer = { _id: contact._id, name: contact.name, email: contact.email, department: contact.department }
    setSelectedPeer(peer)
    setShowNewChat(false)
    loadMessages(contact._id)
  }

  const existingPeerIds = conversations.map((c) => c.user?._id?.toString?.()).filter(Boolean)
  const otherContacts = contacts.filter((c) => c._id?.toString?.() !== userId && !existingPeerIds.includes(c._id?.toString?.()))

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chat</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Message colleagues</p>
      </div>
    <div className="flex h-[calc(100vh-12rem)] min-h-[400px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Sidebar - conversations */}
      <div className="flex w-72 flex-col border-r border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Messages</h2>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            New Chat
          </button>
        </div>

        {showNewChat ? (
          <div className="flex-1 overflow-y-auto p-2">
            <p className="px-2 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Select a colleague</p>
            {otherContacts.length === 0 ? (
              <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">No one to chat with yet</p>
            ) : (
              otherContacts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => startChatWith(c)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                    {c.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{c.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.department || c.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No conversations yet. Start a new chat!
              </p>
            ) : (
              conversations.map((conv) => {
                const peer = conv.user
                const isSelected = selectedPeer?._id?.toString?.() === peer?._id?.toString?.()
                return (
                  <button
                    key={peer?._id}
                    onClick={() => setSelectedPeer({ _id: peer._id, name: peer.name, email: peer.email, department: peer.department })}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors dark:border-slate-700/50 ${
                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                        {peer?.name?.charAt(0) || '?'}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900 dark:text-white">{peer?.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {conv.lastMessage?.content?.slice(0, 40) || 'No messages yet'}
                        {conv.lastMessage?.content?.length > 40 ? '...' : ''}
                      </p>
                    </div>
                    {conv.lastMessage && (
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Main - message thread */}
      <div className="flex flex-1 flex-col">
        {selectedPeer ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                {selectedPeer.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedPeer.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPeer.department || selectedPeer.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const senderId = m.sender?._id?.toString?.() ?? m.sender?.toString?.()
                const isMe = senderId === userId
                return (
                  <div
                    key={m._id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        isMe
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                      }`}
                    >
                      <p className="text-sm">{m.content}</p>
                      <p className={`mt-1 text-xs ${isMe ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="input-base flex-1"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="btn-primary"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-slate-900 dark:text-white">Employee Chat</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a conversation or start a new chat to message a colleague
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default Chat
