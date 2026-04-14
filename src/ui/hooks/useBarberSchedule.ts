import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../core/firebase/config";
import { getLocalDateString } from "../../core/utils/date.utils"; 

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
        const barberRef = doc(db, "barbers", barberId);
        const barberPromise = getDoc(barberRef);

        const qAppointments = query(
            collection(db, "appointments"),
            where("barberId", "==", barberId),
            where("date", "==", date),
            where("status", "!=", "cancelled") 
        );
        const appointmentsPromise = getDocs(qAppointments);

        const qLocks = query(
            collection(db, "locks"),
            where("barberId", "==", barberId),
            where("date", "==", date)
        );
        const locksPromise = getDocs(qLocks);

        const [barberSnap, appointmentsSnap, locksSnap] = await Promise.all([
          barberPromise, 
          appointmentsPromise,
          locksPromise
        ]);

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
                const parts = date.split('-');
                const localDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                const currentDayIndex = localDate.getDay(); 
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
        
        // --- AQUÍ ESTÁ LA MAGIA DEL SWITCH ---
        const takenAppointments = appointmentsSnap.docs
            .map(doc => doc.data())
            .filter(appt => {
                // Si es Cita Rápida Y el barbero marcó "Solo contable" (blocksSchedule en false),
                // lo sacamos de la lista de horas ocupadas para que la web la siga mostrando disponible.
                if (appt.isWalkIn === true && appt.blocksSchedule === false) {
                    return false; 
                }
                return true;
            })
            .map(appt => appt.time);

        const now = new Date().getTime();
        const activeLocks = locksSnap.docs
            .map(doc => doc.data())
            .filter(lockData => lockData.expiresAt > now) 
            .map(lockData => lockData.time);

        const allTakenTimes = [...takenAppointments, ...activeLocks];

        const times: string[] = [];
        
        const isToday = date === getLocalDateString();
        const currentHour = new Date().getHours();
        
        for (let i = startHour; i < endHour; i++) {
          const timeSlot = `${i}:00`;
          
          if (isToday && i <= currentHour) {
              continue;
          }

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