import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { api } from '../services/api'

const ITEMS_PER_PAGE = 10

function DiscussionCard({ discussion }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-2">
        <Link to={`/discusiones/${discussion.id}`} className="font-semibold text-gray-800 text-sm hover:text-blue-600">
          {discussion.title}
        </Link>
        <p className="text-xs text-gray-500 line-clamp-2">{discussion.content}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{discussion.authorName}</span>
          <span>{discussion.commentCount} comentarios</span>
          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {discussion.technologies?.map(tech => (
            <span key={tech.id} className="px-2 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPage(p => Math.max(0, p - 1))}
        disabled={page === 0}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i).map(n => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
            n === page
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {n + 1}
        </button>
      ))}
      <button
        onClick={() => onPage(p => Math.min(totalPages - 1, p + 1))}
        disabled={page === totalPages - 1}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm"
      >
        ›
      </button>
    </div>
  )
}

export default function DiscussionsPage() {
  const [selectedTechId, setSelectedTechId] = useState(null)
  const [page, setPage] = useState(0)
  const [discussions, setDiscussions] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false

    const params = new URLSearchParams()
    if (selectedTechId) params.append('technologyIds', selectedTechId)
    params.append('page', page)
    params.append('size', ITEMS_PER_PAGE)

    api.get(`/discussions?${params.toString()}`)
      .then(data => {
        if (!cancelled && mountedRef.current) {
          setDiscussions(data.content || [])
          setTotalPages(data.totalPages || 0)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDiscussions([])
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [selectedTechId, page])

  function handleSelectTech(id) {
    setSelectedTechId(prev => (prev === id ? null : id))
    setPage(0)
    setLoading(true)
  }

  function handlePageChange(fn) {
    setPage(fn)
    setLoading(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedTechId} onSelect={handleSelectTech} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Discusiones</h1>
            <Link
              to="/discusiones/nueva"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nueva discusión
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6">
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
            ) : discussions.length > 0 ? (
              discussions.map(d => (
                <DiscussionCard key={d.id} discussion={d} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No hay discusiones.</p>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
        </main>
      </div>
    </div>
  )
}
