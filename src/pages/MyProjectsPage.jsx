import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { api } from '../services/api'

const ITEMS_PER_PAGE = 3

const STATUS_LABELS = {
  DRAFT: 'Borrador',
  LOOKING_FOR_COLLABORATORS: 'Publicado',
}

const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-600',
  LOOKING_FOR_COLLABORATORS: 'bg-green-50 text-green-700',
}

function TagChip({ label }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
      {label}
    </span>
  )
}

function ProjectCard({ project, tab, onPublish }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800 text-sm">{project.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[project.status] || ''}`}>
            {STATUS_LABELS[project.status] || project.status}
          </span>
        </div>
        <p className="text-xs text-gray-500">{project.description}</p>
        <div className="flex gap-1.5 flex-wrap">
          {project.technologies?.map(tech => (
            <TagChip key={tech.id} label={tech.name} />
          ))}
        </div>
        {tab === 'drafts' && (
          <div className="flex gap-2 mt-1">
            <Link
              to={`/proyectos/${project.id}/editar`}
              className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={() => onPublish(project.id)}
              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Publicar
            </button>
          </div>
        )}
      </div>
      <div className="ml-4 shrink-0 flex flex-col gap-1">
        <Link
          to={`/proyectos/${project.id}`}
          className="flex items-center justify-center gap-1 px-4 py-1.5 border border-blue-500 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-50 transition-colors text-center"
        >
          Ver más
        </Link>
        {tab === 'published' && (
          <Link
            to={`/proyectos/${project.id}/postulaciones`}
            className="flex items-center justify-center px-4 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
          >
            Postulaciones
          </Link>
        )}
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

export default function MyProjectsPage() {
  const [selectedTechId, setSelectedTechId] = useState(null)
  const [tab, setTab] = useState('published')
  const [page, setPage] = useState(0)
  const [projects, setProjects] = useState(null)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedTechId) params.append('technologyIds', selectedTechId)
    params.append('page', page)
    params.append('size', ITEMS_PER_PAGE)

    const endpoint = tab === 'drafts'
      ? `/projects/my/drafts?${params.toString()}`
      : `/projects/my?${params.toString()}`

    api.get(endpoint)
      .then(data => {
        setProjects(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => {
        setProjects([])
      })
  }, [selectedTechId, page, tab])

  function handleSelectTech(id) {
    setSelectedTechId(prev => (prev === id ? null : id))
    setPage(0)
  }

  function handleTabChange(newTab) {
    setTab(newTab)
    setPage(0)
    setProjects(null)
  }

  async function handlePublish(projectId) {
    try {
      await api.put(`/projects/${projectId}/publish`)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      alert(err.message || 'Error al publicar')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedTechId} onSelect={handleSelectTech} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Mis Proyectos</h1>
            <Link
              to="/proyectos/nuevo"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nuevo proyecto
            </Link>
          </div>

          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => handleTabChange('published')}
              className={`text-sm font-medium py-2 border-b-2 transition-colors ${
                tab === 'published'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => handleTabChange('drafts')}
              className={`text-sm font-medium py-2 border-b-2 transition-colors ${
                tab === 'drafts'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Borradores
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6">
            {projects === null ? (
              <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
            ) : projects.length > 0 ? (
              projects.map(project => (
                <ProjectCard key={project.id} project={project} tab={tab} onPublish={handlePublish} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                {tab === 'drafts' ? 'No tienes borradores.' : 'No tienes proyectos publicados.'}
              </p>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </main>
      </div>
    </div>
  )
}
