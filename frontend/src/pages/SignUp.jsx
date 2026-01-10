import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

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

    // Dynamic Theme Logic mapped to tailwind classes
    const theme = {
        user: { color: "text-primary", bg: "bg-primary" },
        owner: { color: "text-accent", bg: "bg-accent" },
        deliveryBoy: { color: "text-secondary", bg: "bg-secondary" }
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

            {/* Decorative Background Elements */}
            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-[20%] left-[20%] w-[200px] h-[200px] bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2.5s' }}></div>


            <Card className="w-full max-w-md opacity-0 animate-fade-in-up relative z-10 my-8" hoverEffect={true}>
                <div className="text-center mb-8">
                    <h1 className={`text-4xl font-extrabold mb-3 tracking-tight ${currentTheme.color} transition-colors duration-300`}>Servio</h1>
                    <p className='text-gray-500 text-sm font-medium'>Join us and start your delicious journey.</p>
                </div>

                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="1234567890"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                />

                <div className='mb-5'>
                    <div className='relative'>
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            className='absolute right-4 top-[38px] text-gray-400 hover:text-primary transition-colors cursor-pointer'
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                        </button>
                    </div>
                </div>

                {/* Role Selection */}
                <div className='mb-8'>
                    <label className='block text-gray-700 font-semibold mb-2 text-sm ml-1'>I am a</label>
                    <div className='flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200'>
                        {["user", "owner", "deliveryBoy"].map((r) => {
                            const isActive = role === r;
                            // Mapping active/inactive states manually for custom role coloring
                            let activeClass = "";
                            if (r === 'user') activeClass = "bg-primary text-white shadow-md";
                            if (r === 'owner') activeClass = "bg-accent text-white shadow-md";
                            if (r === 'deliveryBoy') activeClass = "bg-secondary text-white shadow-md";

                            return (
                                <button
                                    key={r}
                                    type="button"
                                    className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-bold transition-all duration-300 capitalize cursor-pointer ${isActive
                                        ? `${activeClass} transform scale-100`
                                        : `text-gray-500 hover:bg-white`
                                        }`}
                                    onClick={() => setRole(r)}
                                >
                                    {r.replace(/([A-Z])/g, ' $1').trim()}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <Button
                    className={`w-full ${currentTheme.bg} hover:brightness-110`} // Override primary color variants with role color
                    onClick={handleSignUp}
                    isLoading={loading}
                    size='lg'
                    // We remove variant='primary' to let className override bg color, or we can add specific variants to Button if we wanted to be stricter
                    style={{ backgroundColor: '' }} // Reset any inline style
                >
                    Sign Up
                </Button>

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

                <Button
                    variant="secondary"
                    className="w-full group"
                    onClick={handleGoogleAuth}
                    icon={FcGoogle}
                >
                    <span className="text-slate-700 group-hover:text-primary transition-colors">Sign up with Google</span>
                </Button>

                <p className='text-center mt-8 text-gray-600 font-medium'>
                    Already have an account? <span className='text-primary font-bold hover:underline cursor-pointer ml-1' onClick={() => navigate("/signin")}>Sign In</span>
                </p>
            </Card>
        </div>
    )
}

export default SignUp
