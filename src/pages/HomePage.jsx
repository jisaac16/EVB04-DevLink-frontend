import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { api } from '../services/api'

const ITEMS_PER_PAGE = 3

function TagChip({ label }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
      {label}
    </span>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 text-sm">{project.title}</h3>
        <p className="text-xs text-gray-500">{project.description}</p>
        <div className="flex gap-1.5 flex-wrap">
          {project.technologies?.map(tech => (
            <TagChip key={tech.id} label={tech.name} />
          ))}
        </div>
      </div>
      <Link
        to={`/proyectos/${project.id}`}
        className="ml-4 shrink-0 flex items-center gap-1 px-4 py-1.5 border border-blue-500 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-50 transition-colors"
      >
        Ver más <span>›</span>
      </Link>
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

export default function HomePage() {
  const [selectedTechId, setSelectedTechId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [projects, setProjects] = useState([])
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

    api.get(`/projects?${params.toString()}`)
      .then(data => {
        if (!cancelled && mountedRef.current) {
          setProjects(data.content || [])
          setTotalPages(data.totalPages || 0)
        }
      })
      .catch(err => {
        console.error('Error al cargar proyectos:', err)
        if (!cancelled) setProjects([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedTechId, page])

  function handleSelectTech(id) {
    setSelectedTechId(prev => (prev === id ? null : id))
    setPage(0)
    setLoading(true)
  }

  function handleSearchChange(e) {
    setSearch(e.target.value)
    setPage(0)
  }

  function handlePageChange(fn) {
    setPage(fn)
    setLoading(true)
  }

  const filtered = search
    ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : projects

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedTechId} onSelect={handleSelectTech} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Descubre tu proyecto</h1>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6">
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
            ) : filtered.length > 0 ? (
              filtered.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Sin resultados.</p>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
        </main>
      </div>
    </div>
  )
}
