import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

export default function CreateDiscussionPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '' })
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

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (!form.content.trim()) { setError('El contenido es obligatorio'); return }
    if (selectedTechIds.length === 0) { setError('Selecciona al menos una tecnología'); return }

    setLoading(true)
    try {
      await api.post('/discussions', {
        title: form.title,
        content: form.content,
        technologyIds: selectedTechIds,
      })
      navigate('/discusiones')
    } catch (err) {
      setError(err.message || 'Error al crear discusión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Nueva Discusión</h1>

          <div className="bg-white rounded-xl shadow-sm px-6 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  placeholder="Título de la discusión"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Contenido</label>
                <textarea
                  placeholder="Describe tu discusión..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/discusiones')}
                  className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear discusión'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
