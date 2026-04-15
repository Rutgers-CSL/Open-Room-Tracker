import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from 'components/Navbar'
import './CalendarPage.css'

interface Booking {
  start_time: string
  end_time: string
}

const DAY_START_HOUR = 7
const DAY_END_HOUR = 23
const PIXELS_PER_MINUTE = 1.1

const toMinutes = (time: string) => {
  const hours = Number.parseInt(time.slice(0, 2), 10)
  const minutes = Number.parseInt(time.slice(2, 4), 10)
  return hours * 60 + minutes
}

const minutesToLabel = (minutes: number) => {
  const hour24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = ((hour24 + 11) % 12) + 1
  return `${hour12}:${mins.toString().padStart(2, '0')} ${suffix}`
}

const CalendarPage = () => {
  const [searchParams] = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const building = searchParams.get('building') ?? ''
  const roomNumber = searchParams.get('roomNumber') ?? ''
  const day = searchParams.get('day') ?? ''
  const date = searchParams.get('date') ?? ''

  const hours = useMemo(
    () =>
      Array.from(
        { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
        (_, index) => DAY_START_HOUR + index
      ),
    []
  )

  useEffect(() => {
    const fetchBookings = async () => {
      if (!building || !roomNumber || !day) {
        return
      }

      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          building,
          roomNumber,
          day
        })
        const response = await fetch(
          `http://localhost:3000/api/bookings?${params.toString()}`
        )

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data: Booking[] = await response.json()
        setBookings(data)
      } catch (fetchError) {
        setBookings([])
        setError('Could not load bookings for this room and day.')
      } finally {
        setLoading(false)
      }
    }

    void fetchBookings()
  }, [building, roomNumber, day])

  const dayStartMinutes = DAY_START_HOUR * 60
  const dayEndMinutes = DAY_END_HOUR * 60
  const calendarHeight = (dayEndMinutes - dayStartMinutes) * PIXELS_PER_MINUTE

  return (
    <div className="calendar-page">
      <Navbar />

      <main className="calendar-page-content">
        <section className="calendar-panel">
          <header className="calendar-header-row">
            <h1>
              {building && roomNumber
                ? `${building} ${roomNumber}`
                : 'Room Calendar'}
            </h1>
            <p>{date ? `${date} (${day})` : day}</p>
          </header>

          {error && <p className="calendar-error">{error}</p>}

          <div className="day-calendar-layout">
            <div className="time-column">
              {hours.map((hour) => (
                <div key={hour} className="time-row">
                  {minutesToLabel(hour * 60).replace(':00', '')}
                </div>
              ))}
            </div>

            <div className="events-column">
              {loading ? (
                <div className="calendar-loading">Loading bookings...</div>
              ) : (
                <div
                  className="events-grid"
                  style={{ height: `${calendarHeight}px` }}
                >
                  {hours.map((hour) => {
                    const top =
                      (hour * 60 - dayStartMinutes) * PIXELS_PER_MINUTE
                    return (
                      <div
                        key={hour}
                        className="hour-line"
                        style={{ top: `${top}px` }}
                      />
                    )
                  })}

                  {bookings.map((booking, index) => {
                    const start = toMinutes(booking.start_time)
                    const end = toMinutes(booking.end_time)
                    const clampedStart = Math.max(start, dayStartMinutes)
                    const clampedEnd = Math.min(end, dayEndMinutes)

                    if (clampedEnd <= clampedStart) {
                      return null
                    }

                    const top =
                      (clampedStart - dayStartMinutes) * PIXELS_PER_MINUTE
                    const height = Math.max(
                      (clampedEnd - clampedStart) * PIXELS_PER_MINUTE,
                      20
                    )

                    return (
                      <div
                        key={`${booking.start_time}-${booking.end_time}-${index}`}
                        className="booking-block"
                        style={{ top: `${top}px`, height: `${height}px` }}
                        title={`${minutesToLabel(start)} - ${minutesToLabel(
                          end
                        )}`}
                      >
                        Booked
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="calendar-footer-action">
            <Link to="/search" className="calendar-back-to-search">
              Search for another room
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CalendarPage
