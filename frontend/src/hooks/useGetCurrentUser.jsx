import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { setIsCheckingAuth, setUserData } from '../redux/userSlice'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

function useGetCurrentUser() {
  const dispatch = useDispatch()

  const fetchUser = async () => {
    const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
    return result.data
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchUser,
    retry: false, // Fail fast on 401
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  useEffect(() => {
    dispatch(setIsCheckingAuth(isLoading))
  }, [isLoading, dispatch])

  useEffect(() => {
    if (data) {
      dispatch(setUserData(data))
    }
  }, [data, dispatch])
}

export default useGetCurrentUser
