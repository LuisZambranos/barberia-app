import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { uploadBarberPhoto } from '../../../../core/services/storage.service';
import { useToast } from '../../../context/ToastContext';

interface ProfileSettingsProps {
  barberId: string;
  initialName: string;
  initialSpecialty: string;
  initialPhotoUrl?: string;
  initialInstagram?: string;
onProfileUpdate: (data: { name?: string; specialty?: string; photoUrl?: string; instagram?: string }) => void;
}

export const ProfileSettings = ({ barberId, initialName, initialSpecialty, initialPhotoUrl, initialInstagram, onProfileUpdate }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialName);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [previewImage, setPreviewImage] = useState<string | null>(initialPhotoUrl || null);
  const [instagram, setInstagram] = useState(initialInstagram || '');

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vista previa instantánea
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setLoading(true);
    toast.info("Subiendo foto...");

    try {
      const downloadUrl = await uploadBarberPhoto(file, barberId);
      // Notificamos al padre (ConfigView) que la URL cambió
      onProfileUpdate({ photoUrl: downloadUrl });
      toast.success("Foto actualizada. Recuerda guardar los cambios.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la imagen");
      setPreviewImage(initialPhotoUrl || null); // Revertimos si falla
    } finally {
      setLoading(false);
    }
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Barbero')}&background=1e293b&color=D4AF37&size=200`;

  return (
    <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg mb-8">
      <h2 className="text-xl font-bold text-gold mb-6 uppercase tracking-widest">Perfil Profesional</h2>
      
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            onClick={handleImageClick}
            className={`relative w-32 h-32 rounded-full overflow-hidden border-2 border-gold/30 cursor-pointer group hover:border-gold transition-all shadow-xl ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <img 
              src={previewImage || fallbackAvatar} 
              alt="Perfil" 
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold text-white uppercase tracking-widest text-center">Cambiar<br/>Foto</span>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <Loader2 className="animate-spin text-gold" size={24} />
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <p className="text-[10px] text-txt-muted text-center max-w-[120px]">
            Click para subir foto (Max 2MB)
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