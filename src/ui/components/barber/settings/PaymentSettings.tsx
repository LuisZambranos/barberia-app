import { DollarSign, Landmark } from 'lucide-react';

interface PaymentSettingsProps {
  paymentMethods: { cash: boolean; transfer: boolean; online: boolean };
  transferDetails: { bank: string; accountType: string; accountNumber: string; rut: string; fullName: string; email: string };
  onUpdate: (data: any) => void;
}

export const PaymentSettings = ({ paymentMethods, transferDetails, onUpdate }: PaymentSettingsProps) => {

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-gold' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-8 mb-8">
      {/* MÉTODOS DE PAGO */}
      <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-green-500/10 rounded-lg text-green-400"><DollarSign size={20} /></div><div><h2 className="text-lg font-bold text-white">Métodos de Pago</h2></div></div>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5"><span className="text-sm">Efectivo (Local)</span><Toggle active={paymentMethods.cash} onClick={() => onUpdate({ paymentMethods: {...paymentMethods, cash: !paymentMethods.cash} })} /></div>
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5"><span className="text-sm">Transferencia</span><Toggle active={paymentMethods.transfer} onClick={() => onUpdate({ paymentMethods: {...paymentMethods, transfer: !paymentMethods.transfer} })} /></div>
              <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-lg border border-white/5"><span className="text-sm text-gold font-bold">Pago Online</span><Toggle active={paymentMethods.online} onClick={() => onUpdate({ paymentMethods: {...paymentMethods, online: !paymentMethods.online} })} /></div>
          </div>
      </section>

      {/* DATOS BANCARIOS */}
      <div className={`transition-all duration-500 overflow-hidden ${paymentMethods.transfer ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Landmark size={20} /></div><div><h2 className="text-lg font-bold text-white">Datos Bancarios</h2></div></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><input type="text" value={transferDetails.bank} onChange={(e) => onUpdate({ transferDetails: {...transferDetails, bank: e.target.value} })} placeholder="Banco" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" /></div>
                <div>
                    <select value={transferDetails.accountType} onChange={(e) => onUpdate({ transferDetails: {...transferDetails, accountType: e.target.value} })} className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm">
                        <option value="">Selecciona...</option><option value="Cuenta Corriente">Cuenta Corriente</option><option value="Cuenta Vista / RUT">Cuenta Vista / RUT</option><option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                    </select>
                </div>
                <div><input type="text" value={transferDetails.accountNumber} onChange={(e) => onUpdate({ transferDetails: {...transferDetails, accountNumber: e.target.value} })} placeholder="Número de cuenta" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" /></div>
                <div><input type="text" value={transferDetails.rut} onChange={(e) => onUpdate({ transferDetails: {...transferDetails, rut: e.target.value} })} placeholder="RUT" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" /></div>
                <div><input type="text" value={transferDetails.fullName} onChange={(e) => onUpdate({ transferDetails: {...transferDetails, fullName: e.target.value} })} placeholder="Nombre Completo" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" /></div>
                <div><input type="email" value={transferDetails.email} onChange={(e) => onUpdate({ transferDetails: {...transferDetails, email: e.target.value} })} placeholder="Correo (Opcional)" className="w-full bg-bg-main border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none text-sm" /></div>
             </div>
        </section>
      </div>
    </div>
  );
};