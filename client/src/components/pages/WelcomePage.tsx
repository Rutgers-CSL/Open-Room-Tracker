import { Link } from 'react-router-dom'
import './WelcomePage.css'

const WelcomePage = () => {
  return (
    <div className="welcome-page">
      <main className="welcome-content">
        <h1 className="welcome-logo-text">
          <span className="welcome-logo-ru">RU</span>
          <span className="welcome-logo-open">Open</span>
        </h1>
        <Link to="/search" className="welcome-search-button">
          Search
        </Link>
      </main>
    </div>
  )
}

export default WelcomePage
