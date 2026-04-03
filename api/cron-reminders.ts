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
  // SEGURIDAD DE VERCEL (Comentada temporalmente para probar en localhost si lo necesitas)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    // ==========================================
    // 1. TAREA: LIMPIEZA DE CANDADOS FANTASMA
    // ==========================================
    const now = new Date().getTime();
    const locksRef = db.collection("locks");
    
    // Buscamos los candados cuyo tiempo ya expiró (en el pasado)
    const expiredLocksSnapshot = await locksRef.where("expiresAt", "<", now).get();
    
    let deletedLocksCount = 0;
    if (!expiredLocksSnapshot.empty) {
      const deletePromises: Promise<any>[] = [];
      
      // Borramos cada documento fantasma
      expiredLocksSnapshot.docs.forEach((doc) => {
        deletePromises.push(doc.ref.delete());
        deletedLocksCount++;
      });
      
      // Esperamos a que se borren todos
      await Promise.all(deletePromises);
    }

    // ==========================================
    // 2. TAREA: RECORDATORIOS DE VISITA (15 Días)
    // ==========================================
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
    let sentCount = 0;

    if (clientsToEmail.length > 0) {
      const apiUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/sendEmail` 
        : `http://127.0.0.1:3000/api/sendEmail`;

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
    }

    // ==========================================
    // REPORTE FINAL
    // ==========================================
    return res.status(200).json({ 
        success: true, 
        message: `Cron finalizado con éxito. Se barrieron ${deletedLocksCount} candados fantasma y se enviaron ${sentCount} correos de recordatorio.` 
    });

  } catch (error) {
    console.error('Error en el Cron Job:', error);
    return res.status(500).json({ success: false, error: "Fallo interno en el Cron Job" });
  }
}