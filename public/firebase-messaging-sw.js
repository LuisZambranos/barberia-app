// Importamos los scripts de Firebase especiales para el Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

//  ESTO ES 100% SEGURO: Son solo identificadores públicos del proyecto.
// (NO incluyas aquí ni el Private Key ni contraseñas de correo).
const firebaseConfig = {
  apiKey: "AIzaSyDQFGX0i0M3HLqe-WBFM9d-CTGX9zSH_bs",
  authDomain: "barbershop-1f2fe.firebaseapp.com",
  projectId: "barbershop-1f2fe",
  storageBucket: "barbershop-1f2fe.firebasestorage.app",
  messagingSenderId: "360306849794",
  appId: "1:360306849794:web:15fd03aa81f7d5f95c8f1b"
};

// Inicializamos Firebase en segundo plano
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Esta función se activa SOLO cuando la página web está cerrada o en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Recibida data invisible:', payload);

  // Ahora leemos de payload.data porque Vercel lo envía así
  const notificationTitle = payload.data.title || '¡Nueva Reserva!';
  const notificationOptions = {
    body: payload.data.body || 'Tienes una nueva cita agendada.',
    icon: '/Logo-1.png', // <-- Ahora sí tiene el punto
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});