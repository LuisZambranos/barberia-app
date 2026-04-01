// src/components/admin/AdminBookings.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface Booking {
  id: string;
  clientName: string;
  date: string;
  time: string;
  service: string;
  barberId: string;
  status: string;
}

interface Barber {
  id: string;
  name: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Traer barberos
        const barbersSnap = await getDocs(collection(db, 'barbers'));
        const barbersList = barbersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Barber));
        setBarbers(barbersList);

        // Traer todas las citas (sin filtro de barbero)
        const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
        const bookingsSnap = await getDocs(q);
        const bookingsList = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(bookingsList);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleReassign = async (bookingId: string, newBarberId: string) => {
    if (!newBarberId) return;
    
    // Confirmación de seguridad
    const confirm = window.confirm("¿Estás seguro de reasignar esta cita a otro barbero?");
    if (!confirm) return;

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { barberId: newBarberId });
      
      // Actualizar el estado local para reflejar el cambio en UI
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, barberId: newBarberId } : b));
      alert("✅ Cita reasignada correctamente");
    } catch (error) {
      console.error("Error al reasignar:", error);
      alert("Error al reasignar la cita");
    }
  };

  const getBarberName = (id: string) => {
    const barber = barbers.find(b => b.id === id);
    return barber ? barber.name : 'No asignado';
  };

  if (loading) return <div className="text-txt-muted animate-pulse">Cargando base de datos global...</div>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold text-white mb-6">Todas las Citas</h2>
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-white/10 text-txt-muted text-sm uppercase tracking-wider">
            <th className="pb-3 pr-4">Fecha y Hora</th>
            <th className="pb-3 pr-4">Cliente</th>
            <th className="pb-3 pr-4">Servicio</th>
            <th className="pb-3 pr-4">Estado</th>
            <th className="pb-3 pr-4">Barbero</th>
            <th className="pb-3">Acción (Reasignar)</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-4 pr-4 whitespace-nowrap text-white">{booking.date} a las {booking.time}</td>
              <td className="py-4 pr-4 font-semibold text-gold">{booking.clientName}</td>
              <td className="py-4 pr-4 text-sm text-gray-300">{booking.service}</td>
              <td className="py-4 pr-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                  booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {booking.status === 'confirmed' ? 'CONFIRMADA' : booking.status === 'cancelled' ? 'CANCELADA' : 'PENDIENTE'}
                </span>
              </td>
              <td className="py-4 pr-4 text-white font-medium">{getBarberName(booking.barberId)}</td>
              <td className="py-4">
                <select 
                  className="bg-bg-main border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-gold w-full max-w-[150px]"
                  value=""
                  onChange={(e) => handleReassign(booking.id, e.target.value)}
                  disabled={booking.status === 'cancelled'}
                >
                  <option value="" disabled>Reasignar a...</option>
                  {barbers.map(barber => (
                    barber.id !== booking.barberId && (
                      <option key={barber.id} value={barber.id}>
                        {barber.name}
                      </option>
                    )
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-txt-muted">No hay citas en el sistema.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;