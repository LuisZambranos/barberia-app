import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../core/firebase/config";

interface AuthContextType {
  user: User | null;
  role: "client" | "barber" | "admin" | null;
  userName: string | null; 
  linkedBarberId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, userName: null, linkedBarberId: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"client" | "barber" | "admin" | null>(null);
  const [userName, setUserName] = useState<string | null>(null); 
  const [linkedBarberId, setLinkedBarberId] = useState<string | null>(null);
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
            setUserName(userDoc.data().name || currentUser.displayName || null); 
            setLinkedBarberId(userDoc.data().linkedBarberId || null);
          } else {
            setRole("client"); 
            setUserName(currentUser.displayName || null); 
            setLinkedBarberId(null);
          }
        } catch (error) {
          setRole(null);
          setUserName(null);
          setLinkedBarberId(null);
        }
      } else {
        setUser(null);
        setRole(null);
        setUserName(null); 
        setLinkedBarberId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, userName, linkedBarberId, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}