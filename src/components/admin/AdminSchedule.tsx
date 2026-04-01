import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Definimos la estructura de un día
interface DaySchedule {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// Plantilla por defecto por si la base de datos está vacía
const defaultSchedule: DaySchedule[] = [
  { day: 'Lunes', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Martes', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Miércoles', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Jueves', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Viernes', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Sábado', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Domingo', open: '09:00', close: '14:00', isClosed: true },
];

const AdminSchedule = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Cargar el horario desde Firebase
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const docRef = doc(db, 'config', 'general');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().schedule) {
          setSchedule(docSnap.data().schedule);
        } else {
          // Si no existe, usamos la plantilla
          setSchedule(defaultSchedule);
        }
      } catch (error) {
        console.error("Error al cargar el horario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // 2. Manejar los cambios en los inputs
  const handleChange = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  // 3. Guardar en Firebase
  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'config', 'general');
      // Usamos merge: true para no borrar otras configuraciones que agregues a futuro
      await setDoc(docRef, { schedule }, { merge: true });
      alert("✅ Horario global actualizado con éxito");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el horario");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-txt-muted animate-pulse">Cargando horario global...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Horario Global de la Barbería</h2>
          <p className="text-txt-muted text-sm mt-1">Estos son los horarios que verán los clientes en la página principal.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gold text-black font-bold px-6 py-2 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="space-y-4">
        {schedule.map((dayConfig, index) => (
          <div key={dayConfig.day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-bg-main p-4 rounded-lg border border-white/5 gap-4">
            
            {/* Nombre del día y Switch de Cerrado */}
            <div className="flex items-center justify-between w-full sm:w-1/3">
              <span className={`font-bold text-lg w-24 ${dayConfig.isClosed ? 'text-red-400 line-through' : 'text-white'}`}>
                {dayConfig.day}
              </span>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={dayConfig.isClosed}
                    onChange={(e) => handleChange(index, 'isClosed', e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${dayConfig.isClosed ? 'bg-red-500/50' : 'bg-white/10'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${dayConfig.isClosed ? 'transform translate-x-4 bg-red-500' : 'bg-gray-400'}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-txt-muted">
                  {dayConfig.isClosed ? 'Cerrado' : 'Abierto'}
                </span>
              </label>
            </div>

            {/* Inputs de Horas */}
            <div className={`flex items-center gap-2 w-full sm:w-auto transition-opacity ${dayConfig.isClosed ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex flex-col">
                <span className="text-xs text-txt-muted mb-1">Apertura</span>
                <input
                  type="time"
                  value={dayConfig.open}
                  onChange={(e) => handleChange(index, 'open', e.target.value)}
                  className="bg-bg-card border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
              <span className="text-txt-muted font-bold mt-5">-</span>
              <div className="flex flex-col">
                <span className="text-xs text-txt-muted mb-1">Cierre</span>
                <input
                  type="time"
                  value={dayConfig.close}
                  onChange={(e) => handleChange(index, 'close', e.target.value)}
                  className="bg-bg-card border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSchedule;