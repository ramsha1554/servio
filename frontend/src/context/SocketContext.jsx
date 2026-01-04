import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userData } = useSelector(state => state.user);

    useEffect(() => {
        const socketInstance = io(serverUrl, { withCredentials: true });
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            if (userData?._id) {
                socketInstance.emit('identity', { userId: userData._id });
            }
        });

        return () => {
            socketInstance.disconnect();
        };
    }, [userData?._id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
