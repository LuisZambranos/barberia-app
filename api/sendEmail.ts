import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  // Headers CORS para que tu frontend pueda llamarlo
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder rápido al preflight request del navegador
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST permitido" });
  }

  // Extraemos el 'type' para saber qué correo enviar
  const { to, clientName, type } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Contraseña de aplicación si usas Gmail
      },
    });

    let subject = "";
    let htmlContent = "";

    // LÓGICA DEL CRM: Evaluamos qué tipo de correo es
    if (type === 'reminder') {
        subject = "¡Ya toca un retoque! ✂️";
        htmlContent = `
          <div style="font-family: sans-serif; text-align: center; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fafafa;">
            <h2 style="color: #111;">¡Hola ${clientName}!</h2>
            <p style="color: #666; line-height: 1.6;">Ya han pasado 15 días desde tu último corte. ¿Qué tal si agendamos un retoque para mantener ese estilo impecable?</p>
            <a href="https://TU_LINK_DE_RESERVA.com" style="background-color: #D4AF37; color: #111; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Agendar mi Cita</a>
          </div>
        `;
    } else {
        subject = "¡Gracias por tu visita! ¿Qué tal quedó el corte?";
        htmlContent = `
          <div style="font-family: sans-serif; text-align: center; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fafafa;">
            <h2 style="color: #111;">¡Hola ${clientName}!</h2>
            <p style="color: #666; line-height: 1.6;">Esperamos que hayas quedado feliz con tu corte y la experiencia de hoy en nuestra barbería.</p>
            <p style="color: #666; line-height: 1.6;">Nos ayudaría muchísimo si nos regalas 5 estrellas en Google Maps. ¡Toma solo 10 segundos y nos ayuda a crecer enormemente!</p>
            <a href="https://g.page/r/TU_LINK_DE_RESEÑA" style="background-color: #D4AF37; color: #111; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Dejar mi reseña ⭐️⭐️⭐️⭐️⭐️</a>
          </div>
        `;
    }

    // Enviamos el correo con el asunto y diseño correspondiente
    await transporter.sendMail({
      from: `"Barber Shop" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    });

    return res.status(200).json({ success: true, message: "Email enviado exitosamente" });

  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ success: false, error: "Error enviando email" });
  }
}