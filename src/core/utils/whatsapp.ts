import { type Appointment } from "../models/Appointment";

export const sendConfirmationMessage = (appt: Appointment) => {
  // 1. Limpieza del teléfono
  let phone = appt.clientPhone.replace(/\D/g, ''); 
  if (!phone.startsWith('56') && phone.length >= 8) {
    phone = `56${phone}`;
  }

  // 2. Emojis (Unicode)
  const wave = '\uD83D\uDC4B';      // 👋
  const pole = '\uD83D\uDC88';      // 💈
  const calendar = '\uD83D\uDCC5';  // 📅
  const clock = '\u23F0';           // ⏰
  const scissors = '\u2702\uFE0F';  // ✂️ (Decoración para el barbero)

  // 3. Limpiamos datos para evitar espacios feos dentro de las negritas
  const service = appt.serviceName.trim(); 
  const barber = appt.barberName ? appt.barberName.trim() : "nosotros";

  // 4. Armamos el mensaje INCLUYENDO AL BARBERO
  const message = `Hola *${appt.clientName}* ${wave}, te escribo de *Aj Studio*.\n\nQuería confirmar tu cita con *${barber}* ${scissors}: \n${pole} Servicio: *${service}*\n${calendar} Fecha: *${appt.date}*\n${clock} Hora: *${appt.time}*\n\n¿Me confirmas tu asistencia?`;

  // 5. Codificamos y enviamos
  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  window.open(url, '_blank');
};