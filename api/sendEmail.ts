import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, type, appointmentData, clientName } = req.body;

  if (!to || !type) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  
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

    // --- ESTILOS BLINDADOS CONTRA MODO CLARO/OSCURO DE GMAIL/APPLE ---
    const baseStyles = `
      /* Reset básico */
      body, table, td, div, p, a, h1, h2, h3, h4, h5, h6, span, strong, em {
        font-family: Arial, sans-serif !important;
      }
      
      /* Forzar modo oscuro en clientes que lo soportan */
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }

      /* Contenedor principal que envuelve todo el correo */
      .email-wrapper {
        width: 100% !important;
        background-color: #121212 !important;
        background-image: linear-gradient(#121212, #121212) !important;
        padding: 20px 0 !important;
        margin: 0 !important;
      }

      /* Caja central */
      .container {
        max-width: 600px !important;
        margin: 0 auto !important;
        background-color: #1e1e1e !important;
        background-image: linear-gradient(#1e1e1e, #1e1e1e) !important;
        border: 1px solid #333333 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
      }

      /* Cabecera */
      .header {
        background-color: #000000 !important;
        background-image: linear-gradient(#000000, #000000) !important;
        padding: 20px !important;
        text-align: center !important;
        border-bottom: 2px solid #D4AF37 !important;
      }
      .header h1 { color: #ffffff !important; margin: 0; letter-spacing: 2px; }

      /* Contenido */
      .content {
        padding: 30px !important;
        line-height: 1.6 !important;
        color: #ffffff !important;
      }
      .content h2, .content p { color: #ffffff !important; }

      /* Textos y Cajas */
      .gold-text { color: #D4AF37 !important; font-weight: bold !important; }
      
      .box {
        background-color: #2a2a2a !important;
        background-image: linear-gradient(#2a2a2a, #2a2a2a) !important;
        padding: 15px !important;
        border-radius: 5px !important;
        margin: 20px 0 !important;
        border-left: 4px solid #D4AF37 !important;
      }
      .box p, .box strong { color: #ffffff !important; margin: 5px 0 !important; }

      .policy-box {
        background-color: #2a1f1f !important;
        background-image: linear-gradient(#2a1f1f, #2a1f1f) !important;
        border-left: 4px solid #e74c3c !important;
        padding: 15px !important;
        border-radius: 5px !important;
        margin: 20px 0 !important;
        font-size: 0.9em !important;
      }
      .policy-box p, .policy-box strong, .policy-box em { color: #ffffff !important; }

      /* Botones */
      .btn {
        display: inline-block !important;
        padding: 12px 25px !important;
        text-decoration: none !important;
        border-radius: 5px !important;
        font-weight: bold !important;
        margin-top: 20px !important;
        text-align: center !important;
      }
      .btn-ws {
        background-color: #25D366 !important;
        background-image: linear-gradient(#25D366, #25D366) !important;
        color: #000000 !important;
      }
      .btn-gold {
        background-color: #D4AF37 !important;
        background-image: linear-gradient(#D4AF37, #D4AF37) !important;
        color: #000000 !important;
      }

      /* Footer */
      .footer {
        text-align: center !important;
        padding: 20px !important;
        font-size: 0.8em !important;
        color: #888888 !important;
        background-color: #1e1e1e !important;
        background-image: linear-gradient(#1e1e1e, #1e1e1e) !important;
      }
    `;

    // --- PLANTILLA BASE GENERADORA DE HTML ---
    // Esto asegura que cada correo lleve las etiquetas necesarias en el <head>
    const buildHTML = (bodyContent: string) => `
      <!DOCTYPE html>
      <html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <style>${baseStyles}</style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #121212;">
        <div class="email-wrapper">
          <div class="container">
            <div class="header"><h1>AJ <span class="gold-text">STUDIO</span></h1></div>
            <div class="content">
              ${bodyContent}
            </div>
            <div class="footer">AJ Studio - Barbería & Estilo</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // --- BLOQUES REUTILIZABLES ---
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
        <p><strong style="color: #e74c3c !important;">⚠️ Políticas de AJ Studio:</strong></p>
        <p>• Tolerancia máxima de retraso: <strong>10 minutos</strong>.</p>
        <p>• Tarifa de cancelación aplica si cancelas con menos de <strong>2 horas</strong> de anticipación.</p>
        <p><em>Recomendamos pago por transferencia para asegurar cupos.</em></p>
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
    let bodyContent = '';

    switch (type) {
      case 'pending':
        subject = '⚠️ Tu cita está PENDIENTE - AJ Studio';
        bodyContent = `
          <h2>Hola ${appointmentData?.clientName},</h2>
          <p>Tu solicitud de reserva está <strong style="color: #f39c12 !important;">PENDIENTE</strong> de aprobación.</p>
          ${appointmentDetailsHTML}
          <p>Para agilizar la confirmación, comunícate con tu barbero vía WhatsApp:</p>
          ${wsButtonHTML}
          ${policyHTML}
        `;
        htmlContent = buildHTML(bodyContent);
        break;

      case 'confirmed':
        subject = '✅ Cita Confirmada - AJ Studio';
        bodyContent = `
          <h2>¡Excelente ${appointmentData?.clientName}!</h2>
          <p>Tu cita ha sido <strong style="color: #2ecc71 !important;">CONFIRMADA</strong>. Tu cupo está asegurado.</p>
          ${appointmentDetailsHTML}
          ${wsButtonHTML}
          ${policyHTML}
        `;
        htmlContent = buildHTML(bodyContent);
        break;

      case 'canceled':
        subject = '❌ Cita Cancelada - AJ Studio';
        bodyContent = `
          <h2>Hola ${appointmentData?.clientName},</h2>
          <p>Tu cita para el <strong>${appointmentData?.date} a las ${appointmentData?.time}</strong> ha sido cancelada.</p>
          <p>Si deseas reagendar, escríbele a tu barbero o agenda nuevamente en la web.</p>
          ${wsButtonHTML}
          <div style="text-align: center; margin-top: 15px;">
            <a href="https://ajstudio.vercel.app/book" class="btn btn-gold">Agendar Nueva Cita</a>
          </div>
        `;
        htmlContent = buildHTML(bodyContent);
        break;

      case 'completed': 
        subject = '💈 ¡Gracias por tu visita a AJ Studio!';
        bodyContent = `
          <h2>Hola ${appointmentData?.clientName},</h2>
          <p>Esperamos que hayas disfrutado tu servicio de <strong>${appointmentData?.serviceName}</strong> con ${appointmentData?.barberName}.</p>
          <p>Para nosotros es muy importante seguir mejorando. ¿Qué tal te pareció la experiencia?</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://g.page/r/tu-enlace-de-google/review" class="btn btn-gold">Calificar Servicio ⭐⭐⭐⭐⭐</a>
          </div>
        `;
        htmlContent = buildHTML(bodyContent);
        break;

      case 'reminder':
        const resolvedName = clientName || 'Cliente';
        subject = '💈 ¡Ya toca un retoque! ✂️';
        bodyContent = `
          <h2>Hola ${resolvedName},</h2>
          <p>Notamos que han pasado un par de semanas desde tu última visita a nuestra barbería.</p>
          <p>¿Ya es hora de un retoque? Mantén tu estilo impecable agendando una nueva cita con nosotros, los barberos te están esperando.</p>
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://ajstudio.vercel.app/book" class="btn btn-gold">Reservar Nueva Cita</a>
          </div>
        `;
        htmlContent = buildHTML(bodyContent);
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