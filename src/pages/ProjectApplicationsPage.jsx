import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
  WITHDRAWN: 'Retirado',
}

const STATUS_STYLES = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  ACCEPTED: 'bg-green-50 text-green-700 border-green-300',
  REJECTED: 'bg-red-50 text-red-700 border-red-300',
  WITHDRAWN: 'bg-gray-50 text-gray-500 border-gray-300',
}

function Avatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  )
}

export default function ProjectApplicationsPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [applications, setApplications] = useState(null)
  const [loadingAction, setLoadingAction] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/applications`),
    ])
      .then(([proj, apps]) => {
        setProject(proj)
        setApplications(apps)
      })
      .catch(() => {
        setApplications([])
      })
  }, [id])

  async function handleAccept(appId) {
    setLoadingAction(appId)
    try {
      const updated = await api.put(`/projects/${id}/applications/${appId}/accept`)
      setApplications(prev => prev.map(a => a.id === appId ? updated : a))
    } catch (err) {
      alert(err.message || 'Error al aceptar')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleReject(appId) {
    setLoadingAction(appId)
    try {
      const updated = await api.put(`/projects/${id}/applications/${appId}/reject`)
      setApplications(prev => prev.map(a => a.id === appId ? updated : a))
    } catch (err) {
      alert(err.message || 'Error al rechazar')
    } finally {
      setLoadingAction(null)
    }
  }

  if (applications === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Cargando postulaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <Link to="/mis-proyectos" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a mis proyectos
          </Link>

          <div className="bg-white rounded-xl shadow-sm px-6 py-6">
            <div className="mb-4">
              <h1 className="text-lg font-bold text-gray-800">Postulaciones</h1>
              {project && (
                <p className="text-sm text-gray-500 mt-1">Proyecto: {project.title}</p>
              )}
            </div>

            {applications.length > 0 ? (
              <div className="flex flex-col">
                {applications.map(app => (
                  <div key={app.id} className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
                    <Avatar name={app.applicantName} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{app.applicantName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${STATUS_STYLES[app.status] || ''}`}>
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{app.applicantEmail}</p>
                      {app.applicantBio && (
                        <p className="text-xs text-gray-500 mb-2">{app.applicantBio}</p>
                      )}
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {app.technologies?.map(tech => (
                          <span key={tech.id} className="px-2 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
                            {tech.name}
                          </span>
                        ))}
                      </div>
                      {app.githubUrl && (
                        <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                          GitHub
                        </a>
                      )}
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAccept(app.id)}
                            disabled={loadingAction === app.id}
                            className="px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 disabled:opacity-50"
                          >
                            {loadingAction === app.id ? '...' : 'Aceptar'}
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={loadingAction === app.id}
                            className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            {loadingAction === app.id ? '...' : 'Rechazar'}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No hay postulaciones aún.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
