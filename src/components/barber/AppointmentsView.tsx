import { useState, useEffect } from "react";
// Agregamos Mail al import para usarlo
import { Clock, DollarSign, Phone, MessageCircle, Scissors, Search, Loader2, Mail, Copy } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { type Appointment } from "../../models/Appointment"; 
import { sendConfirmationMessage } from "../../utils/whatsapp";
import { copyToClipboard } from "../../utils/clipboard";

const AppointmentsView = ({ barberId }: { barberId: string }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. CORRECCIÓN: Los estados van AQUÍ (Nivel superior), NO dentro de useEffect
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 2. CORRECCIÓN: La función va AQUÍ
  const handleCopyEmail = (email: string, id: string) => {
    const success = copyToClipboard(email); 
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); 
    }
  };

  useEffect(() => {
    if (!barberId) return;

    const q = query(
      collection(db, "appointments"),
      where("barberId", "==", barberId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

      dbData.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

      setAppointments(dbData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [barberId]);

  // FILTRADO LOCAL
  const filteredAppointments = appointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = appt.clientName ? appt.clientName.toLowerCase().includes(term) : false;
    const idMatch = appt.id.toLowerCase().includes(term);
    const dateMatch = appt.date.includes(term);
    return nameMatch || idMatch || dateMatch;
  });

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando citas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-txt-muted" />
        </div>
        <input
          type="text"
          placeholder="Buscar por cliente, ID o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
        />
      </div>

      {/* RESULTADOS */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed">
          <p className="text-txt-main font-bold">No hay reservas encontradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appt) => (
            <div 
              key={appt.id} 
              className="bg-bg-card rounded-xl border border-white/5 overflow-hidden hover:border-gold/30 transition-all shadow-lg group hover:-translate-y-1 duration-300"
            >
              {/* CABECERA */}
              <div className="bg-white/5 p-4">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2 text-xl font-black text-white">
                    <Clock className="text-gold" size={20} />
                    {appt.time}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${
                    appt.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {appt.status === 'confirmed' ? 'Confirmada' : appt.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[14px] text-txt-muted font-mono bg-black/20 w-fit px-5 py-0.5 rounded">
                  <span>{appt.shortId ? appt.shortId : appt.id.slice(0, 6)}</span>
                </div>
              </div>

              {/* DETALLES */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-txt-main mb-1">{appt.clientName}</h3>
                  <div className="flex flex-col gap-1 text-xs text-txt-muted">
                    
                    {/* CORREO + ÍCONO MAIL + BOTÓN COPIAR */}
                    <div className="text-sm text-txt-muted flex items-center gap-2">
                      {/* Aquí usamos el ícono Mail que querías */}
                      <Mail size={14} className="text-gold/70" />
                      
                      <span className="truncate max-w-[150px]">{appt.clientEmail}</span>
                      
                      <button 
                          onClick={() => handleCopyEmail(appt.clientEmail, appt.id)}
                          className="text-gold/50 hover:text-gold transition-colors p-1"
                          title="Copiar correo"
                      >
                          {copiedId === appt.id 
                              ? <span className="text-[10px] text-green-500 font-bold">¡OK!</span> 
                              : <Copy size={14} />
                          }
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gold/70" /> {appt.clientPhone}
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5"></div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase text-txt-muted font-bold tracking-wider mb-1">Servicio</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Scissors size={14} className="text-gold" />
                      {appt.serviceName}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-txt-muted font-bold tracking-wider mb-1">Fecha</p>
                    <p className="text-xs text-white">{appt.date}</p>
                  </div>
                </div>
                
                 <div className="bg-bg-main rounded-lg p-3 border border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase text-txt-muted font-bold">Valor</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-gold">
                    <DollarSign size={16} />
                    {appt.price || '-'}
                  </div>
                </div>

              </div>

              {/* BOTONES DE CONTACTO */}
              <div className="grid grid-cols-2 border-t border-white/5 divide-x divide-white/5">
                  <a href={`tel:${appt.clientPhone}`} className="p-3 flex justify-center items-center gap-2 hover:bg-gold hover:text-bg-main transition-colors text-xs font-bold text-txt-muted">
                      <Phone size={14} /> Llamar
                  </a>
                  {/* CORRECCIÓN FINAL: Usamos onClick en vez de href para WhatsApp */}
                  <button 
                    onClick={() => sendConfirmationMessage(appt)} 
                    className="p-3 flex justify-center items-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-xs font-bold text-green-500"
                  >
                      <MessageCircle size={14} /> WhatsApp
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;