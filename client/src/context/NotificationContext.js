// src/context/NotificationContext.js
import { createContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    const addNotification = () => {
        setNotificationCount((prev) => prev + 1);
    };

    const resetNotifications = () => {
        setNotificationCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notificationCount, addNotification, resetNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
