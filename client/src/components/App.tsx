import React, { useEffect, useState } from "react";
import "./App.css";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
type Day = (typeof DAY_OPTIONS)[number];

const API_BASE_URL = "http://localhost:3000"; 
// Day view config
const DAY_START_HOUR = 7;   // 8 AM
const DAY_END_HOUR = 23;    // 11 PM
const PIXELS_PER_MINUTE = 1; // 60px per hour

interface Booking {
  start_time: string; // "0830"
  end_time: string;   // "0950"
}

// Convert "0830" -> minutes since midnight
function timeStrToMinutes(t: string): number {
  if (!t || t.length !== 4) return 0;
  const h = parseInt(t.slice(0, 2), 10);
  const m = parseInt(t.slice(2), 10);
  return h * 60 + m;
}

// Convert minutes to "8:30 AM"
function minutesToLabel(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${suffix}`;
}

// "8 AM", "9 AM", etc for the left column
function hourLabel(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12} ${suffix}`;
}

const HOURS: number[] = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => DAY_START_HOUR + i
);

const App: React.FC = () => {
  const [building, setBuilding] = useState<string>("HLL");
  const [roomNumber, setRoomNumber] = useState<string>("114");
  const [day, setDay] = useState<Day>("Monday");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function fetchBookings() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        building,
        roomNumber,
        day,
      });

      // If using Vite proxy, API_BASE_URL is "", so this becomes "/api/..."
      const res = await fetch(`${API_BASE_URL}/api/bookings?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: Booking[] = await res.json();
      if(data.length === 0){
        setError("No bookings found for the specified room and day.");
      }
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings. Make sure the backend is running.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dayStartMinutes = DAY_START_HOUR * 60;
  const dayEndMinutes = DAY_END_HOUR * 60;
  const calendarHeight =
    (DAY_END_HOUR - DAY_START_HOUR) * 60 * PIXELS_PER_MINUTE;

  return (
    <div className="app">
      <header className="header">
        <h1>Open Classroom Tracker (Demo)</h1>
        <p>Day view of bookings for a single room.</p>
      </header>

      <section className="search-card">
        <form
          className="search-form"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            fetchBookings();
          }}
        >
          <div className="field">
            <label>Building</label>
            <input
              type="text"
              value={building}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBuilding(e.target.value.toUpperCase())
              }
              required
            />
          </div>

          <div className="field">
            <label>Room Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRoomNumber(e.target.value)
              }
              required
            />
          </div>

          <div className="field">
            <label>Day</label>
            <select
              value={day}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDay(e.target.value as Day)
              }
              required
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Fetch Bookings"}
          </button>
        </form>
        <p className="hint">
          Showing: {building} {roomNumber} on {day}
        </p>
        {error && <p className="error">{error}</p>}
      </section>

      <main className="main">
        <section className="calendar-section">
          <h2>
            {building} {roomNumber} — {day}
          </h2>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="day-view">
              {/* Left time column */}
              <div className="time-column">
                {HOURS.map((h) => (
                  <div className="time-row" key={h}>
                    <span className="time-label">{hourLabel(h)}</span>
                  </div>
                ))}
              </div>

              {/* Events column */}
              <div className="events-column">
                <div
                  className="events-grid"
                  style={{ height: calendarHeight }}
                >
                  {/* Hour lines */}
                  {HOURS.map((h) => {
                    const top =
                      (h * 60 - dayStartMinutes) * PIXELS_PER_MINUTE;
                    return (
                      <div
                        key={h}
                        className="hour-line"
                        style={{ top }}
                      />
                    );
                  })}

                  {/* Booking blocks */}
                  {bookings.map((b, idx) => {
                    const start = timeStrToMinutes(b.start_time);
                    const end = timeStrToMinutes(b.end_time);

                    const clampedStart = Math.max(start, dayStartMinutes);
                    const clampedEnd = Math.min(end, dayEndMinutes);

                    const top =
                      (clampedStart - dayStartMinutes) * PIXELS_PER_MINUTE;
                    const height = Math.max(
                      (clampedEnd - clampedStart) * PIXELS_PER_MINUTE,
                      24 // min height so very short blocks are still visible
                    );

                    return (
                      <div
                        key={idx}
                        className="event-block"
                        style={{ top, height }}
                      >
                        <div className="event-time">
                          {minutesToLabel(start)} – {minutesToLabel(end)}
                        </div>
                        <div className="event-title">Booked</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="sidebar">
          <h3>Booked blocks</h3>
          {bookings.length === 0 && !loading && (
            <p className="muted">No bookings for this room/day.</p>
          )}
          <div className="bookings-list">
            {bookings.map((b, idx) => (
              <div key={idx} className="booking-card">
                {minutesToLabel(timeStrToMinutes(b.start_time))} –{" "}
                {minutesToLabel(timeStrToMinutes(b.end_time))}
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
