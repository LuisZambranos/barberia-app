import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ahora permitimos que appointmentData sea opcional si es un recordatorio
  const { to, type, appointmentData, clientName } = req.body;

  if (!to || !type) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  
  // Candado estricto: Si NO es recordatorio, exigimos los datos de la cita
  if (type !== 'reminder' && !appointmentData) {
    return res.status(400).json({ message: 'Faltan datos de la cita' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    let subject = '';
    let htmlContent = '';

    const baseStyles = `
      body { font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
      .header { background-color: #000000; padding: 20px; text-align: center; border-bottom: 2px solid #D4AF37; }
      .content { padding: 30px; line-height: 1.6; }
      .gold-text { color: #D4AF37; font-weight: bold; }
      .box { background-color: #2a2a2a; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #D4AF37; }
      .policy-box { background-color: #2a1f1f; border-left: 4px solid #e74c3c; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 0.9em; }
      .btn { display: inline-block; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; text-align: center; }
      .btn-ws { background-color: #25D366; color: #000000; }
      .btn-gold { background-color: #D4AF37; color: #000000; }
      .footer { text-align: center; padding: 20px; font-size: 0.8em; color: #888; }
    `;

    // --- BLOQUES REUTILIZABLES (Solo si existe appointmentData) ---
    const appointmentDetailsHTML = appointmentData ? `
      <div class="box">
        <p><strong>Barbero:</strong> ${appointmentData.barberName}</p>
        <p><strong>Servicio:</strong> ${appointmentData.serviceName}</p>
        <p><strong>Fecha:</strong> ${appointmentData.date}</p>
        <p><strong>Hora:</strong> ${appointmentData.time}</p>
      </div>
    ` : '';

    const policyHTML = `
      <div class="policy-box">
        <strong style="color: #e74c3c;">⚠️ Políticas de AJ Studio:</strong><br>
        • Tolerancia máxima de retraso: <strong>10 minutos</strong>.<br>
        • Tarifa de cancelación aplica si cancelas con menos de <strong>3 horas</strong> de anticipación.<br>
        <em>Recomendamos pago por transferencia para asegurar cupos.</em>
      </div>
    `;

    // --- LÓGICA FIJA DE WHATSAPP ---
    let wsButtonHTML = '';
    if (type !== 'reminder' && appointmentData) {
      const phone = appointmentData.barberPhone; 
      let wsMessage = '';
      
      if (type === 'confirmed') {
        wsMessage = `Hola ${appointmentData.barberName}, soy ${appointmentData.clientName}. ¡Ya tengo mi hora confirmada para el ${appointmentData.date} a las ${appointmentData.time}! Nos vemos.`;
      } else if (type === 'pending') {
         if (appointmentData.paymentMethod === 'transfer') {
             wsMessage = `Hola ${appointmentData.barberName}, soy ${appointmentData.clientName}. Solicité una reserva para el ${appointmentData.date} a las ${appointmentData.time}. Te adjunto el comprobante de transferencia:`;
         } else {
             wsMessage = `Hola ${appointmentData.barberName}, soy ${appointmentData.clientName}. Solicité una reserva para el ${appointmentData.date} a las ${appointmentData.time} (pago en efectivo). Confírmame por favor.`;
         }
      } else if (type === 'canceled') {
        wsMessage = `Hola ${appointmentData.barberName}, vi que mi cita del ${appointmentData.date} fue cancelada. ¿Podemos reagendar?`;
      }

      const wsLink = `https://wa.me/${phone}?text=${encodeURIComponent(wsMessage)}`;
      wsButtonHTML = `<div style="text-align: center;"><a href="${wsLink}" class="btn btn-ws">Contactar por WhatsApp</a></div>`;
    }

    // --- ENRUTADOR DE PLANTILLAS ---
    switch (type) {
      case 'pending':
        subject = '⚠️ Tu cita está PENDIENTE - AJ Studio';
        htmlContent = `
          <html><head><style>${baseStyles}</style></head><body>
            <div class="container">
              <div class="header"><h1 style="margin: 0; letter-spacing: 2px;">AJ <span class="gold-text">STUDIO</span></h1></div>
              <div class="content">
                <h2>Hola ${appointmentData.clientName},</h2>
                <p>Tu solicitud de reserva está <strong style="color: #f39c12;">PENDIENTE</strong> de aprobación.</p>
                ${appointmentDetailsHTML}
                <p>Para agilizar la confirmación, comunícate con tu barbero vía WhatsApp:</p>
                ${wsButtonHTML}
                ${policyHTML}
              </div>
              <div class="footer">AJ Studio - Barbería & Estilo</div>
            </div>
          </body></html>
        `;
        break;

      case 'confirmed':
        subject = '✅ Cita Confirmada - AJ Studio';
        htmlContent = `
          <html><head><style>${baseStyles}</style></head><body>
            <div class="container">
              <div class="header"><h1 style="margin: 0; letter-spacing: 2px;">AJ <span class="gold-text">STUDIO</span></h1></div>
              <div class="content">
                <h2>¡Excelente ${appointmentData.clientName}!</h2>
                <p>Tu cita ha sido <strong style="color: #2ecc71;">CONFIRMADA</strong>. Tu cupo está asegurado.</p>
                ${appointmentDetailsHTML}
                ${wsButtonHTML}
                ${policyHTML}
              </div>
              <div class="footer">AJ Studio - Barbería & Estilo</div>
            </div>
          </body></html>
        `;
        break;

      case 'canceled':
        subject = '❌ Cita Cancelada - AJ Studio';
        htmlContent = `
          <html><head><style>${baseStyles}</style></head><body>
            <div class="container">
              <div class="header"><h1 style="margin: 0; letter-spacing: 2px;">AJ <span class="gold-text">STUDIO</span></h1></div>
              <div class="content">
                <h2>Hola ${appointmentData.clientName},</h2>
                <p>Tu cita para el <strong>${appointmentData.date} a las ${appointmentData.time}</strong> ha sido cancelada.</p>
                <p>Si deseas reagendar, escríbele a tu barbero o agenda nuevamente en la web.</p>
                ${wsButtonHTML}
                <div style="text-align: center; margin-top: 15px;">
                  <a href="https://ajstudio.vercel.app/book" class="btn btn-gold">Agendar Nueva Cita</a>
                </div>
              </div>
              <div class="footer">AJ Studio - Barbería & Estilo</div>
            </div>
          </body></html>
        `;
        break;

      case 'completed': 
        subject = '💈 ¡Gracias por tu visita a AJ Studio!';
        htmlContent = `
          <html><head><style>${baseStyles}</style></head><body>
            <div class="container">
              <div class="header"><h1 style="margin: 0; letter-spacing: 2px;">AJ <span class="gold-text">STUDIO</span></h1></div>
              <div class="content">
                <h2>Hola ${appointmentData.clientName},</h2>
                <p>Esperamos que hayas disfrutado tu servicio de <strong>${appointmentData.serviceName}</strong> con ${appointmentData.barberName}.</p>
                <p>Para nosotros es muy importante seguir mejorando. ¿Qué tal te pareció la experiencia?</p>
                <div style="text-align: center;">
                  <a href="https://g.page/r/tu-enlace-de-google/review" class="btn btn-gold">Calificar Servicio ⭐⭐⭐⭐⭐</a>
                </div>
              </div>
              <div class="footer">AJ Studio - Barbería & Estilo</div>
            </div>
          </body></html>
        `;
        break;

// --- NUEVO: RECORDATORIO DE 15 DÍAS ---
      case 'reminder':
        const resolvedName = clientName || 'Cliente';
        subject = '💈 ¡Ya toca un retoque! ✂️';
        htmlContent = `
          <html><head><style>${baseStyles}</style></head><body>
            <div class="container">
              <div class="header"><h1 style="margin: 0; letter-spacing: 2px;">AJ <span class="gold-text">STUDIO</span></h1></div>
              <div class="content">
                <h2>Hola ${resolvedName},</h2>
                <p>Notamos que han pasado un par de semanas desde tu última visita a nuestra barbería.</p>
                <p>¿Ya es hora de un retoque? Mantén tu estilo impecable agendando una nueva cita con nosotros, los barberos te están esperando.</p>
                <div style="text-align: center; margin-top: 25px;">
                  <a href="https://ajstudio.vercel.app/book" class="btn btn-gold">Reservar Nueva Cita</a>
                </div>
              </div>
              <div class="footer">AJ Studio - Barbería & Estilo</div>
            </div>
          </body></html>
        `;
        break;

      default:
        return res.status(400).json({ message: 'Tipo de correo inválido' });
    }

    const mailOptions = { from: `"AJ Studio" <${process.env.EMAIL_USER}>`, to, subject, html: htmlContent };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Correo enviado', type });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ message: 'Error enviando correo', error: errorMessage });
  }
}