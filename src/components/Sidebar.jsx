const EPICAS = [
  { label: 'React', icon: '⚛' },
  { label: 'Django', icon: '🎸' },
  { label: 'JavaScript', icon: '👤' },
  { label: 'Vue.js', icon: '🌀' },
]

export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="w-44 shrink-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Épicas
      </p>
      <ul className="flex flex-col gap-1">
        {EPICAS.map(({ label, icon }) => (
          <li key={label}>
            <button
              onClick={() => onSelect(label)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                selected === label
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
