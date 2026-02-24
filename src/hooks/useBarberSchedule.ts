import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const DEFAULT_START = 10;
const DEFAULT_END = 20;

export const useBarberSchedule = (barberId: string | undefined, date: string) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    const fetchScheduleAndAvailability = async () => {
      if (!barberId || !date) {
        setAvailableTimes([]);
        return;
      }

      setLoadingSchedule(true);
      
      try {
        // --- OPTIMIZACIÓN: PARALELISMO ---
        // Preparamos las dos peticiones PERO NO les ponemos 'await' todavía
        
        // 1. Petición del Perfil (Horario)
        const barberRef = doc(db, "barbers", barberId);
        const barberPromise = getDoc(barberRef);

        // 2. Petición de Citas (Ocupadas)
        const q = query(
            collection(db, "appointments"),
            where("barberId", "==", barberId),
            where("date", "==", date),
            where("status", "!=", "cancelled") 
        );
        const appointmentsPromise = getDocs(q);

        // 3. ¡DISPARAMOS AMBAS JUNTAS! (Esperamos al más lento, no a la suma de los dos)
        const [barberSnap, appointmentsSnap] = await Promise.all([
          barberPromise, 
          appointmentsPromise
        ]);

        // --- PROCESAMIENTO DE DATOS ---
        
        // A. Calcular Inicio y Fin
        let startHour = DEFAULT_START;
        let endHour = DEFAULT_END;

        if (barberSnap.exists()) {
          const data = barberSnap.data();
          if (data.schedule && data.schedule.active) {
            startHour = parseInt(data.schedule.start.split(":")[0]);
            endHour = parseInt(data.schedule.end.split(":")[0]);
          }
        }

        // B. Listar horas ocupadas
        const takenTimes = appointmentsSnap.docs.map(doc => doc.data().time);

        // C. Generar Array Final
        const times: string[] = [];
        for (let i = startHour; i < endHour; i++) {
          const timeSlot = `${i}:00`;
          // Solo agregamos si NO está tomada
          if (!takenTimes.includes(timeSlot)) {
             times.push(timeSlot);
          }
        }
        
        setAvailableTimes(times);

      } catch (error) {
        console.error("Error calculando disponibilidad:", error);
        setAvailableTimes([]);
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchScheduleAndAvailability();
  }, [barberId, date]);

  return { availableTimes, loadingSchedule };
};