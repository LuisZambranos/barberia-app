import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  X,
  Phone,
  Mail,
  Calendar,
  Scissors,
  Star,
  ChevronDown,
  ChevronUp,
  Crown,
  Clock,
  Loader2,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../core/firebase/config";
import { useAdminAppointments } from "../../hooks/useAdminAppointments";
import { formatDateLocal } from "../../../core/utils/date.utils";
import type { Appointment } from "../../../core/models/Appointment";

// --- Tipos Internos del CRM ---
interface UserAccount {
  uid: string;
  name: string;
  email: string;
  phone?: string;
}

interface ClientProfile {
  uid: string;
  name: string;          // Nombre registrado en la cuenta
  email: string;         // Correo = clave única de la cuenta
  phone: string;         // Teléfono asociado (de las citas)
  totalVisits: number;
  lastVisitDate: string | null;
  favoriteBarber: string | null;
  usualService: string | null;
}

// --- Elemento más frecuente en un array ---
const getMostFrequent = (items: string[]): string | null => {
  if (items.length === 0) return null;
  const freq: Record<string, number> = {};
  items.forEach((item) => { freq[item] = (freq[item] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
};

// --- Sub-componente: Tarjeta de Cliente ---
const ClientCard = ({ client }: { client: ClientProfile }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
        expanded
          ? "border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Cabecera siempre visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left group"
      >
        {/* Avatar con inicial del nombre registrado */}
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
          <span className="text-gold font-black text-lg uppercase">
            {client.name.charAt(0)}
          </span>
        </div>

        {/* Nombre y datos rápidos */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base truncate">{client.name}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-txt-muted text-xs truncate max-w-[200px]">
              <Mail size={10} className="shrink-0" /> {client.email}
            </span>
            {client.phone && client.phone !== "Local" && (
              <span className="flex items-center gap-1 text-txt-muted text-xs">
                <Phone size={10} /> {client.phone}
              </span>
            )}
          </div>
        </div>

        {/* Visitas + flecha */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-gold font-black text-lg">{client.totalVisits}</p>
            <p className="text-txt-muted text-xs uppercase tracking-widest">
              {client.totalVisits === 1 ? "visita" : "visitas"}
            </p>
          </div>
          <div className="text-txt-muted group-hover:text-gold transition-colors">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Panel VIP expandido */}
      {expanded && (
        <div className="border-t border-white/10 p-4 bg-black/20 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Saludo VIP */}
          <div className="bg-gold/10 border border-gold/20 rounded-lg p-3 mb-4 flex items-start gap-3">
            <Crown size={16} className="text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-gold/90 italic leading-relaxed">
              {`"Hola ${client.name.split(" ")[0]}, ¿${
                client.usualService
                  ? `lo de siempre "${client.usualService}"`
                  : "lo de siempre"
              }${client.favoriteBarber ? ` con ${client.favoriteBarber}` : ""}?"`}
            </p>
          </div>

          {/* Stats VIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-bg-main rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={13} className="text-gold" />
                <p className="text-txt-muted text-xs uppercase tracking-widest font-bold">Última visita</p>
              </div>
              <p className="text-white font-bold text-sm">
                {client.lastVisitDate ? formatDateLocal(client.lastVisitDate) : "Sin registro"}
              </p>
            </div>

            <div className="bg-bg-main rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Star size={13} className="text-gold" />
                <p className="text-txt-muted text-xs uppercase tracking-widest font-bold">Con quién se corta</p>
              </div>
              <p className="text-white font-bold text-sm">
                {client.favoriteBarber ?? "Sin datos"}
              </p>
            </div>

            <div className="bg-bg-main rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Scissors size={13} className="text-gold" />
                <p className="text-txt-muted text-xs uppercase tracking-widest font-bold">Servicio habitual</p>
              </div>
              <p className="text-white font-bold text-sm">
                {client.usualService ?? "Sin datos"}
              </p>
            </div>
          </div>

          {/* Contacto rápido */}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/40 rounded-lg px-3 py-2 text-xs text-txt-muted hover:text-white transition-all"
            >
              <Mail size={12} className="text-gold" />
              {client.email}
            </a>
            {client.phone && client.phone !== "Local" && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/40 rounded-lg px-3 py-2 text-xs text-txt-muted hover:text-white transition-all"
              >
                <Phone size={12} className="text-gold" />
                {client.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal ---
const AdminClients = () => {
  const { appointments, loading: apptLoading } = useAdminAppointments();
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Cargamos TODOS los usuarios con rol 'client' desde la colección `users`
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(collection(db, "users"), where("rol", "==", "client"));
        const snapshot = await getDocs(q);
        const accounts: UserAccount[] = snapshot.docs
          .map((doc) => ({
            uid: doc.id,
            name: doc.data().name ?? "Sin nombre",
            email: doc.data().email ?? "",
          }))
          .filter((u) => u.email); // Solo cuentas con email válido
        setUserAccounts(accounts);
      } catch (err) {
        console.error("Error cargando cuentas de clientes:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchClients();
  }, []);

  // 2. Cruzamos cada cuenta de usuario con su historial de citas (por clientEmail)
  const clientProfiles = useMemo<ClientProfile[]>(() => {
    if (!userAccounts.length) return [];

    // Indexamos citas por email del cliente (normalizado a minúsculas)
    const apptsByEmail: Record<string, Appointment[]> = {};
    appointments.forEach((appt) => {
      if (!appt.clientEmail) return;
      const emailKey = appt.clientEmail.trim().toLowerCase();
      if (!apptsByEmail[emailKey]) apptsByEmail[emailKey] = [];
      apptsByEmail[emailKey].push(appt);
    });

    return userAccounts.map((user) => {
      const emailKey = user.email.trim().toLowerCase();
      const userAppts = apptsByEmail[emailKey] ?? [];

      // Solo citas válidas (completadas, confirmadas o pendientes, no walk-ins anónimos)
      const validAppts = userAppts.filter(
        (a) =>
          a.clientPhone !== "Local" &&
          (a.status === "completed" || a.status === "confirmed" || a.status === "pending")
      );

      const dates = validAppts.map((a) => a.date).sort((a, b) => b.localeCompare(a));
      const barbers = validAppts.map((a) => a.barberName ?? "Sin asignar");
      const services = validAppts.map((a) => a.serviceName);

      // Teléfono: tomamos el más reciente registrado en las citas
      const phone =
        validAppts.find((a) => a.clientPhone && a.clientPhone !== "Local")?.clientPhone ?? "";

      return {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone,
        totalVisits: validAppts.length,
        lastVisitDate: dates[0] ?? null,
        favoriteBarber: getMostFrequent(barbers),
        usualService: getMostFrequent(services),
      };
    }).sort((a, b) => b.totalVisits - a.totalVisits); // Más frecuentes primero
  }, [userAccounts, appointments]);

  // 3. Filtrado por búsqueda (nombre, correo, teléfono)
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientProfiles;
    const q = searchTerm.toLowerCase();
    return clientProfiles.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [clientProfiles, searchTerm]);

  const isLoading = apptLoading || loadingUsers;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gold gap-3">
        <Loader2 className="animate-spin" />
        <span>Cargando base de clientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Users className="text-gold" size={28} />
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Gestión de Clientes
          </h2>
          <p className="text-txt-muted text-xs font-bold uppercase tracking-widest">
            {clientProfiles.length} {clientProfiles.length === 1 ? "cuenta registrada" : "cuentas registradas"} en el sistema
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-txt-muted group-focus-within:text-gold transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl bg-bg-card text-txt-main placeholder-txt-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-muted hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Resultados */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-bg-card rounded-xl border border-white/5 border-dashed">
          <Users size={32} className="mx-auto mb-3 text-txt-muted" />
          <p className="text-txt-main font-bold">
            {searchTerm ? "No se encontraron clientes" : "Aún no hay clientes registrados"}
          </p>
          <p className="text-txt-muted text-sm mt-1">
            {searchTerm
              ? "Intenta con otro término de búsqueda."
              : "Los perfiles se generan a partir de las cuentas creadas en el sistema."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchTerm && (
            <p className="text-txt-muted text-sm">
              <span className="text-gold font-bold">{filteredClients.length}</span>{" "}
              resultado{filteredClients.length !== 1 ? "s" : ""} para{" "}
              <span className="text-white">"{searchTerm}"</span>
            </p>
          )}
          {filteredClients.map((client) => (
            <ClientCard key={client.uid} client={client} />
          ))}
        </div>
      )}

      {/* Leyenda de iconos */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-txt-muted text-xs">
          <Calendar size={11} className="text-gold" />
          <span>Última visita</span>
        </div>
        <div className="flex items-center gap-1.5 text-txt-muted text-xs">
          <Star size={11} className="text-gold" />
          <span>Barbero favorito</span>
        </div>
        <div className="flex items-center gap-1.5 text-txt-muted text-xs">
          <Scissors size={11} className="text-gold" />
          <span>Servicio habitual</span>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;
