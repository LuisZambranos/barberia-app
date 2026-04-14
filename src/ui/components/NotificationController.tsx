import { useEffect, useState, useRef } from "react";
import { collection, query, where, onSnapshot, doc, getDocs } from "firebase/firestore";
import { db } from "../../core/firebase/config";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const NotificationController = () => {
  const { user, role, linkedBarberId } = useAuth(); // Usamos el linkedBarberId si existe
  const { toast } = useToast();
  
  const [prefs, setPrefs] = useState({ newBooking: true, cancellation: true });
  const [realBarberId, setRealBarberId] = useState<string | null>(null);
  
  // MEMORIA ANTI-DUPLICADOS: Guarda los IDs de citas que ya notificamos
  const notifiedAppts = useRef<Set<string>>(new Set());

  // 1. BUSCAR EL ID REAL DEL BARBERO POR EMAIL (o usar el del AuthContext)
  useEffect(() => {
    if (!user || (role !== 'barber' && role !== 'admin') || !user.email) return;

    // Si ya lo tenemos en el contexto por el registro enlazado, lo usamos directo
    if (linkedBarberId) {
      setRealBarberId(linkedBarberId);
      return;
    }

    // Si no, lo buscamos en Firestore (para barberos creados de la forma antigua)
    const findRealBarberId = async () => {
      try {
        const q = query(collection(db, "barbers"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setRealBarberId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error buscando ID de barbero:", error);
      }
    };

    findRealBarberId();
  }, [user, role, linkedBarberId]);

  // 2. ESCUCHAR PREFERENCIAS DEL USUARIO
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

  // 3. ESCUCHAR NUEVAS CITAS Y DISPARAR EL TOAST
  useEffect(() => {
    if (!realBarberId) return;

    let isInitialLoad = true; 

    const q = query(
      collection(db, "appointments"),
      where("barberId", "==", realBarberId) 
    );

    const unsubAppts = onSnapshot(q, (snapshot) => {
      // Evitamos notificar todo el historial al abrir la app
      if (isInitialLoad) {
          isInitialLoad = false;
          snapshot.docs.forEach(doc => notifiedAppts.current.add(doc.id));
          return; 
      }

      snapshot.docChanges().forEach((change) => {
          // Solo si es una cita NUEVA y el barbero quiere recibir notificaciones
          if (change.type === "added" && prefs.newBooking) {
              const docId = change.doc.id;
              const data = change.doc.data();
              
              // Evitamos que las citas rápidas del Walk-in le avisen al mismo barbero que las acaba de crear
              if (data.isWalkIn) return;

              // VERIFICACIÓN ANTI-DUPLICADOS
              if (!notifiedAppts.current.has(docId)) {
                  notifiedAppts.current.add(docId); // Lo anotamos en memoria
                  
                  // Lanzamos el Toast visual con el texto que me pediste
                  toast.success(`${data.clientName} ha reservado`);
              }
          }
      });
    });

    return () => unsubAppts();
  }, [realBarberId, prefs, toast]);

  // Este componente es invisible, solo ejecuta lógica en segundo plano
  return null; 
};

export default NotificationController;