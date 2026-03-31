import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db, messaging } from "../firebase/config";

export const requestNotificationPermission = async (barberId: string) => {
  try {
    // 1. Pedimos permiso al navegador
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // 2. Obtenemos el Token usando tu llave VAPID
      const currentToken = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });

      if (currentToken) {
        //console.log("Token obtenido:", currentToken);
        
        // 3. Guardamos el Token en el perfil del barbero en Firestore
        const barberRef = doc(db, "barbers", barberId);
        await updateDoc(barberRef, {
          fcmToken: currentToken
        });

        return true; // Éxito
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

// --- NUEVA FUNCIÓN PARA DISPARAR LA ALERTA DESDE EL FRONTEND ---
export const sendPushAlert = async (token: string, title: string, body: string) => {
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