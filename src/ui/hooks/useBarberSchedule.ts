import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../core/firebase/config";

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
        // --- OPTIMIZACIÓN: PARALELISMO CON LOCKS ---
        const barberRef = doc(db, "barbers", barberId);
        const barberPromise = getDoc(barberRef);

        // 1. Promesa de citas confirmadas/pendientes
        const qAppointments = query(
            collection(db, "appointments"),
            where("barberId", "==", barberId),
            where("date", "==", date),
            where("status", "!=", "cancelled") 
        );
        const appointmentsPromise = getDocs(qAppointments);

        // 2. NUEVO: Promesa de bloqueos temporales (Asientos de cine)
        const qLocks = query(
            collection(db, "locks"),
            where("barberId", "==", barberId),
            where("date", "==", date)
        );
        const locksPromise = getDocs(qLocks);

        // Ejecutamos las 3 consultas al mismo tiempo para máxima velocidad
        const [barberSnap, appointmentsSnap, locksSnap] = await Promise.all([
          barberPromise, 
          appointmentsPromise,
          locksPromise
        ]);

        // --- PROCESAMIENTO DE DATOS ---
        let startHour = DEFAULT_START;
        let endHour = DEFAULT_END;
        let isDayEnabled = true;

        if (barberSnap.exists()) {
          const data = barberSnap.data();
          if (data.schedule) {
            if (data.schedule.active === false) {
                isDayEnabled = false;
            }

            if (data.schedule.days) {
                const currentDayIndex = new Date(date + "T12:00:00").getDay(); 
                const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                const dayKey = daysMap[currentDayIndex];

                if (data.schedule.days[dayKey] === false) {
                    isDayEnabled = false;
                }
            }

            if (data.schedule.start) startHour = parseInt(data.schedule.start.split(":")[0]);
            if (data.schedule.end) endHour = parseInt(data.schedule.end.split(":")[0]);
          }
        }

        if (!isDayEnabled) {
            setAvailableTimes([]);
            setLoadingSchedule(false);
            return;
        }

        // --- B. LISTAR HORAS OCUPADAS Y BLOQUEADAS ---
        
        // Citas reales guardadas
        const takenAppointments = appointmentsSnap.docs.map(doc => doc.data().time);

        // Bloqueos temporales vigentes
        const now = new Date().getTime();
        const activeLocks = locksSnap.docs
            .map(doc => doc.data())
            // FILTRO CLAVE: Solo tomamos en cuenta los bloqueos que NO han expirado
            .filter(lockData => lockData.expiresAt > now) 
            .map(lockData => lockData.time);

        // Unimos ambas listas (Las horas ocupadas reales + Las horas reservadas temporalmente)
        const allTakenTimes = [...takenAppointments, ...activeLocks];

        // --- C. GENERAR ARRAY FINAL ---
        const times: string[] = [];
        for (let i = startHour; i < endHour; i++) {
          const timeSlot = `${i}:00`;
          // Solo agregamos si NO está en nuestra lista combinada de ocupadas/bloqueadas
          if (!allTakenTimes.includes(timeSlot)) {
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