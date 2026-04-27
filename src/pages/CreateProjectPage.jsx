import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
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

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [selectedEpica, setSelectedEpica] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const [technologies, setTechnologies] = useState([])
  const [selectedTechIds, setSelectedTechIds] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/technologies').then(setTechnologies).catch(() => {})
  }, [])

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

  async function handleSaveDraft(e) {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      await api.post('/projects', {
        title: form.title,
        description: form.description,
        technologyIds: selectedTechIds,
      })
      navigate('/home')
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
      const project = await api.post('/projects', {
        title: form.title,
        description: form.description,
        technologyIds: selectedTechIds,
      })
      await api.put(`/projects/${project.id}/publish`)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Error al publicar proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedEpica} onSelect={setSelectedEpica} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">Crear Proyecto</h1>
            <button
              onClick={() => navigate('/proyectos/nuevo')}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nuevo proyecto
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 border-b-2 border-blue-600 py-3">
                  Título del Proyecto
                  <span className="text-gray-400 text-xs border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center">
                    i
                  </span>
                </button>
              </div>
            </div>

            <form className="px-6 py-6 flex flex-col gap-5">
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Título del Proyecto
                </label>
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
                <textarea
                  placeholder="Descripción del proyecto..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
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
