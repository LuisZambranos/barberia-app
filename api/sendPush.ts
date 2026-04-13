// api/sendPush.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// 1. Inicialización Híbrida y Segura
if (!admin.apps.length) {
  try {
    // Si la llave privada viene con doble slash (\\n), la corregimos a un salto real (\n)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin inicializado correctamente para Push.");
  } catch (error) {
    console.error("Error crítico inicializando Firebase Admin:", error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS para permitir peticiones desde tu app frontend
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
      data: data || {}, // Payload extra opcional
      token: token,
    };

    // 2. Ejecutar el envío
    const response = await admin.messaging().send(message);
    
    return res.status(200).json({ 
      success: true, 
      messageId: response 
    });

  } catch (error: any) {
    console.error('Error enviando push notification:', error);
    
    // Devolver un error detallado ayuda a depurar en Vercel Logs
    return res.status(500).json({ 
      error: 'Error interno al enviar la notificación',
      details: error.message || 'Error desconocido'
    });
  }
}