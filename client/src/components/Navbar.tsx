import { Link } from 'react-router-dom'
import Logo from 'components/Logo'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link to="/welcome" className="inline-flex items-center">
        <Logo />
      </Link>

      <div className="flex gap-4 text-sm">
        <Link to="/welcome">Welcome</Link>
        <Link to="/search">Search</Link>
        <Link to="/calendar">Calendar</Link>
      </div>
    </nav>
  )
}

export default Navbar
