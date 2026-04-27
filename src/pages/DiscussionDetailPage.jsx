import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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

function CommentItem({ comment, currentUserId, onDelete, onEdit }) {
  const isOwner = comment.authorId === currentUserId
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!editContent.trim()) return
    setSaving(true)
    try {
      await onEdit(comment.id, editContent)
      setEditing(false)
    } catch (err) {
      alert(err.message || 'Error al editar')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditContent(comment.content)
    setEditing(false)
  }

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <Avatar name={comment.authorName} />
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{comment.authorName}</span>
          <span className="text-xs text-gray-400">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {isOwner && !editing && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
        {editing ? (
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={2}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{comment.content}</p>
        )}
      </div>
    </div>
  )
}

export default function DiscussionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [discussion, setDiscussion] = useState(null)
  const [comments, setComments] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/discussions/${id}`),
      api.get(`/discussions/${id}/comments`),
    ])
      .then(([disc, comms]) => {
        setDiscussion(disc)
        setComments(comms)
      })
      .catch(() => setError('No se pudo cargar la discusión'))
  }, [id])

  async function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return

    setSending(true)
    try {
      const comment = await api.post(`/discussions/${id}/comments`, {
        content: newComment,
      })
      setComments(prev => [...prev, comment])
      setNewComment('')
    } catch (err) {
      setError(err.message || 'Error al agregar comentario')
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) {
      setError(err.message || 'Error al eliminar comentario')
    }
  }

  async function handleEditComment(commentId, content) {
    const updated = await api.put(`/comments/${commentId}`, { content })
    setComments(prev => prev.map(c => c.id === commentId ? updated : c))
  }

  if (discussion === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Cargando discusión...</p>
        </div>
      </div>
    )
  }

  if (error && !discussion) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <Link to="/discusiones" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a discusiones
          </Link>

          <div className="bg-white rounded-xl shadow-sm px-6 py-6 mb-4">
            <h1 className="text-lg font-bold text-gray-800 mb-2">{discussion.title}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
              <span>{discussion.authorName}</span>
              <span>{new Date(discussion.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{discussion.content}</p>
            <div className="flex gap-1.5 flex-wrap">
              {discussion.technologies?.map(tech => (
                <span key={tech.id} className="px-2 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600">
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Comentarios ({comments?.length ?? 0})
            </h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex flex-col">
              {comments === null ? (
                <p className="py-4 text-center text-sm text-gray-400">Cargando comentarios...</p>
              ) : comments.length > 0 ? (
                comments.map(c => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    currentUserId={user?.id}
                    onDelete={handleDeleteComment}
                    onEdit={handleEditComment}
                  />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">Sin comentarios aún.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3 items-center pt-4 border-t border-gray-100 mt-3">
              <Avatar name={user?.fullName || 'U'} />
              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || sending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-40"
              >
                {sending ? '...' : 'Responder'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
