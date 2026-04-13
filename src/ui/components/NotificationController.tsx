import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDocs } from "firebase/firestore";
import { db } from "../../core/firebase/config";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const NotificationController = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  
  const [prefs, setPrefs] = useState({ newBooking: true, cancellation: true });
  
  // NUEVO ESTADO: Para guardar el ID real de la base de datos
  const [realBarberId, setRealBarberId] = useState<string | null>(null);

  // 1. BUSCAR EL ID REAL DEL BARBERO POR EMAIL
  useEffect(() => {
    if (!user || role !== 'barber' || !user.email) return;

    const findRealBarberId = async () => {
      try {
        const q = query(collection(db, "barbers"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setRealBarberId(querySnapshot.docs[0].id);
        } else {
          console.error("Notificaciones: No se encontró un barbero con el email", user.email);
        }
      } catch (error) {
        console.error("Error buscando ID de barbero:", error);
      }
    };

    findRealBarberId();
  }, [user, role]);

  // 2. ESCUCHAR PREFERENCIAS DEL USUARIO (Usando el ID real)
  useEffect(() => {
    if (!realBarberId) return;

    const unsubPrefs = onSnapshot(doc(db, "barbers", realBarberId), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.notifications) {
                setPrefs(data.notifications);
            }
        }
    });

    return () => unsubPrefs();
  }, [realBarberId]);

  // 3. ESCUCHAR NUEVAS CITAS 
  useEffect(() => {
    if (!realBarberId) return;

    let isInitialLoad = true; 

    const q = query(
      collection(db, "appointments"),
      where("barberId", "==", realBarberId) 
    );

    const unsubAppts = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) {
          isInitialLoad = false;
          return; 
      }

      snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && prefs.newBooking) {
              const data = change.doc.data();
              toast.success(`¡Nueva reserva de ${data.clientName}!`);
          }
      });
    });

    return () => unsubAppts();
  }, [realBarberId, prefs, toast]);

  return null; 
};

export default NotificationController;