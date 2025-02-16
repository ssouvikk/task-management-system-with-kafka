// src/components/NotificationFeed.js
import React, { useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import NotificationContext from '../context/NotificationContext';

const NotificationFeed = () => {
    const { addNotification } = useContext(NotificationContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        let socket;

        const connectSocket = () => {
            if(!token) return
            socket = new WebSocket(`ws://localhost:5000?token=${token}`);

            socket.onopen = () => {
                console.log('WebSocket connected.');
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                toast.info(`New Notification: ${data.change_type}`);
                addNotification(data);
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed. Reconnecting...');
                setTimeout(connectSocket, 3000); // 3 সেকেন্ড পর পুনরায় সংযোগ
            };
        };

        connectSocket();

        return () => {
            if (socket) socket.close();
        };
    }, [addNotification]);


    // This component does not render any UI, it only handles notifications.
    return null;
};

export default NotificationFeed;
