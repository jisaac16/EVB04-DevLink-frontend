import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    githubUrl: '',
    gitlabUrl: '',
  })
  const [technologies, setTechnologies] = useState([])
  const [selectedTechIds, setSelectedTechIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/users/me'),
      api.get('/technologies'),
    ])
      .then(([profile, techs]) => {
        setForm({
          fullName: profile.fullName || '',
          bio: profile.bio || '',
          githubUrl: profile.githubUrl || '',
          gitlabUrl: profile.gitlabUrl || '',
        })
        setSelectedTechIds(profile.technologies?.map(t => t.id) || [])
        setTechnologies(techs)
      })
      .catch(() => setError('Error al cargar perfil'))
      .finally(() => setLoading(false))
  }, [])

  function toggleTech(techId) {
    setSelectedTechIds(prev =>
      prev.includes(techId) ? prev.filter(t => t !== techId) : [...prev, techId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await api.put('/users/me', {
        fullName: form.fullName,
        bio: form.bio || undefined,
        githubUrl: form.githubUrl || undefined,
        gitlabUrl: form.gitlabUrl || undefined,
        technologyIds: selectedTechIds,
      })
      setMessage('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">Mi Perfil</h1>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {message && <p className="text-green-600 text-sm">{message}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Cuéntanos sobre ti..."
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">GitHub URL</label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/tu-usuario"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">GitLab URL</label>
                <input
                  type="url"
                  value={form.gitlabUrl}
                  onChange={e => setForm({ ...form, gitlabUrl: e.target.value })}
                  placeholder="https://gitlab.com/tu-usuario"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tecnologías</label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map(tech => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggleTech(tech.id)}
                      className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
                        selectedTechIds.includes(tech.id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {tech.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
