import { Link } from 'react-router-dom'
import Logo from 'components/Logo'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="site-navbar">
      <Link to="/welcome" className="site-navbar-logo-link">
        <Logo />
      </Link>

      <div className="site-navbar-links">
        <Link to="/welcome">Home</Link>
        <a href="#about">About Us</a>
      </div>
    </nav>
  )
}

export default Navbar
