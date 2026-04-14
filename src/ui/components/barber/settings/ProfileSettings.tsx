import { useState } from 'react';

interface ProfileSettingsProps {
  barberId: string;
  initialName: string;
  initialSpecialty: string;
  initialPhotoUrl?: string;
  initialInstagram?: string;
  onProfileUpdate: (data: { name?: string; specialty?: string; instagram?: string }) => void;
}

export const ProfileSettings = ({ initialName, initialSpecialty, initialPhotoUrl, initialInstagram, onProfileUpdate }: ProfileSettingsProps) => {
  const [name, setName] = useState(initialName);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [instagram, setInstagram] = useState(initialInstagram || '');

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Barbero')}&background=1e293b&color=D4AF37&size=200`;

  return (
    <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg mb-8">
      <h2 className="text-xl font-bold text-gold mb-6 uppercase tracking-widest">Perfil Profesional</h2>
      
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Avatar Section - AHORA ES SOLO LECTURA */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 shadow-xl opacity-80 grayscale-20">
            <img 
              src={initialPhotoUrl || fallbackAvatar} 
              alt="Perfil" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="text-[10px] text-txt-muted text-center max-w-[140px] uppercase font-bold">
            Foto administrada por AJ Studio
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <label className="block text-xs font-bold text-txt-secondary uppercase tracking-widest mb-1">Nombre Público</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                onProfileUpdate({ name: e.target.value });
              }}
              className="w-full bg-bg-main border border-white/10 rounded-sm p-3 text-txt-main focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-txt-secondary uppercase tracking-widest mb-1">Especialidad</label>
            <input 
              type="text" 
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                onProfileUpdate({ specialty: e.target.value });
              }}
              placeholder="Ej. Especialista en Fade y Barba"
              className="w-full bg-bg-main border border-white/10 rounded-sm p-3 text-txt-main focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-txt-secondary uppercase tracking-widest mb-1">Link de Instagram</label>
            <input 
              type="text" 
              value={instagram}
              onChange={(e) => {
                setInstagram(e.target.value);
                onProfileUpdate({ instagram: e.target.value });
              }}
              placeholder="Ej. https://instagram.com/tu_usuario"
              className="w-full bg-bg-main border border-white/10 rounded-sm p-3 text-txt-main focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
      </div>
    </section>
  );
};