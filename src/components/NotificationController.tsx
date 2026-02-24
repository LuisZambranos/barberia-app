import { useEffect, useRef, useState } from "react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const NotificationController = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Usamos useRef para saber si es la primera carga (y no sonar con las citas viejas)
  const isFirstLoad = useRef(true);
  
  // Guardamos las preferencias del barbero (si quiere sonido o no)
  const [prefs, setPrefs] = useState({ newBooking: true, cancellation: true });

  // 1. ESCUCHAR PREFERENCIAS DEL USUARIO
  useEffect(() => {
    // FIX TYPESCRIPT: Usamos (user as any) para poder acceder a .role sin errores
    if (!user || (user as any).role !== 'barber') return;

    const unsubPrefs = onSnapshot(doc(db, "barbers", user.uid), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.notifications) {
                setPrefs(data.notifications);
            }
        }
    });

    return () => unsubPrefs();
  }, [user]);

  // 2. ESCUCHAR NUEVAS CITAS (Globalmente)
  useEffect(() => {
    // FIX TYPESCRIPT: Lo mismo aquí, (user as any).role
    if (!user || (user as any).role !== 'barber') return;

    const q = query(
      collection(db, "appointments"),
      where("barberId", "==", user.uid)
    );

    const unsubAppts = onSnapshot(q, (snapshot) => {
      // Solo notificamos si NO es la primera carga
      if (!isFirstLoad.current) {
         snapshot.docChanges().forEach((change) => {
            // Si hay una reserva NUEVA y la preferencia está ACTIVA
            if (change.type === "added" && prefs.newBooking) {
                const data = change.doc.data();
                toast.success(`¡Nueva reserva de ${data.clientName}!`);
            }
            
            // Opcional: Alerta de cancelación
            if (change.type === "modified" && change.doc.data().status === 'cancelled' && prefs.cancellation) {
                 // toast.error(`Cita cancelada: ${change.doc.data().clientName}`);
            }
         });
      } else {
          // Ya cargó la primera vez, bajamos la bandera
          isFirstLoad.current = false;
      }
    });

    return () => unsubAppts();
  }, [user, prefs, toast]);

  // Este componente no renderiza nada visual, es solo lógica
  return null; 
};

export default NotificationController;