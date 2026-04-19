// src/core/utils/date.utils.ts

export const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isTodayLocal = (dateString: string) => {
    return dateString === getLocalDateString();
};

export const isPastLocal = (dateString: string, timeString: string) => {
    const now = new Date();
    // Parseamos la fecha del string asumiendo formato local (YYYY-MM-DDTHH:MM:00)
    const [hours, minutes] = timeString.split(':');
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    const apptDate = new Date(`${dateString}T${formattedTime}`);
    return apptDate < now;
};

export const formatDateLocal = (dateString: string) => {
    // Usamos split para evitar que Date() convierta a UTC y salte de día
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
};