// src/components/NotificationFeed.js
import React, { useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import NotificationContext from '../context/NotificationContext';

const NotificationFeed = () => {
    const { addNotification } = useContext(NotificationContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = new WebSocket(`ws://localhost:5000?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket connected.');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Show as a toast
            toast.info(`New Notification: ${data.change_type}`);
            // Add new notification to context
            addNotification(data);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        return () => {
            socket.close();
        };
    }, [addNotification]);

    // This component does not render any UI, it only handles notifications.
    return null;
};

export default NotificationFeed;
