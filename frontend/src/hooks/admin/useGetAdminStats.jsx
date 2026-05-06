import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useSelector } from 'react-redux'

function useGetAdminStats() {
    const { userData } = useSelector(state => state.user)

    const fetchStats = async () => {
        const result = await axios.get(`${serverUrl}/api/admin/stats`, { withCredentials: true })
        return result.data
    }

    return useQuery({
        queryKey: ['adminStats'],
        queryFn: fetchStats,
        enabled: userData?.role === 'admin',
        staleTime: 60 * 1000,
    })
}

export default useGetAdminStats
