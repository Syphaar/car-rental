import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Title from '../components/Title'
import CarCard from '../components/CarCard'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Cars = () => {
  // Get search parameters from URL
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  // Access all cars and axios instance from context
  const { cars, axios } = useAppContext()

  // Local state for search input and filtered availability
  const [searchInput, setSearchInput] = useState('')
  const [availableCars, setAvailableCars] = useState([])

  // Determine if search criteria are present
  const hasSearchCriteria = pickupLocation && pickupDate && returnDate

  // Fetch available cars when search criteria exist
  useEffect(() => {
    if (!hasSearchCriteria) return

    const fetchAvailableCars = async () => {
      try {
        const { data } = await axios.post('/api/bookings/check-availability', {
          location: pickupLocation,
          pickupDate,
          returnDate,
        })

        if (data.success) {
          setAvailableCars(data.availableCars)
          if (data.availableCars.length === 0) toast('No cars available')
        }
      } catch {
        toast.error('Failed to check car availability')
      }
    }

    fetchAvailableCars()
  }, [hasSearchCriteria, pickupLocation, pickupDate, returnDate, axios])

  // Base list: either all cars or only available cars
  const carsToDisplay = hasSearchCriteria ? availableCars : cars

  // Filter cars based on user search input (brand, model, category, transmission)
  const filteredCars = useMemo(() => {
    if (!searchInput) return carsToDisplay

    const inputLower = searchInput.toLowerCase()
    return carsToDisplay.filter(car =>
      car.brand.toLowerCase().includes(inputLower) ||
      car.model.toLowerCase().includes(inputLower) ||
      car.category.toLowerCase().includes(inputLower) ||
      car.transmission.toLowerCase().includes(inputLower)
    )
  }, [searchInput, carsToDisplay])

  return (
    <div>
      {/* Page header and search bar */}
      <div className='flex flex-col items-center py-20 bg-light md:px-4'>
        <Title
          title='Available Cars'
          subtitle='Browse our selection of premium vehicles available for your next adventure'
        />

        <div className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow">
          <img src={assets.search_icon} alt="Search" className='w-4.5 h-4.5 mr-2' />
          <input
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            placeholder='Search by make, model, category or transmission'
            className='w-full h-full outline-none text-gray-500'
          />
          <img src={assets.filter_icon} alt="Filter" className='w-4.5 h-4.5 ml-2' />
        </div>
      </div>

      {/* Cars grid */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>
          Showing {filteredCars.length} Cars
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
          {filteredCars.map(car => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Cars
