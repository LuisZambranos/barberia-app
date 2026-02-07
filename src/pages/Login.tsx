import { useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // --- ESTADOS DEL FORMULARIO ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Hook para redirigir al usuario
  const navigate = useNavigate();

  // --- FUNCIÓN PRINCIPAL DE ENVÍO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // === BLOQUE DE REGISTRO ===
        // 1. Crea el usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Crea la ficha del usuario en la base de datos (Firestore)
        // Se guarda con el rol "client" por defecto
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          rol: "client",
          createdAt: new Date().toISOString()
        });
        
        // 3. Redirige al inicio tras registro exitoso
        navigate("/");

      } else {
        // === BLOQUE DE INICIO DE SESIÓN ===
        // 1. Verifica credenciales con Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Busca los datos del usuario en Firestore para saber su rol
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // 3. Redirección inteligente según el rol (Admin o Cliente)
          if (userData.rol === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          // Si el usuario existe en Auth pero no en DB, lo mandamos al home
          navigate("/");
        }
      }
    } catch (err: any) {
      // === MANEJO DE ERRORES ===
      // Traduce los códigos de error técnicos a mensajes amigables
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
      // Libera el estado de carga pase lo que pase
      setIsLoading(false);
    }
  };

  // --- RENDERIZADO VISUAL ---
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 font-sans text-txt-main">
      {/* Tarjeta Principal */}
      <div className="w-full max-w-md bg-bg-card border border-white/10 p-10 rounded-sm shadow-2xl relative overflow-hidden">
        
        {/* Línea Decorativa Superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gold to-transparent"></div>
        
        {/* Encabezado: Título y Subtítulo */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-txt-main uppercase tracking-tighter mb-2 italic">
            BARBER <span className="text-gold">SHOP</span>
          </h2>
          <p className="text-[10px] text-txt-muted font-bold uppercase tracking-[0.4em]">
            {isRegistering ? "CREA TU CUENTA" : "INICIA SESIÓN"}
          </p>
        </div>

        {/* Formulario de Entrada */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Campo: Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">
              Email
            </label>
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

          {/* Campo: Contraseña */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">
              Contraseña
            </label>
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

          {/* Mensaje de Error (solo si existe) */}
          {error && (
            <p className="text-error text-[10px] text-center uppercase font-bold tracking-widest">
              {error}
            </p>
          )}

          {/* Botón de Acción Principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gold hover:bg-gold-hover text-bg-main font-black py-4 rounded-sm uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-gold/10 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : (isRegistering ? "Registrarse" : "Entrar")}
          </button>
        </form>

        {/* Botón para cambiar entre Login y Registro */}
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