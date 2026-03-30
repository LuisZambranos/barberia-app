// src/services/email.service.ts

export interface EmailData {
  to: string;
  clientName: string;
  barberName: string;
  date: string;
  time: string;
  serviceName: string;
  barberPhone: string;       // <-- FIJO: Obligatorio (sin el signo ?)
  paymentMethod?: string;    // <-- Para saber si es transferencia o efectivo
}

// Función privada genérica que hace la llamada al servidor
const sendEmailRequest = async (to: string, type: string, appointmentData: Partial<EmailData>) => {
  try {
    const response = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        type,
        appointmentData
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Correo de tipo [${type}] enviado exitosamente a ${to}`);
    return data;
  } catch (error) {
    console.error(`Error enviando correo de tipo [${type}]:`, error);
    throw error;
  }
};

// 1. Correo de Cita Pendiente (Requiere pago/confirmación)
export const sendPendingEmail = async (data: EmailData) => {
  return sendEmailRequest(data.to, 'pending', {
    clientName: data.clientName,
    barberName: data.barberName,
    date: data.date,
    time: data.time,
    serviceName: data.serviceName,
    barberPhone: data.barberPhone,     // <-- FIJO
    paymentMethod: data.paymentMethod  // <-- FIJO
  });
};

// 2. Correo de Cita Confirmada (Cupo asegurado)
export const sendConfirmationEmail = async (data: EmailData) => {
  return sendEmailRequest(data.to, 'confirmed', {
    clientName: data.clientName,
    barberName: data.barberName,
    date: data.date,
    time: data.time,
    serviceName: data.serviceName,
    barberPhone: data.barberPhone,     // <-- FIJO
    paymentMethod: data.paymentMethod  // <-- FIJO
  });
};

// 3. Correo de Cita Cancelada
export const sendCancellationEmail = async (data: EmailData) => {
  return sendEmailRequest(data.to, 'canceled', {
    clientName: data.clientName,
    barberName: data.barberName,
    date: data.date,
    time: data.time,
    barberPhone: data.barberPhone,     // <-- FIJO
  });
};

// 4. Correo de Cita Finalizada/Completada (Review)
export const sendReviewEmail = async (data: EmailData) => {
  return sendEmailRequest(data.to, 'completed', {
    clientName: data.clientName,
    barberName: data.barberName,
    serviceName: data.serviceName,
    barberPhone: data.barberPhone,     // <-- FIJO (por si quieres mandar WS en el review a futuro)
  });
};