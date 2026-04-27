import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  )
}

function ConversationList({ conversations, selectedId, onSelect }) {
  if (conversations.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-400">No hay conversaciones.</p>
  }

  return (
    <div className="flex flex-col">
      {conversations.map(conv => (
        <button
          key={conv.userId}
          onClick={() => onSelect(conv)}
          className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left transition-colors ${
            selectedId === conv.userId ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <Avatar name={conv.userName} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{conv.userName}</span>
              {conv.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{conv.lastMessageContent}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function ChatView({ conversation, messages, onSend, newMessage, setNewMessage, sending, user }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar name={conversation.userName} />
          <span className="text-sm font-medium text-gray-800">{conversation.userName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
              msg.senderId === user?.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
              <span className={`block text-xs mt-1 ${
                msg.senderId === user?.id ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">Inicia la conversación.</p>
        )}
      </div>

      <form onSubmit={onSend} className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/messages/conversations')
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    api.get(`/messages/conversations/${selected.userId}`)
      .then(data => setMessages(data.content || []))
      .catch(() => {})
  }, [selected])

  async function handleSend(e) {
    e.preventDefault()
    if (!newMessage.trim() || !selected) return

    setSending(true)
    try {
      const msg = await api.post('/messages', {
        receiverId: selected.userId,
        content: newMessage,
      })
      setMessages(prev => [...prev, msg])
      setNewMessage('')
    } catch (err) {
      setError(err.message || 'Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-0">
        <div className="w-72 shrink-0 bg-white rounded-l-xl shadow-sm border-r border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Mensajes</h2>
          </div>
          {loading ? (
            <p className="py-4 text-center text-sm text-gray-400">Cargando...</p>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selected?.userId}
              onSelect={setSelected}
            />
          )}
        </div>

        <div className="flex-1 bg-white rounded-r-xl shadow-sm overflow-hidden">
          {selected ? (
            <>
              {error && <p className="text-red-500 text-xs px-4 pt-2">{error}</p>}
              <ChatView
              conversation={selected}
              messages={messages}
              onSend={handleSend}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sending={sending}
              user={user}
            />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
