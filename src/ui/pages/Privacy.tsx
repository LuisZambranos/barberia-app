

const Privacy = () => {
  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-extrabold text-txt-main mb-8 tracking-tight">
        Política de <span className="text-gold">Privacidad</span>
      </h1>
      
      <div className="space-y-6 text-txt-muted leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-txt-main mb-3">1. Información que Recopilamos</h2>
          <p>
            En A&J Studio, recopilamos información personal básica como su nombre, correo electrónico y número de teléfono 
            al momento de realizar una reserva. Esto nos permite gestionar sus citas y enviarle confirmaciones.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-txt-main mb-3">2. Uso de la Información</h2>
          <p>
            Su información se utiliza exclusivamente para:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Confirmar y gestionar sus citas de barbería.</li>
            <li>Enviarle recordatorios y notificaciones sobre su servicio.</li>
            <li>Mejorar nuestra atención al cliente.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-txt-main mb-3">3. Protección de Datos</h2>
          <p>
            Implementamos medidas de seguridad para mantener su información personal segura. No compartimos, vendemos 
            ni alquilamos sus datos a terceros con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-txt-main mb-3">4. Sus Derechos</h2>
          <p>
            Usted tiene derecho a solicitar la eliminación de sus datos de nuestro sistema en cualquier momento 
            contactándonos directamente en nuestro local o a través de nuestros canales oficiales.
          </p>
        </section>

        <section className="pt-8 border-t border-white/10">
          <p className="text-sm italic">
            Última actualización: Abril 2026
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
