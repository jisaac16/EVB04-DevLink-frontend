import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const PROJECTS = [
  {
    id: 1,
    title: 'Proyecto para fy proyecto',
    description: 'Este proyecto tares enors vilar rexen sistema de gestión de tarras.',
    tags: ['React', 'Python', 'Django'],
  },
  {
    id: 2,
    title: 'Proyecto para empresarios',
    description: 'Este proyecto para goredit un sistema de gestión de tareas.',
    tags: ['React', 'Python', 'Django'],
  },
  {
    id: 3,
    title: 'Proyecto para empresarios',
    description: 'Este proyecto epen enoar un sistema de gestión de tareas.',
    tags: ['React', 'Python'],
  },
]

const ITEMS_PER_PAGE = 3

function TagChip({ label }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 bg-white">
      {label}
    </span>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 text-sm">{project.title}</h3>
        <p className="text-xs text-gray-500">{project.description}</p>
        <div className="flex gap-1.5 flex-wrap">
          {project.tags.map(tag => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      </div>
      <Link
        to={`/proyectos/${project.id}`}
        className="ml-4 shrink-0 flex items-center gap-1 px-4 py-1.5 border border-blue-500 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-50 transition-colors"
      >
        Ver más <span>›</span>
      </Link>
    </div>
  )
}

function Pagination({ page, total, onPage }) {
  const pages = Math.ceil(total / ITEMS_PER_PAGE)
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm"
      >
        ‹
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
            n === page
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPage(p => Math.min(pages, p + 1))}
        disabled={page === pages}
        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-sm"
      >
        ›
      </button>
    </div>
  )
}

export default function HomePage() {
  const [selectedEpica, setSelectedEpica] = useState('React')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = PROJECTS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedEpica} onSelect={setSelectedEpica} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Descubre tu proyecto</h1>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6">
            {paginated.length > 0 ? (
              paginated.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Sin resultados.</p>
            )}
          </div>

          <Pagination page={page} total={filtered.length} onPage={setPage} />
        </main>
      </div>
    </div>
  )
}
