import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const PROJECT = {
  id: 1,
  title: 'Sistema de Gestión de Tareas',
  description:
    'Este proyecto busca desarrollar un sistema de gestión de tareas colaborativo.',
  tags: ['React', 'Python', 'Django'],
  status: 'Buscando Colaboradores',
}

const COMMENTS = [
  {
    id: 1,
    author: 'Carlos User',
    time: '4 / 12 · Proyrmda',
    text: 'Estey pensondo en user Django con React para la arquitectura ¿Qué opinan?',
  },
  {
    id: 2,
    author: 'Iván User',
    time: '4 / J2 · Proyrmda',
    text: 'Me parece genal; podemoa user Django como backend y React en el frontend.',
  },
]

const TABS = ['Detalles', 'Discusiones', 'tareas (3)']

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
      {name[0]}
    </div>
  )
}

function Comment({ comment }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <Avatar name={comment.author} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{comment.author}</span>
          <span className="text-xs text-gray-400">{comment.time}</span>
        </div>
        <p className="text-sm text-gray-600">{comment.text}</p>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [selectedEpica, setSelectedEpica] = useState('React')
  const [activeTab, setActiveTab] = useState('Detalles')
  const [comment, setComment] = useState('')
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <Sidebar selected={selectedEpica} onSelect={setSelectedEpica} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">Proyecto</h1>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="flex gap-6">
                {TABS.map(tab => (
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
              <button className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
                Postularme
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Project header */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-bold text-gray-800">{PROJECT.title}</h2>
                  <p className="text-sm text-gray-500">{PROJECT.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {PROJECT.tags.map(tag => (
                      <TagChip key={tag} label={tag} />
                    ))}
                  </div>
                </div>
                <span className="ml-4 shrink-0 px-3 py-1 bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs font-medium rounded-full">
                  {PROJECT.status}
                </span>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-4 border-b border-gray-100 mt-2">
                {['Detalles', 'Discusiones'].map(sub => (
                  <button
                    key={sub}
                    className={`text-sm pb-2 border-b-2 transition-colors ${
                      sub === 'Detalles'
                        ? 'text-blue-600 border-blue-600 font-medium'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Comments */}
              <div className="flex flex-col">
                {COMMENTS.map(c => (
                  <Comment key={c.id} comment={c} />
                ))}
              </div>

              {/* Comment input */}
              <div className="flex gap-3 items-center pt-2">
                <Avatar name="U" />
                <input
                  type="text"
                  placeholder="Escribe un comentario..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-40"
                >
                  Responder
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
