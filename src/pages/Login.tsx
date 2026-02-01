import { useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log("Login: Inicio de proceso submit.");
    console.log(`Login: Modo = ${isRegistering ? "REGISTRO" : "LOGIN"}`);
    console.log("Login: Email ingresado:", email);

    try {
      if (isRegistering) {
        // --- PROCESO DE REGISTRO ---
        console.log("Login: Intentando crear usuario en Firebase Auth...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Login: Usuario creado en Auth con éxito. UID:", user.uid);

        console.log("Login: Guardando datos en Firestore colección 'users'...");
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          rol: "client",
          createdAt: new Date().toISOString()
        });
        console.log("Login: Documento guardado en Firestore correctamente.");
        
        console.log("Login: Redirigiendo al Home...");
        navigate("/");
      } else {
        // --- PROCESO DE LOGIN ---
        console.log("Login: Intentando loguear con Firebase Auth...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Login: Auth exitoso. UID:", user.uid);

        console.log(`Login: Buscando documento en 'users/${user.uid}' para verificar rol...`);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("Login: Documento encontrado. Datos:", userData);
          
          if (userData.rol === "admin") {
            console.log("Login: Es admin. Redirigiendo a /admin");
            navigate("/admin");
          } else {
            console.log("Login: Es cliente/barbero. Redirigiendo a /");
            navigate("/");
          }
        } else {
          console.warn("Login: El usuario entró pero NO tiene ficha en base de datos. Redirigiendo a Home por defecto.");
          navigate("/");
        }
      }
    } catch (err: any) {
      console.error("Login: ERROR CAPTURADO:", err);
      console.error("Login: Código de error:", err.code);
      console.error("Login: Mensaje:", err.message);

      let friendlyMessage = "Ocurrió un error. Inténtalo de nuevo.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = "Correo o contraseña incorrectos.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo ya está registrado.";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = "Error de red. Verifica tu conexión.";
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
      console.log("Login: Proceso finalizado (loading false).");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 p-10 rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic">
            BARBER <span className="text-[#D4AF37]">SHOP</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Acceso de usuarios</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/5 p-4 text-white text-xs outline-none focus:border-[#D4AF37]/50 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/5 p-4 text-white text-xs outline-none focus:border-[#D4AF37]/50 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] text-center uppercase font-bold tracking-widest">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0f172a] font-black py-4 rounded-sm uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-[#D4AF37]/10 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : (isRegistering ? "Registrarse" : "Entrar")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            className="text-[10px] text-slate-500 hover:text-[#D4AF37] uppercase tracking-widest transition-all"
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