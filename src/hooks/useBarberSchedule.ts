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
        const barberRef = doc(db, "barbers", barberId);
        const barberPromise = getDoc(barberRef);

        const q = query(
            collection(db, "appointments"),
            where("barberId", "==", barberId),
            where("date", "==", date),
            where("status", "!=", "cancelled") 
        );
        const appointmentsPromise = getDocs(q);

        const [barberSnap, appointmentsSnap] = await Promise.all([
          barberPromise, 
          appointmentsPromise
        ]);

        // --- PROCESAMIENTO DE DATOS ---
        let startHour = DEFAULT_START;
        let endHour = DEFAULT_END;
        let isDayEnabled = true; // Bandera para saber si trabaja ese día

        if (barberSnap.exists()) {
          const data = barberSnap.data();
          if (data.schedule) {
            
            // 1. Revisar si la agenda está apagada por completo (vacaciones)
            if (data.schedule.active === false) {
                isDayEnabled = false;
            }

            // 2. Revisar si el día específico está apagado (ej. Domingo)
            if (data.schedule.days) {
                // Truco: Agregamos T12:00:00 para evitar que la zona horaria nos cambie el día
                const currentDayIndex = new Date(date + "T12:00:00").getDay(); 
                
                // getDay() devuelve 0 para Domingo, 1 para Lunes, etc.
                const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                const dayKey = daysMap[currentDayIndex];

                // Si en la BD ese día está en false, desactivamos el día
                if (data.schedule.days[dayKey] === false) {
                    isDayEnabled = false;
                }
            }

            // 3. Asignar horas de apertura y cierre
            if (data.schedule.start) startHour = parseInt(data.schedule.start.split(":")[0]);
            if (data.schedule.end) endHour = parseInt(data.schedule.end.split(":")[0]);
          }
        }

        // Si el día NO está habilitado (es domingo y no trabaja), devolvemos un array vacío de inmediato
        if (!isDayEnabled) {
            setAvailableTimes([]);
            setLoadingSchedule(false);
            return;
        }

        // B. Listar horas ocupadas
        const takenTimes = appointmentsSnap.docs.map(doc => doc.data().time);

        // C. Generar Array Final solo si el día es laborable
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