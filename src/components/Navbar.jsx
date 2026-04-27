import { NavLink, Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/home" className="font-bold text-blue-600 text-lg">
          CodefF@ctory
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                : 'text-gray-500 hover:text-gray-800 pb-1'
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/mis-proyectos"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                : 'text-gray-500 hover:text-gray-800 pb-1'
            }
          >
            Mis proyectos
          </NavLink>
          <NavLink
            to="/discusiones"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                : 'text-gray-500 hover:text-gray-800 pb-1'
            }
          >
            Discusiones
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/proyectos/nuevo"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo proyecto
        </Link>
        <Link to="/notificaciones" className="text-gray-400 hover:text-gray-600 text-lg">🔔</Link>
        <Link to="/mensajes" className="text-gray-400 hover:text-gray-600 text-lg">✉</Link>
        <Link to="/perfil" className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-sm font-bold">
          U
        </Link>
      </div>
    </header>
  )
}
