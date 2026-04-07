import { useNavigate } from 'react-router-dom'
import Navbar from 'components/Navbar'

const SearchPage = () => {
  const navigate = useNavigate()

  const handleSearch = () => {
    navigate('/calendar')
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-4 text-3xl font-semibold">Search Page</h1>
        <p className="mb-8 text-gray-600">
          Template area for your future search form and filters.
        </p>

        <button
          type="button"
          onClick={handleSearch}
          className="rounded border px-6 py-3 font-medium hover:bg-gray-100"
        >
          Search
        </button>
      </main>
    </div>
  )
}

export default SearchPage
