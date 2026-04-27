import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Sidebar({ selected, onSelect }) {
  const [technologies, setTechnologies] = useState([])

  useEffect(() => {
    api.get('/technologies').then(setTechnologies).catch(() => {})
  }, [])

  return (
    <aside className="w-44 shrink-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Tecnologías
      </p>
      <ul className="flex flex-col gap-1">
        {technologies.map(({ id, name }) => (
          <li key={id}>
            <button
              onClick={() => onSelect(id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                selected === id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
