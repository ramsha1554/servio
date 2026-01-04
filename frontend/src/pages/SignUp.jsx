import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("user")
    const navigate = useNavigate()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    // Dynamic Theme Logic
    const theme = {
        user: { color: "primary", border: "focus:border-primary", ring: "focus:ring-primary/20", text: "text-primary", bg: "bg-primary", hoverText: "hover:text-primary", hoverBg: "hover:bg-primary" },
        owner: { color: "accent", border: "focus:border-accent", ring: "focus:ring-accent/20", text: "text-accent", bg: "bg-accent", hoverText: "hover:text-accent", hoverBg: "hover:bg-accent" },
        deliveryBoy: { color: "secondary", border: "focus:border-secondary", ring: "focus:ring-secondary/20", text: "text-secondary", bg: "bg-secondary", hoverText: "hover:text-secondary", hoverBg: "hover:bg-secondary" }
    }
    const currentTheme = theme[role]

    const handleSignUp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName, email, password, mobile, role
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
        if (!mobile) {
            return setErr("Mobile number is required for Google Sign-up")
        }
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        try {
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                role,
                mobile
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden'>

            {/* Decorative Background Elements - Multi-colored vibrancy */}
            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-[20%] left-[20%] w-[200px] h-[200px] bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2.5s' }}></div>


            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md p-8 md:p-10 border border-gray-100 opacity-0 animate-fade-in-up relative z-10 my-8 transform transition-all hover:shadow-2xl`}>
                <div className="text-center mb-8">
                    <h1 className={`text-4xl font-extrabold mb-3 tracking-tight ${currentTheme.text} transition-colors duration-300`}>Servio</h1>
                    <p className='text-gray-500 text-sm font-medium'>Join us and start your delicious journey.</p>
                </div>

                {/* fullName */}
                <div className='mb-5 group'>
                    <label htmlFor="fullName" className={`block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:${currentTheme.text}`}>Full Name</label>
                    <input
                        type="text"
                        className={`w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ring} ${currentTheme.border} transition-all duration-300 placeholder-gray-400`}
                        placeholder='John Doe'
                        onChange={(e) => setFullName(e.target.value)}
                        value={fullName}
                        required
                    />
                </div>

                {/* email */}
                <div className='mb-5 group'>
                    <label htmlFor="email" className={`block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:${currentTheme.text}`}>Email Address</label>
                    <input
                        type="email"
                        className={`w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ring} ${currentTheme.border} transition-all duration-300 placeholder-gray-400`}
                        placeholder='name@example.com'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                    />
                </div>

                {/* mobile*/}
                <div className='mb-5 group'>
                    <label htmlFor="mobile" className={`block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:${currentTheme.text}`}>Mobile Number</label>
                    <input
                        type="tel"
                        className={`w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ring} ${currentTheme.border} transition-all duration-300 placeholder-gray-400`}
                        placeholder='1234567890'
                        onChange={(e) => setMobile(e.target.value)}
                        value={mobile}
                        required
                    />
                </div>

                {/* password*/}
                <div className='mb-5 group'>
                    <label htmlFor="password" className={`block text-gray-700 font-semibold mb-2 text-sm ml-1 transition-colors group-hover:${currentTheme.text}`}>Password</label>
                    <div className='relative'>
                        <input
                            type={`${showPassword ? "text" : "password"}`}
                            className={`w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ring} ${currentTheme.border} transition-all duration-300 placeholder-gray-400 pr-12`}
                            placeholder='••••••••'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <button
                            className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${currentTheme.hoverText} transition-colors cursor-pointer`}
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                        </button>
                    </div>
                </div>

                {/* role*/}
                <div className='mb-8'>
                    <label htmlFor="role" className='block text-gray-700 font-semibold mb-2 text-sm ml-1'>I am a</label>
                    <div className='flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200'>
                        {["user", "owner", "deliveryBoy"].map((r) => {
                            const isActive = role === r;
                            const rTheme = theme[r]; // Use specific theme for each button
                            return (
                                <button
                                    key={r}
                                    className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-bold transition-all duration-300 capitalize cursor-pointer ${isActive
                                        ? `${rTheme.bg} text-white shadow-md transform scale-100`
                                        : `text-gray-500 hover:bg-white ${rTheme.hoverText}`
                                        }`}
                                    onClick={() => setRole(r)}
                                >
                                    {r.replace(/([A-Z])/g, ' $1').trim()}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button
                    className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white cursor-pointer flex items-center justify-center ${currentTheme.bg} hover:shadow-xl`}
                    onClick={handleSignUp}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign Up"}
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
                    <span className="font-semibold text-gray-700">Sign up with Google</span>
                </button>

                <p className='text-center mt-8 text-gray-600 font-medium'>
                    Already have an account? <span className='text-primary font-bold hover:underline cursor-pointer ml-1' onClick={() => navigate("/signin")}>Sign In</span>
                </p>
            </div>
        </div>
    )
}

export default SignUp
