import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-5 flex flex-col items-center">
      <span className="text-3xl font-bold text-gray-800">{value}</span>
      <span className="text-sm text-gray-500 mt-1">{label}</span>
    </div>
  )
}

function TechBar({ tech, maxValue }) {
  const width = maxValue > 0 ? (tech.projectCount / maxValue) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-700 w-32 truncate">{tech.name}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="flex gap-4 text-xs text-gray-500 shrink-0">
        <span>{tech.projectCount} proyectos</span>
        <span>{tech.userCount} usuarios</span>
      </div>
    </div>
  )
}

export default function StatisticsPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/statistics').then(setStats).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  const maxProjectCount = Math.max(...(stats.mostUsedTechnologies || []).map(t => t.projectCount), 1)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <main className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Estadísticas de la comunidad</h1>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Usuarios" value={stats.totalUsers} />
            <StatCard label="Proyectos" value={stats.totalProjects} />
            <StatCard label="Discusiones" value={stats.totalDiscussions} />
            <StatCard label="Comentarios" value={stats.totalComments} />
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Tecnologías más usadas</h2>
            {stats.mostUsedTechnologies?.length > 0 ? (
              stats.mostUsedTechnologies.map(tech => (
                <TechBar key={tech.id} tech={tech} maxValue={maxProjectCount} />
              ))
            ) : (
              <p className="text-sm text-gray-400">Sin datos aún.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
