import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'

function TagChip({ label }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
      {label}
    </span>
  )
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  )
}

const STATUS_LABELS = {
  DRAFT: 'Borrador',
  LOOKING_FOR_COLLABORATORS: 'Buscando Colaboradores',
}

const STATUS_STYLES = {
  DRAFT: 'bg-gray-50 border-gray-300 text-gray-700',
  LOOKING_FOR_COLLABORATORS: 'bg-yellow-50 border-yellow-300 text-yellow-700',
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [selectedEpica, setSelectedEpica] = useState(null)
  const [activeTab, setActiveTab] = useState('Detalles')
  const [project, setProject] = useState(null)
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')

  const isOwner = project?.creatorId === user?.id

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/applications`).catch(() => []),
    ])
      .then(([proj, apps]) => {
        setProject(proj)
        setCollaborators(apps.filter(a => a.status === 'ACCEPTED'))
      })
      .catch(() => setError('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleApply() {
    setApplying(true)
    setApplyMessage('')
    try {
      const res = await api.post(`/projects/${id}/apply`)
      setApplied(true)
      setApplyMessage(res.message || 'Postulación enviada correctamente')
    } catch (err) {
      setApplyMessage(err.message || 'Error al postularse')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error) {
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
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedEpica} onSelect={setSelectedEpica} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">Proyecto</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="flex gap-6">
                {['Detalles', 'Colaboradores'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-medium py-3 border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {tab === 'Colaboradores' && collaborators.length > 0 && (
                      <span className="ml-1 text-xs text-gray-400">({collaborators.length})</span>
                    )}
                  </button>
                ))}
              </div>
              {project.canApply && !applied && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {applying ? 'Postulando...' : 'Postularme'}
                </button>
              )}
              {applied && (
                <span className="px-3 py-1 bg-green-50 border border-green-300 text-green-700 text-xs font-medium rounded-full">
                  Postulado
                </span>
              )}
              {isOwner && (
                <Link
                  to={`/proyectos/${id}/postulaciones`}
                  className="border border-gray-300 text-gray-600 text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Ver postulaciones
                </Link>
              )}
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              {applyMessage && (
                <p className={`text-sm ${applied ? 'text-green-600' : 'text-red-500'}`}>
                  {applyMessage}
                </p>
              )}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-bold text-gray-800">{project.title}</h2>
                  <p className="text-sm text-gray-500">{project.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {project.technologies?.map(tech => (
                      <TagChip key={tech.id} label={tech.name} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Creado por {project.creatorName}
                  </p>
                </div>
                <span className={`ml-4 shrink-0 px-3 py-1 border text-xs font-medium rounded-full ${STATUS_STYLES[project.status] || ''}`}>
                  {STATUS_LABELS[project.status] || project.status}
                </span>
              </div>

              {activeTab === 'Detalles' && (
                <div className="py-4">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {activeTab === 'Colaboradores' && (
                <div className="py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar name={project.creatorName} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{project.creatorName}</p>
                      <p className="text-xs text-gray-400">Creador</p>
                    </div>
                  </div>
                  {collaborators.length > 0 ? (
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase">Colaboradores</p>
                      {collaborators.map(c => (
                        <div key={c.id} className="flex items-center gap-2">
                          <Avatar name={c.applicantName} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{c.applicantName}</p>
                            {c.applicantBio && (
                              <p className="text-xs text-gray-500">{c.applicantBio}</p>
                            )}
                            <div className="flex gap-1.5 flex-wrap mt-1">
                              {c.technologies?.map(tech => (
                                <span key={tech.id} className="px-1.5 py-0.5 rounded-full text-xs border border-gray-300 text-gray-500">
                                  {tech.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 border-t border-gray-100 pt-3">
                      Aún no hay colaboradores aceptados.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
