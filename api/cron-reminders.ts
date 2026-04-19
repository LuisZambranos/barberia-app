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
    // 3. TAREA: RECORDATORIOS DE 4 HORAS ANTES
    // ==========================================
    const santiagoTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Santiago"}));
    const targetTime = new Date(santiagoTime.getTime() + 4 * 60 * 60 * 1000); // +4 horas
    
    const targetYear = targetTime.getFullYear();
    const targetMonth = String(targetTime.getMonth() + 1).padStart(2, '0');
    const targetDay = String(targetTime.getDate()).padStart(2, '0');
    const targetDateString = `${targetYear}-${targetMonth}-${targetDay}`;
    const targetHour = targetTime.getHours();

    const appointmentsRef = db.collection("appointments");
    // Traemos las citas de "ese día" que estén confirmadas
    const apptsSnapshot = await appointmentsRef
      .where("date", "==", targetDateString)
      .where("status", "==", "confirmed")
      .get();

    let reminder4hCount = 0;

    if (!apptsSnapshot.empty) {
      const apiUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/sendEmail` 
        : `http://127.0.0.1:3000/api/sendEmail`;

      for (const doc of apptsSnapshot.docs) {
        const appt = doc.data();
        
        // Evitar dobles envíos
        if (appt.reminder4hSent) continue;

        // Validar que la hora coincida con targetHour
        if (!appt.time) continue;
        const [hourStr] = appt.time.split(':');
        const apptHour = parseInt(hourStr, 10);

        // Si la cita es en la hora objetivo (ej: cita 18:30 y ahora son las 14:00, targetHour es 18)
        if (apptHour === targetHour) {
          
          // Obtener datos del barbero para su teléfono
          let barberPhone = '';
          if (appt.barberId) {
            const barberDoc = await db.collection("barbers").doc(appt.barberId).get();
            if (barberDoc.exists) {
              barberPhone = barberDoc.data()?.phone || '';
            }
          }

          // 3.1 Disparar WhatsApp / Email (Aquí conectaremos la API de Meta a futuro)
          // Por ahora enviamos el email usando la API existente
          if (appt.clientEmail) {
            await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                to: appt.clientEmail, 
                type: 'upcoming_4h',
                appointmentData: {
                  clientName: appt.clientName,
                  barberName: appt.barberName,
                  date: appt.date,
                  time: appt.time,
                  serviceName: appt.serviceName,
                  barberPhone: barberPhone
                }
              }),
            });
          }

          // 3.2 Marcar como enviado en la base de datos
          await doc.ref.update({ reminder4hSent: true });
          reminder4hCount++;
        }
      }
    }

    // ==========================================
    // REPORTE FINAL
    // ==========================================
    return res.status(200).json({ 
        success: true, 
        message: `Cron finalizado con éxito. Se barrieron ${deletedLocksCount} candados fantasma, se enviaron ${sentCount} correos de 15 días y ${reminder4hCount} recordatorios de 4 horas.` 
    });

  } catch (error) {
    console.error('Error en el Cron Job:', error);
    return res.status(500).json({ success: false, error: "Fallo interno en el Cron Job" });
  }
}