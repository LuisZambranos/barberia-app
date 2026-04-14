import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/config';
import { useToast } from '../../context/ToastContext';

interface DaySchedule {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

const defaultSchedule: DaySchedule[] = [
  { day: 'Lunes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Martes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Miércoles', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Jueves', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Viernes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Sábado', open: '10:00', close: '18:00', isClosed: false },
  { day: 'Domingo', open: '10:00', close: '18:00', isClosed: true },
];

const AdminSchedule = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const docRef = doc(db, 'config', 'general');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().schedule) {
          setSchedule(docSnap.data().schedule);
        } else {
          setSchedule(defaultSchedule);
        }
      } catch (error) {
        console.error("Error al cargar el horario:", error);
        showToast("Error de permisos al cargar el horario", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [showToast]);

  const handleChange = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'config', 'general');
      await setDoc(docRef, { schedule }, { merge: true });
      showToast("Horario global actualizado con éxito", "success");
    } catch (error) {
      console.error("Error al guardar:", error);
      showToast("Hubo un error al guardar el horario", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-txt-muted animate-pulse text-center p-10">Cargando horario global...</div>;

  return (
    <div className="w-full">
      {/* HEADER DEL PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Horario Global (Home)</h2>
          <p className="text-txt-muted text-sm mt-1">Configura los días de apertura de la barbería.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gold text-bg-main font-bold px-8 py-3 rounded hover:bg-gold-hover transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-lg shadow-gold/20"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* GRID DE TARJETAS PARA CADA DÍA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schedule.map((dayConfig, index) => (
          <div key={dayConfig.day} className={`bg-bg-main border rounded-xl p-5 flex flex-col transition-all duration-300 ${dayConfig.isClosed ? 'border-red-500/30 opacity-75' : 'border-white/10 hover:border-gold/30'}`}>
            
            {/* CABECERA: Nombre del día y botón Cerrado/Abierto */}
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <span className={`font-bold text-lg ${dayConfig.isClosed ? 'text-red-400 line-through' : 'text-gold'}`}>
                {dayConfig.day}
              </span>
              <button 
                onClick={() => handleChange(index, 'isClosed', !dayConfig.isClosed)}
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                  dayConfig.isClosed 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {dayConfig.isClosed ? 'Cerrado' : 'Abierto'}
              </button>
            </div>

            {/* CUERPO: Inputs de tiempo */}
            <div className={`flex flex-col gap-4 transition-opacity ${dayConfig.isClosed ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex flex-col">
                <span className="text-xs text-txt-muted uppercase tracking-widest mb-1">Apertura</span>
                <input
                  type="time"
                  value={dayConfig.open}
                  onChange={(e) => handleChange(index, 'open', e.target.value)}
                  className="bg-bg-card border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-gold w-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-txt-muted uppercase tracking-widest mb-1">Cierre</span>
                <input
                  type="time"
                  value={dayConfig.close}
                  onChange={(e) => handleChange(index, 'close', e.target.value)}
                  className="bg-bg-card border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-gold w-full"
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