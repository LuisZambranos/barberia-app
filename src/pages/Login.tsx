import { useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// 1. IMPORTAR useLocation
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  // 2. OBTENER EL ESTADO DE NAVEGACIÓN
  const location = useLocation();
  
  // Aquí recuperamos la ruta de donde venía el usuario (ej: /book). 
  // Si no venía de ningún lado, usamos "/" por defecto.
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // === REGISTRO ===
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          rol: "client",
          createdAt: new Date().toISOString()
        });
        
        // Al registrarse, lo mandamos a la ruta pendiente (Booking) o al Home
        navigate(from, { replace: true });

      } else {
        // === LOGIN ===
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          if (userData.rol === "admin") {
            navigate("/admin");
          } else {
            // 3. REDIRECCIÓN INTELIGENTE
            // Si intentó reservar, lo mandamos a reservar. Si no, al Home.
            navigate(from, { replace: true });
          }
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      let friendlyMessage = "Ocurrió un error. Inténtalo de nuevo.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = "Correo o contraseña incorrectos.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo ya está registrado.";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = "Error de red. Verifica tu conexión.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "La contraseña debe tener al menos 6 caracteres.";
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 font-sans text-txt-main">
      <div className="w-full max-w-md bg-bg-card border border-white/10 p-10 rounded-sm shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold to-transparent"></div>
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-txt-main uppercase tracking-tighter mb-2 italic">
            BARBER <span className="text-gold">SHOP</span>
          </h2>
          {/* Título dinámico corregido */}
          <p className="text-[10px] text-txt-muted font-bold uppercase tracking-[0.4em]">
            {isRegistering ? "Registrarse" : "Iniciar Sesión"}
          </p>
        </div>
        {/* Formulario de Entrada */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-error text-[10px] text-center uppercase font-bold tracking-widest">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gold hover:bg-gold-hover text-bg-main font-black py-4 rounded-sm uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-gold/10 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : (isRegistering ? "Registrarse" : "Entrar")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            className="text-[10px] text-txt-muted hover:text-gold uppercase tracking-widest transition-all"
            disabled={isLoading}
          >
            {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;