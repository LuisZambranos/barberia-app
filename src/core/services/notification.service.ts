import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db, messaging } from "../firebase/config";

export const requestNotificationPermission = async (barberId: string) => {
  try {
    // 1. Validar si el navegador soporta notificaciones de forma nativa
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones push.');
      return false;
    }

    // 2. Validar si Firebase Messaging se pudo inicializar
    if (!messaging) {
      console.log('Firebase Messaging no está disponible en este entorno.');
      return false;
    }

    // 3. Pedir permiso al navegador
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });

      if (currentToken) {
        const barberRef = doc(db, "barbers", barberId);
        await updateDoc(barberRef, {
          fcmToken: currentToken
        });
        return true; 
      } else {
        console.log('No se pudo obtener el token.');
        return false;
      }
    } else {
      console.log('El barbero denegó el permiso de notificaciones.');
      return false;
    }
  } catch (error) {
    console.error('Error al pedir permisos o guardar token:', error);
    return false;
  }
};

export const sendPushAlert = async (token: string, title: string, body: string) => {
// ... el resto de tu código queda igual
  if (!token) return false;

  try {
    const response = await fetch('/api/sendPush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, title, body }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error al llamar a la API de Push:', error);
    return false;
  }
};