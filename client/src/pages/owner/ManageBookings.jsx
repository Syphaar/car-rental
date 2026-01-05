import { useEffect, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ManageBookings = () => {
  const { currency, axios } = useAppContext();
  const [bookingsList, setBookingsList] = useState([]);

  // Update booking status without refetching entire list
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { data } = await axios.post('/api/bookings/change-status', { bookingId, status: newStatus });
      if (data.success) {
        toast.success(data.message);
        setBookingsList((previousBookings) =>
          previousBookings.map((booking) =>
            booking._id === bookingId ? { ...booking, status: newStatus } : booking
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update booking status');
    }
  };

  // Fetch all bookings for the owner
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/owner');
        if (data.success) {
          setBookingsList(data.bookings);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error?.message || 'Failed to load bookings');
      }
    };
    fetchBookings();
  }, [axios]);

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      {/* Page title */}
      <Title title="Manage Bookings" subTitile="Track all user bookings, approve or cancel requests, and manage booking statuses." />

      {/* Bookings table */}
      <div className="max-w-3xl w-full rounded-md border border-borderColor mt-6 overflow-hidden">
        <table className="w-full text-sm text-gray-600 border-collapse">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Date Range</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium max-md:hidden">Payment</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingsList.map((bookingItem) => (
              <tr key={bookingItem._id} className="border-t border-borderColor text-gray-500">
                {/* Car info */}
                <td className="p-3 flex items-center gap-3">
                  <img src={bookingItem.car.image} alt={`${bookingItem.car.brand} ${bookingItem.car.model}`}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <p className="font-medium max-md:hidden">
                    {bookingItem.car.brand} {bookingItem.car.model}
                  </p>
                </td>

                {/* Date range */}
                <td className="p-3 max-md:hidden">
                  {bookingItem.pickupDate.split('T')[0]} to {bookingItem.returnDate.split('T')[0]}
                </td>

                {/* Total price */}
                <td className="p-3">{currency} {bookingItem.price}</td>

                {/* Payment status */}
                <td className="p-3 max-md:hidden">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">offline</span>
                </td>

                {/* Actions: update status or display current status */}
                <td className="p-3">
                  {bookingItem.status === 'pending' ? (
                    <select value={bookingItem.status} onChange={(change) => updateBookingStatus(bookingItem._id, change.target.value)}
                      className="px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bookingItem.status === 'confirmed'
                          ? 'bg-green-100 text-green-500'
                          : 'bg-red-100 text-red-500'
                      }`}
                    >
                      {bookingItem.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;
