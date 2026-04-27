import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function MessageButton({ userId, userName }) {
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  async function handleClick() {
    const content = prompt(`Mensaje para ${userName}:`)
    if (!content?.trim()) return

    setSending(true)
    try {
      await api.post('/messages', { receiverId: userId, content: content.trim() })
      navigate('/mensajes')
    } catch (err) {
      alert(err.message || 'Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={sending}
      className="text-xs text-gray-500 hover:text-gray-700 hover:underline disabled:opacity-50"
    >
      {sending ? 'Enviando...' : '✉ Enviar mensaje'}
    </button>
  )
}
