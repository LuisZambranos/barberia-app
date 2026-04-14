import { useState, useEffect } from 'react';
import { type Barber } from '../../core/models/Barber';
import { getAllBarbers, updateBarberProfile, createBarber } from '../../core/services/barber.service';
import { uploadBarberPhoto } from '../../core/services/storage.service';
import { useToast } from '../context/ToastContext'; // <-- IMPORTAMOS EL TOAST

export const useAdminBarbers = () => {
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const { toast } = useToast(); // <-- INICIALIZAMOS EL TOAST

    const fetchBarbers = async () => {
        setLoading(true);
        const data = await getAllBarbers();
        setBarbers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBarbers();
    }, []);

    const changePhoto = async (barberId: string, file: File) => {
        // Validación en cliente para rapidez
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen es demasiado pesada. Máximo permitido: 2MB.");
            return;
        }

        setUploadingId(barberId);
        toast.info("Subiendo y optimizando foto..."); // Notificación de carga
        
        try {
            const newUrl = await uploadBarberPhoto(file, barberId);
            await updateBarberProfile(barberId, { photoUrl: newUrl });
            setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, photoUrl: newUrl } : b));
            toast.success("¡Foto actualizada correctamente!"); // Notificación de éxito
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al subir la imagen.");
            throw error;
        } finally {
            setUploadingId(null);
        }
    };

    const toggleActive = async (barberId: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            await updateBarberProfile(barberId, { active: newStatus });
            setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, active: newStatus } : b));
            toast.success(newStatus ? "Barbero ahora visible en la web" : "Barbero oculto de la web");
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            toast.error("No se pudo cambiar el estado.");
        }
    };

    const addBarber = async (newBarberData: { name: string, email: string, phone: string, specialty: string }) => {
        try {
            // SOLUCIÓN TYPESCRIPT: Añadimos el 'role' que faltaba
            const fullBarberData = {
                ...newBarberData,
                role: 'barber' // Todos los que creamos aquí tienen el rol de barbero
            };

            // Forzamos el tipo (Omit) con unknown para que TypeScript acepte el objeto final
            const newId = await createBarber(fullBarberData as unknown as Omit<Barber, "id">);
            
            const newBarber: Barber = {
                id: newId,
                ...fullBarberData,
                active: true
            } as Barber;

            setBarbers(prev => [...prev, newBarber]);
            toast.success("Profesional registrado con éxito.");
            return true;
        } catch (error) {
            console.error("Error al crear:", error);
            toast.error("Error al registrar al profesional.");
            return false;
        }
    };

    return { barbers, loading, uploadingId, changePhoto, toggleActive, addBarber };
};