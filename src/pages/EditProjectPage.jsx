import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

function TagChip({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
        selected
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
      }`}
    >
      {label}
    </button>
  )
}

export default function EditProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [technologies, setTechnologies] = useState([])
  const [selectedTechIds, setSelectedTechIds] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProject, setLoadingProject] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get('/technologies'),
    ])
      .then(([project, techs]) => {
        setForm({ title: project.title, description: project.description })
        setSelectedTechIds(project.technologies?.map(t => t.id) || [])
        setTechnologies(techs)
      })
      .catch(() => setError('Error al cargar el proyecto'))
      .finally(() => setLoadingProject(false))
  }, [id])

  function toggleTech(techId) {
    setSelectedTechIds(prev =>
      prev.includes(techId) ? prev.filter(t => t !== techId) : [...prev, techId]
    )
  }

  function validate() {
    if (!form.title.trim()) return 'El título es obligatorio'
    if (!form.description.trim()) return 'La descripción es obligatoria'
    if (selectedTechIds.length === 0) return 'Selecciona al menos una tecnología'
    return null
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      await api.put(`/projects/${id}`, {
        title: form.title,
        description: form.description,
        technologyIds: selectedTechIds,
      })
      navigate('/mis-proyectos')
    } catch (err) {
      setError(err.message || 'Error al guardar borrador')
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish(e) {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      await api.put(`/projects/${id}`, {
        title: form.title,
        description: form.description,
        technologyIds: selectedTechIds,
      })
      await api.put(`/projects/${id}/publish`)
      navigate('/mis-proyectos')
    } catch (err) {
      setError(err.message || 'Error al publicar proyecto')
    } finally {
      setLoading(false)
    }
  }

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Editar Proyecto</h1>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <form className="px-6 py-6 flex flex-col gap-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Título del Proyecto</label>
                <input
                  type="text"
                  placeholder="Título del Proyecto"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  placeholder="Descripción del proyecto..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tecnologías</label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map(tech => (
                    <TagChip
                      key={tech.id}
                      label={tech.name}
                      selected={selectedTechIds.includes(tech.id)}
                      onToggle={() => toggleTech(tech.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/mis-proyectos')}
                  className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar borrador'}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
