import Navbar from 'components/Navbar'

const CalendarPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="mb-4 text-3xl font-semibold">Calendar Page</h1>
        <p className="text-gray-600">
          Template area for the room availability calendar view.
        </p>
      </main>
    </div>
  )
}

export default CalendarPage
