import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useSelector } from 'react-redux'

function useGetAllOrders() {
    const { userData } = useSelector(state => state.user)

    const fetchOrders = async () => {
        const result = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true })
        return result.data
    }

    return useQuery({
        queryKey: ['adminOrders'],
        queryFn: fetchOrders,
        enabled: userData?.role === 'admin',
        staleTime: 60 * 1000,
    })
}

export default useGetAllOrders
