import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
function useUpdateLocation() {
    const {userData}=useSelector(state=>state.user)
 
    useEffect(() => {
        if (!userData || userData.role !== 'deliveryBoy') return;

        let lastUpdate = 0;
        const THROTTLE_MS = 30000; // 30 seconds

        const updateLocation = async (lat, lon) => {
            const now = Date.now();
            if (now - lastUpdate < THROTTLE_MS) return;

            try {
                await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon }, { withCredentials: true })
                lastUpdate = now;
            } catch (e) {
                console.error("Location update failed:", e);
            }
        }

        const watchId = navigator.geolocation.watchPosition((pos) => {
            updateLocation(pos.coords.latitude, pos.coords.longitude)
        }, (err) => console.error("Geo error:", err), {
            enableHighAccuracy: true
        })

        return () => navigator.geolocation.clearWatch(watchId);
    }, [userData])
}

export default useUpdateLocation
