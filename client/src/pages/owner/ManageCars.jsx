import { useEffect, useState, useCallback } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCars = () => {
  // Access global context values: owner status, axios instance, and currency
  const { isOwner, axios, currency } = useAppContext()
  
  // State to store all cars belonging to the current owner
  const [cars, setCars] = useState([])

  // Fetch owner's cars from API
  // useCallback ensures the function reference doesn't change on re-render
  const fetchOwnerCars = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      // If API call is successful, update state; otherwise, show error toast
      data.success ? setCars(data.cars) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message) // Show toast if request fails
    }
  }, [axios])

  // Toggle a car's availability (Available / Unavailable)
  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message) // Show success message
        await fetchOwnerCars() // Refresh car list after status change
      } else {
        toast.error(data.message) // Show API error message
      }
    } catch (error) {
      toast.error(error.message) // Show request error message
    }
  }

  // Delete a car after user confirms
  const deleteCar = async (carId) => {
    // Ask user for confirmation before deletion
    if (!window.confirm('Are you sure you want to delete this car?')) return

    try {
      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message) // Show success message
        await fetchOwnerCars() // Refresh car list after deletion
      } else {
        toast.error(data.message) // Show API error message
      }
    } catch (error) {
      toast.error(error.message) // Show request error message
    }
  }

  // Load cars when component mounts or owner status changes
  useEffect(() => {
    if (!isOwner) return // Only fetch cars if user is an owner

    const loadOwnerCars = async () => {
      try {
        await fetchOwnerCars() // Fetch and update owner's cars
      } catch (error) {
        console.error(error) // Log errors to console
      }
    }

    loadOwnerCars()
  }, [isOwner, fetchOwnerCars])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      {/* Page title and description */}
      <Title 
        title='Manage Cars' 
        subTitile='View all listed cars, update their details or remove them from the booking platform' 
      />
      
      {/* Cars table container */}
      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Category</th>
              <th className='p-3 font-medium'>Price</th>
              <th className='p-3 font-medium max-md:hidden'>Status</th>
              <th className='p-3 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map(car => (
              <tr key={car._id} className='border-t border-borderColor'>
                {/* Car image and basic info */}
                <td className='p-3 flex items-center gap-3'>
                  <img 
                    src={car.image} 
                    className='h-12 w-12 rounded-md object-cover' 
                    alt={`${car.brand} ${car.model}`} 
                  />
                  <div className="max-md:hidden">
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500'>
                      {car.seating_capacity} · {car.transmission}
                    </p>
                  </div>
                </td>
                
                {/* Car category */}
                <td className="p-3 max-md:hidden">{car.category}</td>
                
                {/* Car price per day */}
                <td className="p-3">{currency} {car.pricePerDay}/day</td>
                
                {/* Car availability status */}
                <td className="p-3 max-md:hidden">
                  <span className={`px-3 py-1 rounded-full text-xs ${car.isAvailable ? 'bg-gray-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {car.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                
                {/* Action buttons: toggle availability & delete */}
                <td className="flex items-center gap-3 p-3">
                  <img 
                    onClick={() => toggleAvailability(car._id)} 
                    src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon} 
                    alt="Toggle Availability" 
                    className='cursor-pointer' 
                  />
                  <img 
                    onClick={() => deleteCar(car._id)} 
                    src={assets.delete_icon} 
                    alt="Delete Car" 
                    className='cursor-pointer' 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageCars
