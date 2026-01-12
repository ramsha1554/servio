import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [err, setErr] = useState("")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true })
      console.log(result)
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message || "Server unreachable. Please check your connection.")
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
      console.log(result)
      setErr("")
      setStep(3)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message || "Verification failed. Please try again.")
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword != confirmPassword) {
      setErr("Passwords do not match")
      return null
    }
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true })
      setErr("")
      console.log(result)
      setLoading(false)
      navigate("/signin")
    } catch (error) {
      setErr(error?.response?.data?.message || "Reset failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6] relative overflow-hidden'>

      {/* Background Elements */}
      <div className="absolute top-[-50px] left-[-50px] w-[250px] h-[250px] bg-[#ff4d2d]/5 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[350px] h-[350px] bg-[#ff4d2d]/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fade-in-up border border-gray-100 transform transition-all hover:shadow-[0_20px_60px_-15px_rgba(255,77,45,0.1)]'>
        <div className='flex items-center gap-4 mb-8'>
          <div className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => navigate("/signin")}>
            <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] group-hover:-translate-x-1 transition-transform' />
          </div>
          <h1 className='text-2xl font-bold text-gray-800 tracking-tight'>Forgot Password</h1>
        </div>

        {step == 1 && (
          <div className="animate-fade-in-up">
            <p className="text-gray-500 mb-6 text-sm">Enter the email associated with your account and we'll send you an OTP to reset your password.</p>
            <div className='mb-6 group'>
              <label htmlFor="email" className='block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:text-[#ff4d2d]'>Email Address</label>
              <input
                type="email"
                className='w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all duration-300 placeholder-gray-400'
                placeholder='name@example.com'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <button
              className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[#ff4d2d]/30 text-white cursor-pointer flex items-center justify-center bg-[#ff4d2d]`}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Send OTP"}
            </button>
            {err && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg animate-pulse">
                <p className='text-red-500 text-center text-sm font-medium'>*{err}</p>
              </div>
            )}
          </div>
        )}

        {step == 2 && (
          <div className="animate-fade-in-up">
            <p className="text-gray-500 mb-6 text-sm">We've sent an OTP to <span className="font-semibold text-gray-700">{email}</span>. Please enter it below.</p>
            <div className='mb-6 group'>
              <label htmlFor="otp" className='block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:text-[#ff4d2d]'>One-Time Password (OTP)</label>
              <input
                type="text"
                className='w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all duration-300 placeholder-gray-400 tracking-widest text-center text-lg font-bold'
                placeholder='• • • • • •'
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
              />
            </div>
            <button
              className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[#ff4d2d]/30 text-white cursor-pointer flex items-center justify-center bg-[#ff4d2d]`}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Verify Code"}
            </button>
            {err && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg animate-pulse">
                <p className='text-red-500 text-center text-sm font-medium'>*{err}</p>
              </div>
            )}
          </div>
        )}

        {step == 3 && (
          <div className="animate-fade-in-up">
            <div className='mb-5 group'>
              <label htmlFor="newPassword" className='block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:text-[#ff4d2d]'>New Password</label>
              <input
                type="password"
                className='w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all duration-300 placeholder-gray-400'
                placeholder='Enter new password'
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
              />
            </div>
            <div className='mb-6 group'>
              <label htmlFor="ConfirmPassword" className='block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:text-[#ff4d2d]'>Confirm Password</label>
              <input
                type="password"
                className='w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all duration-300 placeholder-gray-400'
                placeholder='Confirm new password'
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </div>
            <button
              className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[#ff4d2d]/30 text-white cursor-pointer flex items-center justify-center bg-[#ff4d2d]`}
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Reset Password"}
            </button>
            {err && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg animate-pulse">
                <p className='text-red-500 text-center text-sm font-medium'>*{err}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default ForgotPassword
