import { useState, useEffect } from 'react';
import { CheckCircle2, PlusCircle, Scissors } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { type Service } from '../../../core/models/Service';
import { getAllServices } from '../../../core/services/service.service';

export const ServiceSelection = () => {
  const { 
    setStep, 
    selectedService, 
    setSelectedService,
    selectedItems,
    setSelectedItems,
    hasBeardAddon,
    setHasBeardAddon
  } = useBooking();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Llamamos al servicio limpio del Core
        const loadedServices = await getAllServices();
        setServices(loadedServices);
      } catch (e) {
        console.error("Error cargando servicios:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setSelectedItems(selectedService.includes || []);
      setHasBeardAddon(false);
    } else {
      setSelectedItems([]);
    }
  }, [selectedService, setSelectedItems, setHasBeardAddon]);

  const toggleItem = (item: string) => {
    const newItems = selectedItems.includes(item) 
      ? selectedItems.filter((i: string) => i !== item) 
      : [...selectedItems, item];
    setSelectedItems(newItems);
  };

  const currentTotal = (selectedService?.price || 0) + (hasBeardAddon ? 5000 : 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 animate-pulse">
        <p className="text-gold uppercase tracking-widest text-sm font-bold">Cargando Servicios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {services.map(s => {
        const isSelected = selectedService?.id === s.id;
        const isBasic = s.name.toLowerCase().includes('basico');

        return (
          <div key={s.id} className={`border rounded-xl transition-all duration-500 overflow-hidden ${isSelected ? 'border-gold bg-gold/5 shadow-[0_0_25px_rgba(212,175,55,0.15)] ring-1 ring-gold/50' : 'border-white/10 bg-white/2 hover:border-white/20'}`}>
            
            <div onClick={() => setSelectedService(s)} className="p-6 cursor-pointer flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold mb-1 text-white">{s.name}</h3>
                <p className="text-xs text-txt-muted mb-3 leading-relaxed">
                  {s.description}
                </p>

                {isBasic && (
                  <div className="mb-3">
                    <span className="inline-block text-[9px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded tracking-wide">
                      ⚠️ SOLO CORTES CLÁSICOS (Para Fade elige Bronce o superior)
                    </span>
                  </div>
                )}

                <p className="text-xs text-txt-secondary uppercase tracking-widest flex items-center gap-1">
                  <Scissors size={12}/> {s.duration} MINUTOS
                </p>
              </div>
              
              <div className="flex flex-col items-end shrink-0">
                <p className="text-gold font-black text-2xl">${s.price.toLocaleString()}</p>
              </div>
            </div>

            <div className={`transition-all duration-500 ease-in-out bg-black/20 ${isSelected ? 'max-h-[1000px] opacity-100 border-t border-gold/20' : 'max-h-0 opacity-0'}`}>
              <div className="p-6">
                <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold mb-4">Personaliza tu paquete (Desmarca lo que no desees):</p>
                
                <div className="flex items-center gap-3 mb-3 p-3 rounded-lg border bg-gold/5 border-gold/20 opacity-80 cursor-default">
                  <CheckCircle2 size={18} className="text-gold" />
                  <span className="text-sm font-medium text-white italic">
                    {isBasic ? 'Corte Clásico (No incluye degradado)' : 'Corte Degradado / Fade'} 
                    <span className="text-txt-muted text-xs normal-case ml-2">- Base del servicio</span>
                  </span>
                </div>

                {s.includes && s.includes.length > 0 && (
                  <div className="mb-6 space-y-3">
                    {s.includes.map(item => {
                      const isChecked = selectedItems.includes(item);
                      return (
                        <div 
                          key={item} 
                          onClick={() => toggleItem(item)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-gold/10 border-gold/30 text-white' : 'bg-white/5 border-white/5 text-txt-muted hover:bg-white/10'}`}
                        >
                          {isChecked ? <CheckCircle2 size={18} className="text-gold" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-white/20"></div>}
                          <span className={`text-sm font-medium ${!isChecked && 'line-through'}`}>{item}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div 
                  onClick={() => setHasBeardAddon(!hasBeardAddon)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${hasBeardAddon ? 'bg-green-500/10 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-txt-muted hover:border-white/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle size={20} className={hasBeardAddon ? "text-green-500" : "text-white/40"} />
                    <div>
                      <p className="font-bold text-sm">Corte de Barba Adicional</p>
                      <p className="text-[10px] uppercase tracking-widest">Añadir a tu servicio</p>
                    </div>
                  </div>
                  <p className={`font-black ${hasBeardAddon ? "text-green-400" : "text-white"}`}>+$5.000</p>
                </div>

              </div>
            </div>

          </div>
        )
      })}

      {selectedService && (
        <div className="fixed bottom-0 left-0 right-0 bg-bg-main/90 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-50 animate-in slide-in-from-bottom-full">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">Total a Pagar</p>
              <p className="text-2xl font-black text-gold">${currentTotal.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setStep(2)} 
              className="bg-gold text-bg-main px-8 py-4 rounded-lg font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:bg-gold-hover hover:-translate-y-1 transition-all"
            >
              Siguiente Paso
            </button>
          </div>
        </div>
      )}
    </div>
  );
};