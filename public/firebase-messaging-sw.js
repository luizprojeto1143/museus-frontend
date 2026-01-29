// Firebase Messaging Service Worker
// This file handles push notifications when the app is in background or closed

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration (must match the app config)
firebase.initializeApp({
    apiKey: "AIzaSyA5ZwjGfctCp4KQ5nG2kiy_27egqUTbfRc",
    authDomain: "cultura-viva-49e17.firebaseapp.com",
    projectId: "cultura-viva-49e17",
    storageBucket: "cultura-viva-49e17.firebasestorage.app",
    messagingSenderId: "235652099099",
    appId: "1:235652099099:web:93f9d22d45b88dd2061cbe"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Cultura Viva';
    const notificationOptions = {
        body: payload.notification?.body || 'Você tem uma nova notificação',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: payload.data?.tag || 'default',
        data: payload.data,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'open',
                title: 'Ver Detalhes'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Get the URL to open from notification data
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Open a new window if none is open
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
