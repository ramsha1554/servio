import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

function useGetMyOrders() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  const fetchMyOrders = async () => {
    const result = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
    return result.data
  }

  const { data } = useQuery({
    queryKey: ['myOrders', userData?._id],
    queryFn: fetchMyOrders,
    enabled: !!userData,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  useEffect(() => {
    if (data) {
      dispatch(setMyOrders(data))
    }
  }, [data, dispatch])
}

export default useGetMyOrders
