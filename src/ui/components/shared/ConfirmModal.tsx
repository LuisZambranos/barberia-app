import { AlertTriangle, X, Loader2, Info } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export const ConfirmModal = ({ 
    isOpen, 
    title, 
    message, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar", 
    type = 'warning',
    isLoading = false,
    onConfirm, 
    onClose 
}: ConfirmModalProps) => {

    if (!isOpen) return null;

    // Configuramos colores usando nuestras variables CSS
    const theme = {
        danger: {
            border: 'border-error/30',
            shadow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]', // Las sombras aún necesitan RGBA, Tailwind v4 no soporta var() directo en arbitrarios aún
            iconBg: 'bg-error/10',
            iconColor: 'text-error',
            btnPrimaryBg: 'bg-error hover:bg-error-hover',
            btnPrimaryShadow: 'shadow-error/20',
            btnSecondaryClass: 'border-error/20 text-error hover:bg-error/5', // Estilo para el botón de cancelar rojo
            Icon: AlertTriangle
        },
        warning: {
            border: 'border-amber-500/30',
            shadow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
            btnPrimaryBg: 'bg-amber-500 hover:bg-amber-600',
            btnPrimaryShadow: 'shadow-amber-500/20',
            btnSecondaryClass: 'border-white/10 text-white hover:bg-white/5', // Estilo estándar neutral
            Icon: AlertTriangle
        },
        info: {
            border: 'border-gold/30',
            shadow: 'shadow-[0_0_40px_rgba(212,175,55,0.15)]',
            iconBg: 'bg-gold/10',
            iconColor: 'text-gold',
            btnPrimaryBg: 'bg-gold hover:bg-gold-hover',
            btnPrimaryShadow: 'shadow-gold/20',
            btnSecondaryClass: 'border-white/10 text-white hover:bg-white/5', // Estilo estándar neutral
            Icon: Info
        }
    }[type];

    const { Icon } = theme;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-bg-card border ${theme.border} rounded-2xl w-full max-w-sm overflow-hidden ${theme.shadow} animate-in zoom-in-95 duration-300`}>
                
                <div className="flex justify-end p-2 pb-0">
                    <button onClick={onClose} disabled={isLoading} className="text-txt-muted hover:text-white p-2 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-8 pb-8 text-center space-y-4">
                    <div className={`w-16 h-16 ${theme.iconBg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <Icon size={32} className={theme.iconColor} />
                    </div>
                    <h3 className="text-xl font-black text-txt-main">{title}</h3>
                    <p className="text-sm text-txt-muted" dangerouslySetInnerHTML={{ __html: message }}></p>
                </div>

                <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 bg-black/20">
                    {/* Botón Secundario (El que ahora será rojo en caso de danger) */}
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className={`flex-1 p-3 rounded-lg border font-bold text-sm transition-colors disabled:opacity-50 ${theme.btnSecondaryClass}`}
                    >
                        {cancelText}
                    </button>
                    {/* Botón Principal (Acción Destructiva) */}
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading} 
                        className={`flex-1 p-3 rounded-lg ${theme.btnPrimaryBg} text-white font-black text-sm uppercase tracking-widest transition-colors flex justify-center items-center shadow-lg ${theme.btnPrimaryShadow} disabled:opacity-50`}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin"/> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};