import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

const TYPE_ICONS = {
  APPLICATION_RECEIVED: '📩',
  APPLICATION_ACCEPTED: '✅',
  APPLICATION_REJECTED: '❌',
  APPLICATION_WITHDRAWN: '↩️',
  PROJECT_PUBLISHED: '🚀',
  PROFILE_UPDATED: '👤',
  NEW_COMMENT: '💬',
  NEW_MESSAGE: '✉️',
  NEW_DISCUSSION: '📢',
}

function NotificationItem({ notification }) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 ${
      !notification.isRead ? 'bg-blue-50/30' : ''
    }`}>
      <span className="text-lg mt-0.5">{TYPE_ICONS[notification.type] || '🔔'}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
        <p className="text-xs text-gray-500">{notification.message}</p>
        <span className="text-xs text-gray-400 mt-1 block">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    api.get(`/notifications/me?page=${page}&size=20`)
      .then(data => {
        setNotifications(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Notificaciones</h1>

          <div className="bg-white rounded-xl shadow-sm px-6">
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
            ) : notifications.length > 0 ? (
              notifications.map(n => (
                <NotificationItem key={n.id} notification={n} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No tienes notificaciones.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm"
              >
                ‹
              </button>
              <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm"
              >
                ›
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
