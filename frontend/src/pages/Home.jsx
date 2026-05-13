import React from 'react'
// Force Redeploy: 2026-05-13T23:26:00Z - Premium Landing Fix
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'

// New Landing Components
import LandingNavbar from '../components/Landing/LandingNavbar'
import LandingHero from '../components/Landing/LandingHero'
import LandingOffers from '../components/Landing/LandingOffers'
import LandingFoodGallery from '../components/Landing/LandingFoodGallery'
import LandingFooter from '../components/Landing/LandingFooter'

function Home() {
  const { userData } = useSelector(state => state.user)

  // Explicitly redirect admins to their dashboard
  if (userData?.role === "admin") {
      return <Navigate to="/admin" replace />
  }

  // PUBLIC LANDING PAGE (Unauthenticated)
  if (!userData) {
      return (
          <div className='w-full min-h-screen bg-white'>
              <LandingNavbar />
              <LandingHero />
              <LandingOffers />
              <LandingFoodGallery />
              <LandingFooter />
          </div>
      )
  }

  // PRIVATE DASHBOARDS (Authenticated)
  return (
    <div className='w-full min-h-screen pt-[100px] bg-[#fff9f6]'>
      {userData && (
          <div className="max-w-7xl mx-auto px-6">
              {userData.role === "user" && <UserDashboard />}
              {userData?.role === 'owner' && <OwnerDashboard />}
              {userData.role === "deliveryBoy" && <DeliveryBoy />}
          </div>
      )}
    </div>
  )
}

export default Home
