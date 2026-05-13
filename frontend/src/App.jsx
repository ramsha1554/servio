import React, { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import { useEffect } from 'react'
import { hydrateCartThunk, syncFromStorageThunk } from './redux/cartThunks'

const SignUp = lazy(() => import('./pages/SignUp'))
const SignIn = lazy(() => import('./pages/SignIn'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Home = lazy(() => import('./pages/Home'))
const CreateEditShop = lazy(() => import('./pages/CreateEditShop'))
const AddItem = lazy(() => import('./pages/AddItem'))
const EditItem = lazy(() => import('./pages/EditItem'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckOut = lazy(() => import('./pages/CheckOut'))
const OrderPlaced = lazy(() => import('./pages/OrderPlaced'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'))
const Shop = lazy(() => import('./pages/Shop'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

import { API_URL } from './config'
import ClusterModal from './components/ClusterModal'

export const serverUrl = API_URL
function App() {
  const { userData, isCheckingAuth } = useSelector(state => state.user)
  const dispatch = useDispatch()
  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  useEffect(() => {
    // 1. Initial Hydration from Cold Start
    dispatch(hydrateCartThunk());

    // 2. Storage Event Listener for Multi-Tab Sync
    const handleStorageChange = (e) => {
      // e.key is 'servio_cart_v2' for the new versioned state
      if (e.key === 'servio_cart_v2') {
        if (!e.newValue) return;
        try {
          const payload = JSON.parse(e.newValue);
          dispatch(syncFromStorageThunk(payload));
        } catch (err) {
          console.error("Storage Sync Parse Error:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);


  if (isCheckingAuth) {
    return <div className='w-full h-screen flex justify-center items-center bg-primary-50'>
      <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary'></div>
    </div>
  }

  return (
    <Suspense fallback={
      <div className='w-full h-screen flex justify-center items-center bg-primary-50'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary'></div>
      </div>
    }>
      <ClusterModal />
      <Routes>
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
        <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />
        <Route path='/' element={<Home />} />
        
        {/* Owner Routes */}
        <Route path='/create-edit-shop' element={userData?.role === 'owner' ? <CreateEditShop /> : <Navigate to={"/"} />} />
        <Route path='/add-item' element={userData?.role === 'owner' ? <AddItem /> : <Navigate to={"/"} />} />
        <Route path='/edit-item/:itemId' element={userData?.role === 'owner' ? <EditItem /> : <Navigate to={"/"} />} />
        
        <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />
        <Route path='/checkout' element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />
        <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
        <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
        <Route path='/track-order/:orderId' element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
        <Route path='/shop/:shopId' element={userData ? <Shop /> : <Navigate to={"/signin"} />} />
        
        {/* Admin Routes */}
        <Route path='/admin/*' element={userData?.role === 'admin' ? <AdminDashboard /> : <Navigate to={"/"} />} />
        
        {/* Catch-All 404 Route */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
