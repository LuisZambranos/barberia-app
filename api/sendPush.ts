import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const initFirebase = () => {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Forzamos el reemplazo de los saltos de línea para que Firebase entienda la llave
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Validador estricto: Si falta una, cortamos y avisamos
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(`Faltan variables de entorno. ProjectID: ${!!projectId}, Email: ${!!clientEmail}, Key: ${!!privateKey}`);
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
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

  // 1. Intentamos inicializar Firebase
  try {
    initFirebase();
  } catch (initError: any) {
    return res.status(500).json({ 
      error: 'Error de Inicialización de Firebase', 
      details: initError.message 
    });
  }

  // 2. Intentamos enviar el Push
  try {
    const { token, title, body, data } = req.body;
    if (!token) return res.status(400).json({ error: 'Falta el token FCM en la petición' });

    const message = {
      notification: {
        title,
        body,
      },
      // 1. Para Android Nativo / Firebase
      android: {
        notification: {
          icon: 'https://ajstudio-dev.vercel.app/Logo-2.png',
          color: '#D4AF37',
        }
      },
      // 2. Para Chrome / PWA (Elimina la "A" y pone tu logo)
      webpush: {
        notification: {
          icon: 'https://ajstudio-dev.vercel.app/Logo-2.png',
          badge: 'https://ajstudio-dev.vercel.app/Logo-2.png',
        }
      },
      data: data || {},
      token: token,
    };

    const response = await getMessaging().send(message);
    return res.status(200).json({ success: true, messageId: response });

  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Error enviando Push a Google', 
      details: error.message 
    });
  }
}