import { useRef, useState } from 'react';
import { Camera, Loader2, User, PlusCircle, X, Info } from 'lucide-react';
import { useAdminBarbers } from '../../hooks/useAdminBarbers';

const AdminBarbers = () => {
  const { barbers, loading, uploadingId, changePhoto, toggleActive, addBarber } = useAdminBarbers();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBarberForm, setNewBarberForm] = useState({
      name: '',
      email: '',
      phone: '',
      specialty: 'Barbero Clásico'
  });

  const handleFileChange = async (barberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await changePhoto(barberId, file);
    } catch (error) {
      // No hacemos nada visual aquí, el hook de useAdminBarbers ya lanza el Toast de error
      console.error(error);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const success = await addBarber(newBarberForm);
      setIsSubmitting(false);
      
      if (success) {
          setIsModalOpen(false);
          setNewBarberForm({ name: '', email: '', phone: '', specialty: 'Barbero Clásico' });
      }
  };

  if (loading) return <div className="text-center py-20 text-gold flex justify-center"><Loader2 className="animate-spin"/> Cargando barberos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* HEADER Y BOTÓN CREAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
            <div className="flex items-center gap-3">
                <User className="text-gold" size={24} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Staff de Profesionales</h2>
            </div>
            <p className="text-[11px] text-txt-muted flex items-center gap-1 mt-1 font-bold">
                <Info size={12}/> Las fotos deben pesar máximo 2MB para que la App cargue rápido.
            </p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gold text-bg-main px-4 py-2 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-gold-hover transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
            <PlusCircle size={18} /> Añadir Profesional
        </button>
      </div>

      {/* GRILLA DE BARBEROS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {barbers.map(barber => {
          const isActive = barber.active === true;

          return (
            <div key={barber.id} className={`bg-bg-card border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 transition-all duration-300 shadow-lg relative overflow-hidden ${isActive ? 'hover:border-gold/30' : 'opacity-60 grayscale'}`}>
              
              {/* STATUS BADGE ABSOLUTO */}
              <div className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] uppercase font-bold rounded border ${isActive ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
                  {isActive ? 'Activo en Web' : 'Oculto'}
              </div>

              {/* FOTO DE PERFIL */}
              <div className="relative group w-28 h-28 mt-4">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-bg-main">
                  <img 
                    src={barber.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=1e293b&color=D4AF37&size=200`} 
                    alt={barber.name}
                    className={`w-full h-full object-cover object-top transition-all duration-300 ${uploadingId === barber.id ? 'opacity-50 blur-sm' : 'group-hover:scale-110'}`}
                  />
                </div>

                {uploadingId === barber.id && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                      <Loader2 size={32} className="text-gold animate-spin" />
                  </div>
                )}

                {!uploadingId && (
                    <button 
                      onClick={() => fileInputRefs.current[barber.id]?.click()}
                      className="absolute bottom-0 right-0 bg-gold text-bg-main p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                      title="Cambiar Foto (Max 2MB)"
                    >
                      <Camera size={14} />
                    </button>
                )}

                <input 
                  type="file" 
                  accept="image/*" 
                  ref={el => { fileInputRefs.current[barber.id] = el; }}
                  onChange={(e) => handleFileChange(barber.id, e)}
                  className="hidden"
                />
              </div>

              {/* INFO DEL BARBERO */}
              <div className="text-center w-full">
                <h3 className="text-lg font-black text-white uppercase tracking-wider truncate px-2" title={barber.name}>{barber.name.replace("PRUEBA", "")}</h3>
                <p className="text-xs text-gold font-bold mb-4">{barber.specialty || 'Especialista'}</p>
                
                {/* SWITCH DE ACTIVO/INACTIVO */}
                <div 
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors w-full" 
                    onClick={() => toggleActive(barber.id, isActive)}
                >
                    <span className="text-xs font-bold text-txt-muted uppercase tracking-wider">Estado</span>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 shrink-0 ${isActive ? 'bg-success' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                </div>
              </div>
              
            </div>
          )
        })}
      </div>

      {/* --- MODAL PARA CREAR BARBERO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-bg-card border border-gold/30 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 flex flex-col">
                
                <div className="bg-gold/10 p-4 flex justify-between items-center border-b border-gold/20 shrink-0">
                    <h3 className="text-lg font-black text-gold flex items-center gap-2 uppercase tracking-widest"><User size={18}/> Nuevo Profesional</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gold/50 hover:text-gold transition-colors"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Nombre Completo</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Ej. Simón Bolívar" 
                            value={newBarberForm.name} 
                            onChange={(e) => setNewBarberForm({...newBarberForm, name: e.target.value})} 
                            className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm transition-colors" 
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Correo Electrónico (Para Login)</label>
                        <input 
                            type="email" 
                            required
                            placeholder="simon@barberia.com" 
                            value={newBarberForm.email} 
                            onChange={(e) => setNewBarberForm({...newBarberForm, email: e.target.value})} 
                            className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm transition-colors" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Teléfono</label>
                            <input 
                                type="tel" 
                                placeholder="+56 9..." 
                                value={newBarberForm.phone} 
                                onChange={(e) => setNewBarberForm({...newBarberForm, phone: e.target.value})} 
                                className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-txt-muted block mb-2">Especialidad</label>
                            <input 
                                type="text" 
                                placeholder="Ej. Fade Expert" 
                                value={newBarberForm.specialty} 
                                onChange={(e) => setNewBarberForm({...newBarberForm, specialty: e.target.value})} 
                                className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm transition-colors" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 rounded-lg border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 p-3 rounded-lg bg-gold text-bg-main font-black text-sm uppercase tracking-widest hover:bg-gold-hover transition-colors flex justify-center items-center shadow-lg shadow-gold/20">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminBarbers;