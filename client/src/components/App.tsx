import { Navigate, Route, Routes } from 'react-router-dom'
import CalendarPage from 'components/pages/CalendarPage'
import SearchPage from 'components/pages/SearchPage'
import WelcomePage from 'components/pages/WelcomePage'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  )
}

export default App
