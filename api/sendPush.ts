import admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 1. Inicializamos Firebase Admin (Solo si no se ha inicializado antes)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Usamos un pequeño truco de replace() porque Vercel a veces rompe los saltos de línea de la llave privada
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token, title, body } = req.body;

  // Si el barbero no tiene token (no activó las notificaciones), no hacemos nada
  if (!token) {
    return res.status(400).json({ error: 'El barbero no tiene un token FCM registrado.' });
  }

  try {
    // 2. Preparamos el mensaje Push
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };

    // 3. ¡Disparamos el misil!
    const response = await admin.messaging().send(message);
    
    console.log('Notificación Push enviada con éxito:', response);
    return res.status(200).json({ success: true, messageId: response });
    
  } catch (error) {
    console.error('Error crítico al enviar la notificación Push:', error);
    return res.status(500).json({ success: false, error: 'Error interno de Firebase Admin' });
  }
}