import { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle2, DollarSign, MessageCircle, Save, History, Check, Edit2, X, Dog } from 'lucide-react';

import { API_URL } from '../api';

const STATUS_MAP = {
  PROGRAMADA: { label: 'Programada', color: 'bg-gray-100 text-gray-700' },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-green-100 text-green-800 animate-pulse' },
  LISTO:      { label: 'Listo p/ Retiro', color: 'bg-blue-100 text-blue-800' },
  POR_PAGAR:  { label: 'Por Cobrar', color: 'bg-orange-100 text-orange-800' },
  PAGADO:     { label: 'Finalizado', color: 'bg-purple-100 text-purple-800' },
};

export default function FichaPerrito({ citaId, onBack }) {
  const [cita, setCita] = useState(null);
  const [historial, setHistorial] = useState([]);

  // Solo notas opcionales
  const [notas, setNotas] = useState('');
  const [guardadoOk, setGuardadoOk] = useState(false);

  // Cobro (solo el monto al finalizar)
  const [montoCobrado, setMontoCobrado] = useState('');
  const [showCobroModal, setShowCobroModal] = useState(false);
  const [guardandoCobro, setGuardandoCobro] = useState(false);

  const fetchCita = async () => {
    try {
      const res = await fetch(`${API_URL}/visitas`);
      const data = await res.json();
      const c = data.find(x => x.id === citaId);
      if (!c) return;
      setCita(c);
      setNotas(c.detalleVisita || c.notas || '');
      if (c.montoRecaudado != null) {
        setMontoCobrado(String(c.montoRecaudado));
      }
      fetchHistorial(c.mascota?.id, c.id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistorial = async (mascotaId, excluirId) => {
    try {
      const res = await fetch(`${API_URL}/visitas`);
      const data = await res.json();
      const prev = data.filter(v => v.mascota?.id === mascotaId && v.id !== excluirId);
      setHistorial(prev.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCita();
  }, [citaId]);

  const cambiarEstado = async (accion) => {
    try {
      await fetch(`${API_URL}/visitas/${cita.id}/${accion}`, { method: 'PATCH' });
      if (accion === 'terminar') enviarWhatsApp();
      fetchCita();
    } catch (e) {
      console.error(e);
    }
  };

  const guardarNotas = async (showOk = true) => {
    try {
      await fetch(`${API_URL}/visitas/${cita.id}/detalles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detalleVisita: notas, notas }),
      });
      if (showOk) {
        setGuardadoOk(true);
        setTimeout(() => setGuardadoOk(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Finalizar cita guardando únicamente el monto cobrado
  const confirmarCobroYFinalizar = async () => {
    if (!montoCobrado || isNaN(montoCobrado) || Number(montoCobrado) < 0) {
      alert('Por favor ingresa un monto válido.');
      return;
    }

    setGuardandoCobro(true);

    try {
      // 1. Guardar notas si se escribieron
      await guardarNotas(false);

      // 2. Registrar el monto cobrado y finalizar cita (PAGADO)
      await fetch(`${API_URL}/visitas/${cita.id}/pagar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montoRecaudado: montoCobrado,
          metodoPago: '',
          comprobantePago: '',
        }),
      });

      setShowCobroModal(false);
      // Volver automáticamente a la lista de citas marcándola como cerrada
      if (onBack) {
        onBack();
      } else {
        await fetchCita();
      }
    } catch (e) {
      console.error(e);
      alert('Error al registrar el cobro.');
    } finally {
      setGuardandoCobro(false);
    }
  };

  const enviarWhatsApp = () => {
    const tel = cita?.mascota?.tutor?.telefono?.replace(/[^0-9]/g, '');
    const msg = `¡Hola! Somos LilyLuz Spa 🐾 Te avisamos que *${cita?.mascota?.nombre}* ya está listo/a y hermoso/a para que lo/la vengas a buscar. ¡Te esperamos!`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!cita) return <div className="p-10 text-2xl text-gray-400 font-bold">Cargando ficha…</div>;

  const mascota = cita.mascota || {};
  const tutor = mascota.tutor || {};
  const statusInfo = STATUS_MAP[cita.estado] || STATUS_MAP.PROGRAMADA;
  const esFinalizado = cita.estado === 'PAGADO';

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-20 space-y-6">
      {/* Botón Volver */}
      <button onClick={onBack} className="flex items-center text-xl text-blue-600 font-semibold hover:underline">
        <ArrowLeft size={22} className="mr-2" /> Volver a Agenda
      </button>

      {/* ── CABECERA PRINCIPAL ── */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                {mascota.nombre}
              </h1>
              <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-base sm:text-lg font-bold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xl sm:text-2xl text-gray-500 mt-2">
              Tutor: <span className="text-gray-900 font-bold">{tutor.nombre || 'Sin tutor'}</span>
            </p>
            <p className="text-lg sm:text-xl text-gray-400 mt-1">
              📞 <a href={`tel:${tutor.telefono}`} className="text-blue-600 hover:underline">{tutor.telefono || 'Sin teléfono'}</a>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={enviarWhatsApp}
              className="p-3.5 sm:p-5 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-xl sm:rounded-2xl shadow-md flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl transition"
            >
              <MessageCircle size={24} /> Avisar WhatsApp
            </button>
          </div>
        </div>

        {/* Tarjeta de Cita Finalizada */}
        {esFinalizado && (
          <div className="mt-5 p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-wider">Cita Finalizada</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-purple-900 mt-0.5">
                💰 Cobrado: ${Number(cita.montoRecaudado || 0).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowCobroModal(true)}
              className="px-5 py-2.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 rounded-xl font-bold text-base sm:text-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Edit2 size={16} /> Modificar Monto
            </button>
          </div>
        )}

        {/* Info rápida */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mt-5">
          {[
            ['RAZA', mascota.raza || '—'],
            ['EDAD', mascota.edad != null ? `🎂 ${mascota.edad} años` : '—'],
            ['TAMAÑO', `📏 ${mascota.tamano || '—'}`],
            ['HORA CITA', `🕐 ${cita.hora?.substring(0, 5) || '—'}`],
          ].map(([lbl, val]) => (
            <div key={lbl} className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 text-center">
              <p className="text-xs font-bold text-gray-400">{lbl}</p>
              <p className="text-lg sm:text-xl font-extrabold text-gray-800 mt-0.5">{val}</p>
            </div>
          ))}
        </div>

        {/* Tags de comportamiento */}
        {mascota.tagsComportamiento?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {mascota.tagsComportamiento.map(t => (
              <span key={t} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl text-base font-semibold border border-blue-200/50">
                {t}
              </span>
            ))}
          </div>
        )}

        {mascota.comentarios && (
          <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-lg sm:text-xl font-medium">
            ⚠️ <strong>Notas fijas de {mascota.nombre}:</strong> {mascota.comentarios}
          </div>
        )}
      </div>

      {/* ── BOTONES DE FLUJO DE LA CITA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* 1. Iniciar */}
        <button
          onClick={() => cambiarEstado('iniciar')}
          disabled={cita.estado !== 'PROGRAMADA'}
          className="h-16 sm:h-24 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xl sm:text-2xl font-bold rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 shadow-md transition active:scale-98"
        >
          <Play size={24} /> INICIAR VISITA
        </button>

        {/* 2. Marcar Listo */}
        <button
          onClick={() => cambiarEstado('terminar')}
          disabled={cita.estado !== 'EN_PROCESO'}
          className="h-16 sm:h-24 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xl sm:text-2xl font-bold rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 shadow-md transition active:scale-98"
        >
          <CheckCircle2 size={24} /> MARCAR LISTO
        </button>

        {/* 3. Finalizar y Registrar Monto Cobrado */}
        <button
          onClick={() => setShowCobroModal(true)}
          disabled={cita.estado === 'PROGRAMADA'}
          className={`h-16 sm:h-24 text-white text-xl sm:text-2xl font-bold rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 shadow-md transition active:scale-98 ${
            esFinalizado
              ? 'bg-purple-800 hover:bg-purple-900'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <DollarSign size={26} />
          {esFinalizado ? 'MODIFICAR MONTO' : 'FINALIZAR CITA'}
        </button>
      </div>

      {/* ── SOLO NOTAS OPCIONALES ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          📝 Notas (Opcional)
        </h2>
        <textarea
          className="w-full text-xl p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-blue-500 min-h-[120px] resize-y"
          placeholder="Escribe aquí cualquier observación sobre el perrito o la cita (opcional)..."
          value={notas}
          onChange={e => setNotas(e.target.value)}
        />
        <div className="flex items-center gap-4">
          <button
            onClick={() => guardarNotas()}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-xl flex items-center gap-2 shadow-sm transition"
          >
            <Save size={20} /> Guardar Notas
          </button>
          {guardadoOk && (
            <span className="text-green-600 font-bold text-xl animate-in fade-in flex items-center gap-1">
              <Check size={20} /> Guardado
            </span>
          )}
        </div>
      </div>

      {/* ── HISTORIAL DE VISITAS DE ESTA MASCOTA ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <History className="text-blue-600" /> Historial de Visitas Anteriores
        </h2>

        {historial.length === 0 ? (
          <div className="text-center py-10">
            <Dog size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-xl text-gray-400">
              Esta es la primera visita registrada de {mascota.nombre}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((v, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-extrabold text-2xl text-gray-900">
                    📅 {v.fecha} — 🕐 {v.hora?.substring(0, 5) || ''} hrs
                  </span>
                  <span className={`px-3 py-1 rounded-xl font-bold text-sm ${STATUS_MAP[v.estado]?.color || 'bg-gray-100'}`}>
                    {STATUS_MAP[v.estado]?.label || v.estado}
                  </span>
                </div>

                {/* Monto cobrado registrado */}
                {v.montoRecaudado != null && (
                  <p className="text-3xl font-extrabold text-purple-800">
                    💰 Cobrado: ${Number(v.montoRecaudado).toLocaleString()}
                  </p>
                )}

                {/* Notas de esa visita */}
                {(v.detalleVisita || v.notas) && (
                  <div className="p-4 bg-white rounded-xl border border-gray-100 text-lg text-gray-700">
                    <strong>Notas:</strong> {v.detalleVisita || v.notas}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: FINALIZAR CITA Y REGISTRAR MONTO COBRADO ── */}
      {showCobroModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-lg w-full animate-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900">
                  💰 Finalizar Cita
                </h3>
                <p className="text-gray-500 text-lg mt-1">
                  Mascota: <strong className="text-gray-900">{mascota.nombre}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowCobroModal(false)}
                className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Input único de monto cobrado */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                ¿Cuánto se cobró por el servicio? ($) *
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-extrabold text-purple-700 select-none">
                  $
                </span>
                <input
                  type="number"
                  placeholder="Ej: 25000"
                  value={montoCobrado}
                  onChange={e => setMontoCobrado(e.target.value)}
                  className="w-full text-4xl font-extrabold pl-12 pr-6 py-5 bg-purple-50/50 border-2 border-purple-300 rounded-2xl outline-purple-600 text-purple-950 font-mono"
                  autoFocus
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Este valor quedará registrado permanentemente en el historial de {mascota.nombre}.
              </p>
            </div>

            {/* Botones del modal */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCobroModal(false)}
                className="flex-1 p-5 rounded-2xl font-bold text-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardandoCobro}
                onClick={confirmarCobroYFinalizar}
                className="flex-1 p-5 rounded-2xl font-bold text-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={24} />
                {guardandoCobro ? 'Guardando...' : 'Confirmar y Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
