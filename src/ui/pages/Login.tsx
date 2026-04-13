import { useState, useEffect } from "react";
import { auth, db } from "../../core/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // <-- Importamos los iconos del ojo
import { useAuth } from "../context/AuthContext"; // <-- Importamos el contexto para el guardián

const Login = () => {
  // Estados originales y de CRM
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // --- NUEVOS ESTADOS PARA CONTRASEÑAS ---
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  
  const { user, role } = useAuth();

  // GUARDIÁN SILENCIOSO: Si el usuario ya está logueado y tiene rol, sácalo del Login automáticamente.
  // Esto evita que te devuelva al formulario si recargas la página o por retrasos de Firebase.
  useEffect(() => {
    if (user && role) {
      if (role === "admin" || role === "barber") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from === "/login" ? "/" : from, { replace: true });
      }
    }
  }, [user, role, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // === VALIDACIONES DE REGISTRO ===
        if (name.trim() === "" || phone.trim() === "") {
            throw new Error("missing-fields");
        }
        if (password !== confirmPassword) {
            throw new Error("passwords-dont-match");
        }

        // === REGISTRO ===
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Guardar en Firestore para el CRM
        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          name: name.trim(),      
          phone: phone.trim(),    
          rol: "client",
          createdAt: new Date().toISOString()
        });
        
        // No necesitamos hacer navigate() aquí porque el useEffect de arriba 
        // lo atrapará automáticamente en cuanto detecte la nueva sesión.

      } else {
        // === LOGIN ===
        await signInWithEmailAndPassword(auth, email, password);
        // Igual que arriba, el useEffect se encargará de mover al usuario.
      }
    } catch (err: any) {
      let friendlyMessage = "Ocurrió un error. Inténtalo de nuevo.";
      
      if (err.message === "missing-fields") {
          friendlyMessage = "Por favor, completa todos los campos.";
      } else if (err.message === "passwords-dont-match") {
          friendlyMessage = "Las contraseñas no coinciden.";
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = "Correo o contraseña incorrectos.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo ya está registrado.";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = "Error de red. Verifica tu conexión.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "La contraseña debe tener al menos 6 caracteres.";
      }
      
      setError(friendlyMessage);
      setIsLoading(false); // Solo quitamos el loading si hay error
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
          <p className="text-[10px] text-txt-muted font-bold uppercase tracking-[0.4em]">
            {isRegistering ? "Crea tu Cuenta" : "Iniciar Sesión"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* CAMPOS DE CRM (Solo en Registro) */}
          {isRegistering && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all"
                        required={isRegistering}
                        disabled={isLoading}
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">Número de WhatsApp</label>
                    <input
                        type="tel"
                        placeholder="Ej: +56 9 1234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-bg-main border border-white/5 p-4 text-txt-main text-xs outline-none focus:border-gold/50 transition-all"
                        required={isRegistering}
                        disabled={isLoading}
                    />
                </div>
             </div>
          )}

          {/* EMAIL */}
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

          {/* CONTRASEÑA (Con botón de ojo) */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-main border border-white/5 p-4 pr-12 text-txt-main text-xs outline-none focus:border-gold/50 transition-all"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
          </div>

          {/* CONFIRMAR CONTRASEÑA (Solo en Registro) */}
          {isRegistering && (
             <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-[9px] font-bold text-txt-muted uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-bg-main border border-white/5 p-4 pr-12 text-txt-main text-xs outline-none focus:border-gold/50 transition-all"
                      required={isRegistering}
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted hover:text-gold transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
             </div>
          )}

          {error && <p className="text-error text-[10px] text-center uppercase font-bold tracking-widest">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gold hover:bg-gold-hover text-bg-main font-black py-4 rounded-sm uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-gold/10 active:scale-95 disabled:opacity-50 mt-2"
          >
            {isLoading ? "Procesando..." : (isRegistering ? "Crear Cuenta" : "Entrar")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { 
                setIsRegistering(!isRegistering); 
                setError(""); 
                // Limpiamos todo al cambiar de modo
                setName(""); 
                setPhone(""); 
                setPassword("");
                setConfirmPassword("");
            }}
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