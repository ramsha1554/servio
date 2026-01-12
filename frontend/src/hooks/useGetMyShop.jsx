import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

function useGetMyshop() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  const fetchMyShop = async () => {
    const result = await axios.get(`${serverUrl}/api/shop/get-my`, { withCredentials: true })
    return result.data
  }

  const { data } = useQuery({
    queryKey: ['myShop', userData?._id],
    queryFn: fetchMyShop,
    // Only fetch if user is logged in AND is an owner otherwise return null
    enabled: !!userData && userData.role === 'owner',
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (data) {
      dispatch(setMyShopData(data))
    }
  }, [data, dispatch])
}

export default useGetMyshop
