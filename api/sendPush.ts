// api/sendPush.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Importaciones MODULARES (A prueba de fallos en Vercel)
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Función para inicializar de forma segura
const initFirebase = () => {
  // getApps() es la forma moderna y segura de verificar las apps
  if (getApps().length === 0) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!privateKey) {
        console.error("ALERTA: FIREBASE_PRIVATE_KEY no está definida en las variables de entorno.");
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin inicializado correctamente.");
    } catch (error) {
      console.error("Error crítico inicializando Firebase Admin:", error);
    }
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers obligatorios
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Inicializamos Firebase ANTES de usarlo
  initFirebase();

  try {
    const { token, title, body, data } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token FCM es requerido' });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token: token,
    };

    // 3. ¡Disparamos el Push usando la función modular!
    const response = await getMessaging().send(message);
    
    console.log("Push enviado con éxito. MessageID:", response);
    return res.status(200).json({ success: true, messageId: response });

  } catch (error: any) {
    console.error('Error enviando push notification:', error);
    return res.status(500).json({ 
      error: 'Error interno al enviar la notificación',
      details: error.message || 'Error desconocido'
    });
  }
}