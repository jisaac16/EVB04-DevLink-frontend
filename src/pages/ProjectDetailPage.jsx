import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { api } from '../services/api'

function TagChip({ label }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
      {label}
    </span>
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
  const [selectedEpica, setSelectedEpica] = useState(null)
  const [activeTab, setActiveTab] = useState('Detalles')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(setProject)
      .catch(() => setError('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [id])

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
                {['Detalles', 'Discusiones', 'Tareas'].map(tab => (
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
                  </button>
                ))}
              </div>
              {project.canApply && (
                <button className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
                  Postularme
                </button>
              )}
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
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

              <div className="flex gap-4 border-b border-gray-100 mt-2">
                {['Detalles', 'Discusiones'].map(sub => (
                  <button
                    key={sub}
                    className={`text-sm pb-2 border-b-2 transition-colors ${
                      sub === activeTab
                        ? 'text-blue-600 border-blue-600 font-medium'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {activeTab === 'Detalles' && (
                <div className="py-4">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {activeTab === 'Discusiones' && (
                <div className="py-4">
                  <p className="text-sm text-gray-400">Las discusiones se integrarán próximamente.</p>
                </div>
              )}

              {activeTab === 'Tareas' && (
                <div className="py-4">
                  <p className="text-sm text-gray-400">Las tareas se integrarán próximamente.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
