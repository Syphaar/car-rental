import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { axios, isOwner, currency } = useAppContext()

  // State to store all dashboard metrics
  const [dashboardData, setDashboardData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  // Cards displayed at the top of dashboard
  const cards = [
    { title: 'Total Cars', value: dashboardData.totalCars, icon: assets.carIconColored },
    { title: 'Total Bookings', value: dashboardData.totalBookings, icon: assets.listIconColored },
    { title: 'Pending', value: dashboardData.pendingBookings, icon: assets.cautionIconColored },
    { title: 'Confirmed', value: dashboardData.completedBookings, icon: assets.listIconColored },
  ]

  // Fetch dashboard data if the user is owner
  useEffect(() => {
    if (!isOwner) return

    const fetchData = async () => {
      try {
        const { data: response } = await axios.get('/api/owner/dashboard')
        if (response.success) setDashboardData(response.dashboardData)
        else toast.error(response.message)
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch dashboard data')
      }
    }

    fetchData()
  }, [isOwner, axios])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      {/* Page title */}
      <Title title='Admin Dashboard' subTitile='Monitor platform performance: cars, bookings, revenue, and recent activity' />

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl">
        {cards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor'>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt={card.title} className='w-4 h-4' />
            </div>
          </div>
        ))}
      </div>

      {/* Recent bookings and monthly revenue */}
      <div className="flex flex-wrap items-start gap-6 mb-8 w-full">
        {/* Recent bookings */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full'>
          <h1 className='text-lg font-medium'>Recent Bookings</h1>
          <p className='text-gray-500'>Latest customer bookings</p>
          {dashboardData.recentBookings.map((booking, i) => (
            <div key={i} className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                  <img src={assets.listIconColored} className='h-5 w-5' alt="" />
                </div>
                <div>
                  <p>{booking.car.brand} {booking.car.model}</p>
                  <p className='text-sm text-gray-500'>{booking.createdAt.split('T')[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <p className='text-sm text-gray-500'>{currency}{booking.price}</p>
                <p className='px-3 py-0.5 border border-borderColor rounded-full text-sm'>{booking.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly revenue */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md w-full md:max-w-xs'>
          <h1 className='text-lg font-medium'>Monthly Revenue</h1>
          <p className='text-gray-500'>Revenue for current month</p>
          <p className='text-3xl mt-6 font-semibold text-primary'>{currency}{dashboardData.monthlyRevenue}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
