import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignIn() {
    const primaryColor = "#ff4d2d";
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const handleSignIn = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true })
            dispatch(setUserData(result.data))
            setErr("")
            setLoading(false)
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        try {
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                email: result.user.email,
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-[#fff9f6] relative overflow-hidden'>

            {/* Decorative Background Elements */}
            <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#ff4d2d]/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#ff4d2d]/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-gray-100 opacity-0 animate-fade-in-up relative z-10 transform transition-all hover:shadow-[0_20px_60px_-15px_rgba(255,77,45,0.15)]`}>

                <div className="text-center mb-10">
                    <h1 className={`text-4xl font-extrabold mb-3 tracking-tight`} style={{ color: primaryColor }}>Servio</h1>
                    <p className='text-gray-500 text-sm font-medium'>Welcome back! Tasty food awaits.</p>
                </div>

                {/* email */}
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

                {/* password*/}
                <div className='mb-6 group'>
                    <label htmlFor="password" className='block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:text-[#ff4d2d]'>Password</label>
                    <div className='relative'>
                        <input
                            type={`${showPassword ? "text" : "password"}`}
                            className='w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all duration-300 placeholder-gray-400 pr-12'
                            placeholder='••••••••'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <button
                            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ff4d2d] transition-colors cursor-pointer p-1'
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                        </button>
                    </div>
                </div>

                <div className='text-right mb-8'>
                    <span className='text-sm font-semibold cursor-pointer text-gray-500 hover:text-[#ff4d2d] transition-colors' onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                    </span>
                </div>

                <button
                    className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[#ff4d2d]/30 text-white cursor-pointer flex items-center justify-center`}
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleSignIn}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign In"}
                </button>

                {err && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg animate-pulse">
                        <p className='text-red-500 text-center text-sm font-medium'>*{err}</p>
                    </div>
                )}

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
                    </div>
                </div>

                <button
                    className='w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 cursor-pointer group'
                    onClick={handleGoogleAuth}
                >
                    <FcGoogle size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-gray-700">Sign In with Google</span>
                </button>

                <p className='text-center mt-8 text-gray-600 font-medium'>
                    New to Servio? <span className='text-[#ff4d2d] font-bold hover:underline cursor-pointer ml-1' onClick={() => navigate("/signup")}>Create account</span>
                </p>
            </div>
        </div>
    )
}

export default SignIn
