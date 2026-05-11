import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'

function Home() {
  const { userData } = useSelector(state => state.user)

  // Explicitly redirect admins to their dashboard
  if (userData?.role === "admin") {
      return <Navigate to="/admin" replace />
  }

  if (!userData) {
      return (
          <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-primary-50'>
              <h1 className='text-4xl font-bold text-primary'>Welcome to Servio</h1>
              <p className='mt-4 text-gray-600'>Please sign in to explore our delicious food delivery options.</p>
              <button 
                  onClick={() => window.location.href = "/signin"}
                  className='mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90'
              >
                  Sign In Now
              </button>
          </div>
      )
  }

  return (
    <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-primary-50'>
      {userData && (
          <>
              {userData.role === "user" && <UserDashboard />}
              {userData?.role === 'owner' && <OwnerDashboard />}
              {userData.role === "deliveryBoy" && <DeliveryBoy />}
          </>
      )}
    </div>
  )
}

export default Home
