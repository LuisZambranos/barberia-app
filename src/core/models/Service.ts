export interface Service {
  active?: boolean;
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  image?: string;
  
  // --- NUEVO: PAQUETES PERSONALIZABLES ---
  // Array de strings con lo que incluye el corte (ej: ["Corte degradado", "Perfilado de cejas", "Lavado capilar"])
  includes?: string[];
}