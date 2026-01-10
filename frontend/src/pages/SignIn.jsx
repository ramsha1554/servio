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

function SignIn() {
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
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden'>

            {/* Decorative Background Elements */}
            <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <Card className="w-full max-w-md opacity-0 animate-fade-in-up relative z-10" hoverEffect={true}>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-primary">Servio</h1>
                    <p className='text-gray-500 text-sm font-medium'>Welcome back! Tasty food awaits.</p>
                </div>

                <div className='mb-2'>
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className='mb-6'>
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
                            className='absolute right-4 top-[38px] text-gray-400 hover:text-primary transition-colors cursor-pointer p-1'
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                        </button>
                    </div>
                </div>

                <div className='text-right mb-8'>
                    <span className='text-sm font-semibold cursor-pointer text-gray-500 hover:text-primary transition-colors' onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                    </span>
                </div>

                <Button
                    className="w-full"
                    onClick={handleSignIn}
                    isLoading={loading}
                    size='lg'
                >
                    Sign In
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
                    className="w-full group" // Added group class for hover effects on icon if needed, though Button handles it
                    onClick={handleGoogleAuth}
                    icon={FcGoogle} // Passing component directly
                >
                    <span className="text-slate-700 group-hover:text-primary transition-colors">Sign In with Google</span>
                </Button>

                <p className='text-center mt-8 text-gray-600 font-medium'>
                    New to Servio? <span className='text-primary font-bold hover:underline cursor-pointer ml-1' onClick={() => navigate("/signup")}>Create account</span>
                </p>
            </Card>
        </div>
    )
}

export default SignIn
