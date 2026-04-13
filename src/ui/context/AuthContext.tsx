import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../core/firebase/config";

interface AuthContextType {
  user: User | null;
  role: "client" | "barber" | "admin" | null;
  userName: string | null; // <-- 1. Agregamos userName al tipo
  loading: boolean;
}

// 2. Agregamos userName con valor por defecto null
const AuthContext = createContext<AuthContextType>({ user: null, role: null, userName: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"client" | "barber" | "admin" | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // <-- 3. Creamos el estado para el nombre
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().rol);
            // 4. Sacamos el nombre de la BD y lo guardamos
            setUserName(userDoc.data().name || currentUser.displayName || null); 
          } else {
            setRole("client"); 
            setUserName(currentUser.displayName || null); // Fallback por si acaso
          }
        } catch (error) {
          setRole(null);
          setUserName(null);
        }
      } else {
        setUser(null);
        setRole(null);
        setUserName(null); // Limpiamos al cerrar sesión
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    // 5. Proveemos userName al resto de la aplicación
    <AuthContext.Provider value={{ user, role, userName, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}