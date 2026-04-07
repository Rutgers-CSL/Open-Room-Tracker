import { Link } from 'react-router-dom'
import Navbar from 'components/Navbar'

const WelcomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl font-semibold">Welcome Page</h1>
        <p className="mb-8 text-base text-gray-600">
          Template content for your welcome page.
        </p>

        <Link
          to="/search"
          className="rounded border px-6 py-3 text-base font-medium hover:bg-gray-100"
        >
          Find a Room
        </Link>
      </main>
    </div>
  )
}

export default WelcomePage
