import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'

function Logo({ className = '' }) {
  return (
    <span className={`font-bold text-blue-600 ${className}`}>
      CodefF@ctory
    </span>
  )
}

function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center h-full px-10 py-12 gap-6">
      <Logo className="text-4xl" />
      <div className="w-full max-w-xs flex flex-col gap-4">
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            ✉
          </span>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔒
          </span>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </div>
      <p className="text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline font-medium">
          Registrarse
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ onSwitch }) {
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [technologies, setTechnologies] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/technologies').then(setTechnologies).catch(() => {})
  }, [])

  function toggleTech(techId) {
    setSelected(prev =>
      prev.includes(techId) ? prev.filter(t => t !== techId) : [...prev, techId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (selected.length === 0) {
      setError('Selecciona al menos una tecnología')
      return
    }
    setLoading(true)
    try {
      await register({
        fullName: form.name,
        email: form.email,
        password: form.password,
        technologyIds: selected,
      })
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-center h-full px-10 py-12 gap-5">
      <h2 className="text-2xl font-semibold text-gray-800">Registro</h2>
      <div className="flex flex-col gap-3">
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
          <input
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📁</span>
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
          <input
            type="password"
            placeholder="Contraseña (mín. 8, 1 mayúscula, 1 número)"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {technologies.map(tech => (
          <button
            key={tech.id}
            type="button"
            onClick={() => toggleTech(tech.id)}
            className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
              selected.includes(tech.id)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {tech.name}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline font-medium">
          Iniciar sesión
        </button>
      </p>
    </form>
  )
}

export default function AuthPage() {
  const [view, setView] = useState('login')

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl flex overflow-hidden min-h-[420px]">
        {view === 'login' ? (
          <>
            <div className="w-1/2 border-r border-gray-100">
              <LoginForm onSwitch={() => setView('register')} />
            </div>
            <div className="w-1/2 bg-gray-50 flex items-center justify-center">
              <Logo className="text-3xl opacity-20" />
            </div>
          </>
        ) : (
          <>
            <div className="w-1/2 bg-gray-50 flex items-center justify-center">
              <Logo className="text-3xl opacity-20" />
            </div>
            <div className="w-1/2 border-l border-gray-100">
              <RegisterForm onSwitch={() => setView('login')} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
