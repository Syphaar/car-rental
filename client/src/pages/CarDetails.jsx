import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Loader from '../components/Loader';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CarDetails = () => {
  const { id } = useParams(); // Car ID from URL
  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext();
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  // Find the car in the cars list
  const car = cars.find(carItem => carItem._id === id);

  // Handle booking submission
  const handleSubmit = async (submit) => {
    submit.preventDefault();
    try {
      const { data } = await axios.post('/api/bookings/create', { car: id, pickupDate, returnDate });
      if (data.success) {
        toast.success(data.message);
        navigate('/my-bookings'); // Go to user's bookings page
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Show loader if car not found yet
  if (!car) return <Loader />;

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'
      >
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all Cars
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Car info section */}
        <div className='lg:col-span-2'>
          <img src={car.image} alt="" className='h-auto md:max-h-100 w-full object-cover rounded-xl mb-6 shadow-md' />

          <div className="space-y-6">
            {/* Title and category */}
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} · {car.year}</p>
            </div>

            <hr className='border-borderColor my-6' />

            {/* Car specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location }
              ].map(({ icon, text }) => (
                <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 m-2' />
                  {text}
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {/* Features */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {['360', 'Bluetooth', 'GPS', 'Heated Seats', 'Rear View Mirror'].map(feature => (
                  <li key={feature} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking section */}
        <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>
          {/* Price */}
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
            {currency} {car.pricePerDay}
            <span className='text-base text-gray-400 font-normal'>per day</span>
          </p>

          <hr className='border-borderColor my-6' />

          {/* Pickup date */}
          <div className='flex flex-col gap-2'>
            <label>Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={e => setPickupDate(e.target.value)}
              className='border border-borderColor px-3 py-2 rounded-lg'
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Return date */}
          <div className='flex flex-col gap-2'>
            <label>Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              className='border border-borderColor px-3 py-2 rounded-lg'
              required
            />
          </div>

          <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl'>
            Book Now
          </button>

          <p className='text-center text-sm'>No credit card required to reserve</p>
        </form>
      </div>
    </div>
  );
};

export default CarDetails;
