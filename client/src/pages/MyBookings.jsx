import { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
  // Access axios, current user, and currency from global context
  const { axios, user, currency } = useAppContext()

  // Local state to store all bookings for the current user
  const [bookings, setBookings] = useState([])

  // Fetch user's bookings when component mounts or user changes
  useEffect(() => {
    if (!user) return

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/user')
        data.success ? setBookings(data.bookings) : toast.error(data.message)
      } catch (error) {
        toast.error(error?.message || 'Failed to fetch bookings')
      }
    }

    fetchBookings()
  }, [user, axios])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-6 text-sm max-h-7xl'>
      {/* Page header */}
      <Title
        title='My Bookings'
        subtitle='View and manage all your car bookings'
        align='left'
      />

      {/* Bookings list */}
      <div>
        {bookings.map((booking, index) => (
          <div
            key={booking._id}
            className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'
          >
            {/* Car image and basic details */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img
                  src={booking.car.image}
                  alt={`${booking.car.brand} ${booking.car.model}`}
                  className='w-full h-auto aspect-video object-cover'
                />
              </div>
              <p className='text-lg font-medium mt-2'>
                {booking.car.brand} {booking.car.model}
              </p>
              <p className='text-gray-500'>
                {booking.car.year} · {booking.car.category} · {booking.car.location}
              </p>
            </div>

            {/* Booking status and rental info */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>
                <p
                  className={`px-3 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-400/15 text-green-600'
                      : 'bg-red-400/15 text-red-600'
                  }`}
                >
                  {booking.status}
                </p>
              </div>

              {/* Rental period */}
              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt='Calendar' className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
                </div>
              </div>

              {/* Pick-up location */}
              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt='Location' className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  <p>{booking.car.location}</p>
                </div>
              </div>
            </div>

            {/* Price and booking date */}
            <div className='md:col-span-1 flex flex-col justify-between gap-6 text-right text-sm text-gray-500'>
              <p>Total Price</p>
              <h1 className='text-2xl font-semibold text-primary'>
                {currency} {booking.price}
              </h1>
              <p>Booked on {booking.createdAt.split('T')[0]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyBookings
