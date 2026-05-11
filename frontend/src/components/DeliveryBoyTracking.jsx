import React from 'react'
import { IoLocationSharp } from "react-icons/io5";

function DeliveryBoyTracking({ data }) {
    const deliveryBoyLat = data?.deliveryBoyLocation?.lat;
    const deliveryBoyLon = data?.deliveryBoyLocation?.lon;

    return (
        <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md border border-gray-200'>
            {deliveryBoyLat && deliveryBoyLon ? (
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${deliveryBoyLat},${deliveryBoyLon}&z=16&output=embed`}
                />
            ) : (
                <div className='h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 gap-2'>
                    <IoLocationSharp size={32} className='text-gray-300' />
                    <p className='text-sm'>Waiting for delivery partner's location...</p>
                </div>
            )}
        </div>
    )
}

export default DeliveryBoyTracking

