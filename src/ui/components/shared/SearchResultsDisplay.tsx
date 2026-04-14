import React from 'react';
import { Search, User, Calendar, Clock, Scissors } from 'lucide-react';
import { type Appointment } from '../../../core/models/Appointment';

interface SearchResultsDisplayProps {
    appointments: Appointment[];
    searchTerm: string;
    showBarber?: boolean; // El Admin lo pondrá en true
    renderCard: (appt: Appointment) => React.ReactNode; // Permite inyectar la tarjeta visual
}

export const SearchResultsDisplay = ({ appointments, searchTerm, showBarber = false, renderCard }: SearchResultsDisplayProps) => {
    if (!searchTerm) return null;

    // Lógica de agrupación aislada
    const groupedSearchResults = () => {
        const groups: Record<string, Appointment[]> = {};
        
        // Inicializamos los grupos dinámicamente
        if (showBarber) groups["Por Profesional"] = [];
        groups["Por Nombre"] = [];
        groups["Por Fecha"] = [];
        groups["Por Hora"] = [];
        groups["Otros (ID, etc)"] = [];

        const lowerTerm = searchTerm.toLowerCase();

        appointments.forEach(appt => {
            if (showBarber && appt.barberName?.toLowerCase().includes(lowerTerm)) {
                groups["Por Profesional"].push(appt);
            } else if (appt.clientName?.toLowerCase().includes(lowerTerm)) {
                groups["Por Nombre"].push(appt);
            } else if (appt.date?.includes(lowerTerm)) {
                groups["Por Fecha"].push(appt);
            } else if (appt.time?.includes(lowerTerm)) {
                groups["Por Hora"].push(appt);
            } else {
                groups["Otros (ID, etc)"].push(appt);
            }
        });

        return groups;
    };

    const results = groupedSearchResults();

    // Asignador automático de iconos
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Por Profesional': return <Scissors size={20} className="text-gold" />;
            case 'Por Nombre': return <User size={20} className="text-gold" />;
            case 'Por Fecha': return <Calendar size={20} className="text-gold" />;
            case 'Por Hora': return <Clock size={20} className="text-gold" />;
            default: return <Search size={20} className="text-gold" />;
        }
    };

    return (
        <div className="space-y-12">
            {Object.entries(results).map(([category, appts]) => {
                if (appts.length === 0) return null;

                return (
                    <section key={category} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            {getCategoryIcon(category)}
                            <h2 className="text-lg font-black text-white uppercase tracking-tight opacity-70">
                                Resultados {category}
                            </h2>
                            <span className="bg-gold/10 text-gold border border-gold/20 text-xs font-bold px-2 py-1 rounded-full">
                                {appts.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                            {appts.map(appt => (
                                <React.Fragment key={appt.id}>
                                    {renderCard(appt)}
                                </React.Fragment>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};