import dayjs, { Dayjs } from 'dayjs'
import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { useNavigate } from 'react-router-dom'
import Navbar from 'components/Navbar'
import './SearchPage.css'

interface BuildingMapItem {
  name: string
  abbr: string
}

const SearchPage = () => {
  const navigate = useNavigate()
  const [building, setBuilding] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [buildingMap, setBuildingMap] = useState<BuildingMapItem[]>([])

  const [showBuildingSuggestions, setShowBuildingSuggestions] = useState(false)

  const [availableRooms, setAvailableRooms] = useState<string[]>([])
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false)

  const calendarTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        paper: '#e5e5e5'
      },
      text: {
        primary: '#27272a'
      }
    },
    typography: {
      fontFamily: 'Arial, sans-serif'
    }
  })

  const fuse = useMemo(
    () =>
      new Fuse(buildingMap, {
        keys: ['name', 'abbr'],
        threshold: 0.35,
        ignoreLocation: true
      }),
    [buildingMap]
  )

  const buildingSuggestions = useMemo(() => {
    const query = building.trim()
    if (!query) {
      return []
    }

    return fuse
      .search(query, { limit: 8 })
      .map((result: { item: BuildingMapItem }) => result.item)
  }, [building, fuse])

  const activeBuildingAbbr = useMemo(() => {
    const buildingQuery = building.trim()
    if (!buildingQuery) return ''

    const exactAbbreviation = buildingMap.find(
      (item) => item.abbr.toLowerCase() === buildingQuery.toLowerCase()
    )
    const bestMatch =
      buildingSuggestions.length > 0 ? buildingSuggestions[0] : null

    return bestMatch
      ? bestMatch.abbr
      : exactAbbreviation
        ? exactAbbreviation.abbr
        : buildingQuery.toUpperCase()
  }, [building, buildingMap, buildingSuggestions])

  useEffect(() => {
    if (!activeBuildingAbbr) {
      setAvailableRooms([])
      return
    }

    const fetchRooms = async () => {
      try {
        const response = await fetch(`
          http://localhost:3000/api/rooms?building=${activeBuildingAbbr}`)
        if (response.ok) {
          const data: string[] = await response.json()
          setAvailableRooms(data)

          setRoomNumber((prevRoom) => (data.includes(prevRoom) ? prevRoom : ''))
        }
      } catch (error) {
        console.error('Failed to fetch rooms', error)
        setAvailableRooms([])
      }
    }

    const timeoutId = setTimeout(() => {
      void fetchRooms()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [activeBuildingAbbr])

  const filteredRooms = useMemo(() => {
    if (!roomNumber) return availableRooms
    return availableRooms.filter((room) => room.startsWith(roomNumber))
  }, [roomNumber, availableRooms])

  const handleSearch = () => {
    if (!building.trim() || !roomNumber.trim()) {
      return
    }

    const params = new URLSearchParams({
      building: activeBuildingAbbr,
      roomNumber: roomNumber.trim(),
      day: selectedDate.format('dddd'),
      date: selectedDate.format('YYYY-MM-DD')
    })

    navigate(`/calendar?${params.toString()}`)
  }

  useEffect(() => {
    const fetchBuildingMap = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/building-map')
        if (!response.ok) {
          throw new Error('Failed to fetch building map')
        }

        const data: BuildingMapItem[] = await response.json()
        setBuildingMap(data)
      } catch (error) {
        setBuildingMap([])
      }
    }

    void fetchBuildingMap()
  }, [])

  const suggestedAbbreviation =
    buildingSuggestions.length > 0 ? buildingSuggestions[0].abbr : ''

  return (
    <div className="search-page">
      <Navbar />

      <main className="search-page-content">
        <section className="search-panel">
          <div className="search-input-row">
            <label className="search-field">
              <span>Building:</span>
              <div className="search-building-input-wrap">
                <input
                  type="text"
                  placeholder="Search"
                  value={building}
                  onChange={(event) => {
                    setBuilding(event.target.value)
                    setShowBuildingSuggestions(true)
                  }}
                  onFocus={() => setShowBuildingSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowBuildingSuggestions(false), 120)
                  }}
                />
                {building.trim() && showBuildingSuggestions && (
                  <ul className="building-suggestions-dropdown">
                    {buildingSuggestions.length > 0 ? (
                      buildingSuggestions.map((item: BuildingMapItem) => (
                        <li key={`${item.name}-${item.abbr}`}>
                          <button
                            type="button"
                            className="building-suggestion-option"
                            onClick={() => {
                              setBuilding(item.name)
                              setShowBuildingSuggestions(false)
                            }}
                          >
                            <span>{item.name}</span>
                            <span>{item.abbr}</span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="building-suggestion-empty">
                        No matches found
                      </li>
                    )}
                  </ul>
                )}
                {suggestedAbbreviation && (
                  <small className="building-suggestion">
                    Using: {suggestedAbbreviation}
                  </small>
                )}
              </div>
            </label>

            {/* Room Dropdown (Searchable/Autocomplete) */}
            <label className="search-field">
              <span>Room # :</span>
              <div className="search-building-input-wrap">
                <input
                  type="text"
                  placeholder="Value"
                  value={roomNumber}
                  onChange={(event) => {
                    setRoomNumber(event.target.value)
                    setShowRoomSuggestions(true)
                  }}
                  onFocus={() => setShowRoomSuggestions(true)}
                  onBlur={() => {
                    // Delay to allow click events on the dropdown to register
                    setTimeout(() => setShowRoomSuggestions(false), 120)
                  }}
                />

                {showRoomSuggestions && availableRooms.length > 0 && (
                  <ul
                    className="building-suggestions-dropdown"
                    style={{ width: '100%', minWidth: '100%' }}
                  >
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <li key={room}>
                          <button
                            type="button"
                            className="building-suggestion-option"
                            onClick={() => {
                              setRoomNumber(room)
                              setShowRoomSuggestions(false)
                            }}
                          >
                            <span>{room}</span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="building-suggestion-empty">
                        No matches found
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </label>
          </div>

          <div className="search-lower-content">
            <div className="search-calendar-placeholder">
              <ThemeProvider theme={calendarTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(newDate: Dayjs | null) => {
                      if (newDate) {
                        setSelectedDate(newDate)
                      }
                    }}
                  />
                </LocalizationProvider>
              </ThemeProvider>
            </div>
          </div>

          <div className="search-submit-row">
            <button
              type="button"
              onClick={handleSearch}
              className="search-submit-button"
              disabled={!building.trim() || !roomNumber.trim()}
            >
              Search
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SearchPage
