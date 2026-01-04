import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setIsCheckingAuth, setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
  const dispatch = useDispatch()
  const { isCheckingAuth } = useSelector(state => state.user)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(setIsCheckingAuth(true))
        const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
        dispatch(setUserData(result.data))

      } catch (error) {
        console.log(error)
      } finally {
        dispatch(setIsCheckingAuth(false))
      }
    }
    fetchUser()

  }, [])
}

export default useGetCurrentUser
