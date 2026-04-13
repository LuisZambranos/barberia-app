import { Zap, Clock } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6'; // <-- Importamos el icono de WhatsApp

interface AvailabilitySettingsProps {
  phone: string;
  autoConfirm: boolean;
  autoConfirmCash: boolean;
  autoConfirmTransfer: boolean;
  schedule: { start: string; end: string; active: boolean };
  workDays: Record<string, boolean>;
  onUpdate: (data: any) => void;
}

const DAYS_MAP = [ { key: 'mon', label: 'L' }, { key: 'tue', label: 'M' }, { key: 'wed', label: 'M' }, { key: 'thu', label: 'J' }, { key: 'fri', label: 'V' }, { key: 'sat', label: 'S' }, { key: 'sun', label: 'D' } ];

export const AvailabilitySettings = ({ phone, autoConfirm, autoConfirmCash, autoConfirmTransfer, schedule, workDays, onUpdate }: AvailabilitySettingsProps) => {  
  
  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-gold' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-8 mb-8">
      
      {/* 0. PERFIL DE CONTACTO (AQUÍ ESTÁ EL TELÉFONO) */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><FaWhatsapp size={20} /></div>
          <div><h2 className="text-lg font-bold text-white">WhatsApp de Contacto</h2><p className="text-xs text-txt-muted">Número al que los clientes enviarán sus comprobantes.</p></div>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-txt-muted block mb-2">Teléfono (con código de país, ej: +569...)</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => onUpdate({ phone: e.target.value })} 
            placeholder="+56 9 1234 5678" 
            className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm transition-colors" 
          />
        </div>
      </section>

      {/* RESERVAS AUTOMÁTICAS */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gold/20 rounded-lg text-gold"><Zap size={20} /></div>
          <div><h2 className="text-lg font-bold text-white">Reservas Automáticas</h2><p className="text-xs text-txt-muted">Controla cómo entran las citas.</p></div>
        </div>

        <div className="space-y-4">
            <div className="bg-bg-main/50 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                <div><span className="text-sm font-bold text-white block">Aprobación Global</span><span className="text-[10px] text-txt-muted uppercase tracking-widest mt-1">Acepta TODO automáticamente</span></div>
                <Toggle active={autoConfirm} onClick={() => onUpdate({ autoConfirm: !autoConfirm })} />
            </div>

            {!autoConfirm && (
                <div className="pl-4 border-l-2 border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-bg-main/30 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                        <div><span className="text-sm font-bold text-emerald-400 block">Efectivo Automático</span></div>
                        <Toggle active={autoConfirmCash} onClick={() => onUpdate({ autoConfirmCash: !autoConfirmCash })} />
                    </div>
                    <div className="bg-bg-main/30 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                        <div><span className="text-sm font-bold text-blue-400 block">Transferencia Automática</span></div>
                        <Toggle active={autoConfirmTransfer} onClick={() => onUpdate({ autoConfirmTransfer: !autoConfirmTransfer })} />
                    </div>
                </div>
            )}
        </div>
      </section>

      {/* HORARIO Y DÍAS */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
         <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-white/10 rounded-lg text-white"><Clock size={20} /></div><div><h2 className="text-lg font-bold text-white">Disponibilidad</h2></div></div>
         <div className="space-y-6">
          <div className="flex items-center justify-between"><span className="text-sm font-bold text-white">Agenda Habilitada</span><Toggle active={schedule.active} onClick={() => onUpdate({ schedule: {...schedule, active: !schedule.active} })} /></div>
          
          <div className={`transition-opacity duration-300 ${schedule.active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             <label className="text-xs uppercase font-bold text-txt-muted block mb-3">Días Laborales</label>
             <div className="flex justify-between gap-2">
                {DAYS_MAP.map((day) => (
                    <button key={day.key} type="button" onClick={() => onUpdate({ workDays: {...workDays, [day.key]: !workDays[day.key]} })} className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border ${workDays[day.key] ? 'bg-gold text-bg-main border-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-bg-main text-txt-muted border-white/10'}`}>{day.label}</button>
                ))}
             </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 pt-2 transition-opacity duration-300 ${schedule.active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div><label className="text-xs uppercase font-bold text-txt-muted block mb-2">Apertura</label><input type="time" value={schedule.start} onChange={(e) => onUpdate({ schedule: {...schedule, start: e.target.value} })} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" /></div>
              <div><label className="text-xs uppercase font-bold text-txt-muted block mb-2">Cierre</label><input type="time" value={schedule.end} onChange={(e) => onUpdate({ schedule: {...schedule, end: e.target.value} })} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" /></div>
          </div>
        </div>
      </section>
    </div>
  );
};