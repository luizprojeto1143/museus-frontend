import { useEffect, useState, useCallback } from 'react';
import { getFCMToken, onForegroundMessage } from '../lib/firebase';
import { api } from '../api/client';

interface PushNotificationState {
    token: string | null;
    permission: NotificationPermission;
    isSupported: boolean;
    isLoading: boolean;
    error: string | null;
}

export const usePushNotifications = () => {
    const [state, setState] = useState<PushNotificationState>({
        token: null,
        permission: 'default',
        isSupported: false,
        isLoading: true,
        error: null,
    });

    // Check if notifications are supported
    const checkSupport = useCallback(() => {
        const isSupported =
            typeof window !== 'undefined' &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            'PushManager' in window;

        return isSupported;
    }, []);

    // Request permission and get token
    const requestPermission = useCallback(async () => {
        if (!checkSupport()) {
            setState(prev => ({
                ...prev,
                isSupported: false,
                isLoading: false,
                error: 'Push notifications not supported'
            }));
            return null;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Register the Firebase service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Firebase SW registered:', registration);

            // Get FCM token
            const token = await getFCMToken();

            if (token) {
                // Save token to backend
                try {
                    await api.post('/notifications/register', {
                        token,
                        platform: 'web',
                        userAgent: navigator.userAgent
                    });
                    console.log('FCM token registered on backend');
                } catch (err) {
                    console.warn('Failed to register token on backend:', err);
                }

                setState({
                    token,
                    permission: Notification.permission,
                    isSupported: true,
                    isLoading: false,
                    error: null,
                });

                return token;
            } else {
                setState(prev => ({
                    ...prev,
                    permission: Notification.permission,
                    isLoading: false,
                    error: Notification.permission === 'denied' ? 'Permission denied' : 'Failed to get token',
                }));
                return null;
            }
        } catch (error) {
            console.error('Push notification error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
            return null;
        }
    }, [checkSupport]);

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            if (!checkSupport()) {
                setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
                return;
            }

            setState(prev => ({ ...prev, isSupported: true }));

            // Check current permission
            const currentPermission = Notification.permission;
            setState(prev => ({ ...prev, permission: currentPermission }));

            // If already granted, get token
            if (currentPermission === 'granted') {
                await requestPermission();
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        init();
    }, [checkSupport, requestPermission]);

    // Listen for foreground messages
    useEffect(() => {
        if (!state.isSupported || !state.token) return;

        const unsubscribe = onForegroundMessage((payload: unknown) => {
            const data = payload as { notification?: { title?: string; body?: string }; data?: Record<string, string> };

            // Show notification manually for foreground
            if (Notification.permission === 'granted' && data.notification) {
                new Notification(data.notification.title || 'Cultura Viva', {
                    body: data.notification.body,
                    icon: '/pwa-192x192.png',
                    tag: data.data?.tag || 'foreground',
                });
            }
        });

        return unsubscribe;
    }, [state.isSupported, state.token]);

    return {
        ...state,
        requestPermission,
    };
};
