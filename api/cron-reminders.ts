import admin from 'firebase-admin';

// BEST PRACTICE: En entornos Serverless como Vercel, debemos asegurarnos de 
// inicializar la app de Admin una sola vez para evitar errores de memoria.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Reemplazamos los saltos de línea literales para que Node lea bien la llave
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req: any, res: any) {
  // SEGURIDAD DE VERCEL (Comentada temporalmente para probar en localhost)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - 15);
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

    // Ahora usamos el db de admin.firestore(), que tiene acceso total garantizado
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("lastVisitDate", ">=", startOfDay)
      .where("lastVisitDate", "<=", endOfDay)
      .get();

    const clientsToEmail = snapshot.docs.map(doc => doc.data());

    if (clientsToEmail.length === 0) {
      return res.status(200).json({ success: true, message: "No hay clientes para recordar hoy." });
    }

    const apiUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/sendEmail` 
      : `http://127.0.0.1:3000/api/sendEmail`;

    let sentCount = 0;

    for (const client of clientsToEmail) {
      if (!client.email || !client.name) continue;

      const firstName = client.name.split(' ')[0];

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: client.email, 
          clientName: firstName,
          type: 'reminder' 
        }),
      });
      sentCount++;
    }

    return res.status(200).json({ 
        success: true, 
        message: `Proceso completado . Se enviaron ${sentCount} recordatorios.` 
    });

  } catch (error) {
    console.error('Error en el Cron Job:', error);
    return res.status(500).json({ success: false, error: "Fallo interno en el Cron Job" });
  }
}