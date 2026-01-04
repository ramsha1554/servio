import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

function Nav() {
    const { userData, currentCity, cartItems } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogOut = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
            dispatch(setSearchItems(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (query) {
            handleSearchItems()
        } else {
            dispatch(setSearchItems(null))
        }

    }, [query])

    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border-b border-gray-100 overflow-visible transition-all duration-300'>

            {showSearch && userData.role == "user" && <div className='w-[90%] h-[70px] bg-white shadow-2xl rounded-2xl items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden border border-gray-100 z-50 animate-fade-in-up'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-100'>
                    <FaLocationDot size={22} className="text-[#ff4d2d]" />
                    <div className='w-[80%] truncate text-gray-600 font-medium'>{currentCity}</div>
                </div>
                <div className='w-[80%] flex items-center gap-[10px] pr-4'>
                    <IoIosSearch size={25} className='text-[#ff4d2d]' />
                    <input
                        type="text"
                        placeholder='Search delicious food...'
                        className='px-[5px] text-gray-700 outline-none w-full placeholder-gray-400 font-medium'
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                    />
                </div>
            </div>}

            <h1
                className='text-3xl font-extrabold mb-2 text-[#ff4d2d] cursor-pointer tracking-tighter hover:scale-105 transition-transform duration-200'
                onClick={() => navigate("/")}
            >
                Servio
            </h1>

            {userData.role == "user" && <div className='md:w-[60%] lg:w-[40%] h-[55px] bg-white border border-gray-200 shadow-sm rounded-full items-center gap-[20px] hidden md:flex transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-[#ff4d2d]/20 focus-within:border-[#ff4d2d]'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] pl-[20px] pr-[10px] border-r-[2px] border-gray-100 h-[60%]'>
                    <FaLocationDot size={20} className="text-[#ff4d2d]" />
                    <div className='w-[80%] truncate text-gray-600 font-medium text-sm'>{currentCity}</div>
                </div>
                <div className='w-[70%] flex items-center gap-[10px] pr-[20px]'>
                    <IoIosSearch size={24} className='text-gray-400' />
                    <input
                        type="text"
                        placeholder='Search delicious food...'
                        className='px-[5px] text-gray-700 outline-none w-full placeholder-gray-400 text-sm font-medium'
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                    />
                </div>
            </div>}

            <div className='flex items-center gap-5'>
                {userData.role == "user" && (showSearch ? <RxCross2 size={25} className='text-[#ff4d2d] md:hidden cursor-pointer' onClick={() => setShowSearch(false)} /> : <IoIosSearch size={25} className='text-[#ff4d2d] md:hidden cursor-pointer' onClick={() => setShowSearch(true)} />)
                }
                {userData.role == "owner" ? <>
                    {myShopData && <> <button className='hidden md:flex items-center gap-2 p-2 px-4 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 font-medium' onClick={() => navigate("/add-item")}>
                        <FaPlus size={18} />
                        <span className="text-sm">Add Item</span>
                    </button>
                        <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={() => navigate("/add-item")}>
                            <FaPlus size={20} />
                        </button></>}

                    <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-4 py-2 rounded-full hover:bg-gray-50 text-gray-600 hover:text-[#ff4d2d] transition-colors font-medium' onClick={() => navigate("/my-orders")}>
                        <TbReceipt2 size={20} />
                        <span className="text-sm">My Orders</span>
                    </div>
                    <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={() => navigate("/my-orders")}>
                        <TbReceipt2 size={20} />
                    </div>
                </> : (
                    <>
                        {userData.role == "user" && <div className='relative cursor-pointer group' onClick={() => navigate("/cart")}>
                            <FiShoppingCart size={24} className='text-[#ff4d2d] transition-transform group-hover:scale-110 duration-200' />
                            {cartItems.length > 0 && <span className='absolute right-[-8px] top-[-8px] bg-[#ff4d2d] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm'>{cartItems.length}</span>}
                        </div>}

                        <button className='hidden md:block px-4 py-2 rounded-full hover:bg-[#ff4d2d]/5 text-gray-600 hover:text-[#ff4d2d] text-sm font-semibold transition-colors' onClick={() => navigate("/my-orders")}>
                            My Orders
                        </button>
                    </>
                )}

                <div className='relative'>
                    <div className='w-[42px] h-[42px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-lg shadow-[#ff4d2d]/20 font-bold cursor-pointer hover:ring-4 hover:ring-[#ff4d2d]/10 transition-all duration-300' onClick={() => setShowInfo(prev => !prev)}>
                        {userData?.fullName.slice(0, 1).toUpperCase()}
                    </div>

                    {showInfo && <div className={`fixed top-[85px] right-[20px] w-[220px] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-2 flex flex-col gap-1 z-[9999] border border-gray-100 origin-top-right animate-fade-in-up`}>
                        <div className='px-4 py-3 border-b border-gray-100 mb-1'>
                            <p className='text-xs text-gray-400 font-medium uppercase tracking-wider'>Signed in as</p>
                            <p className='font-bold text-gray-800 truncate'>{userData.fullName}</p>
                        </div>

                        {userData.role == "user" && <div className='md:hidden px-4 py-2 hover:bg-gray-50 rounded-xl text-gray-600 cursor-pointer text-sm font-medium transition-colors' onClick={() => navigate("/my-orders")}>My Orders</div>}

                        <div className='px-4 py-2 hover:bg-red-50 hover:text-red-500 text-red-500 rounded-xl font-medium cursor-pointer text-sm transition-colors' onClick={handleLogOut}>Sign Out</div>
                    </div>}
                </div>

            </div>
        </div>
    )
}

export default Nav
