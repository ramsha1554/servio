import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity, setShopsInMyCity, setUserData } from '../redux/userSlice'

function useGetItemsByCity() {
  const dispatch = useDispatch()
  const { currentCity, userData } = useSelector(state => state.user)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (currentCity && userData) {
          const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, { withCredentials: true })
          dispatch(setItemsInMyCity(result.data))
        }
      } catch (error) {
        // silent catch
      }
    }
    fetchItems()

  }, [currentCity, userData])
}

export default useGetItemsByCity
