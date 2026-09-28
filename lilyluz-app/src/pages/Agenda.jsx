import { useState, useEffect } from 'react';
import { Plus, ChevronRight, Trash2, Edit3, Calendar, Clock, AlertTriangle, CheckCircle, Dog, Sparkles, X } from 'lucide-react';

const API_URL = `http://${window.location.hostname}:8080/api`;

const HORAS_SUGERIDAS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

const STATUS_BADGE = {
  PROGRAMADA: { label: 'Programada', color: 'bg-gray-100 text-gray-700' },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-green-100 text-green-800 animate-pulse' },
  LISTO:      { label: 'Listo p/ Retiro', color: 'bg-blue-100 text-blue-800' },
  POR_PAGAR:  { label: 'Por Cobrar',  color: 'bg-orange-100 text-orange-800' },
  FINALIZADA: { label: 'Cerrada', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' },
  PAGADO:     { label: 'Cerrada', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' },
};

export default function Agenda({ onSelectCita }) {
  const [vistaFecha, setVistaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);

  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [perroId, setPerroId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('10:00');
  const [cupoExtra, setCupoExtra] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Cargar citas de la fecha actual
  const fetchCitas = async (d) => {
    try {
      const res = await fetch(`${API_URL}/visitas/hoy?fecha=${d}`);
      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando citas:', e);
    }
  };

  // Cargar directorio de mascotas para el selector
  const fetchMascotas = async () => {
    try {
      const res = await fetch(`${API_URL}/mascotas`);
      const data = await res.json();
      setMascotas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando mascotas:', e);
    }
  };

  useEffect(() => {
    fetchCitas(vistaFecha);
  }, [vistaFecha]);

  useEffect(() => {
    fetchMascotas();
  }, []);

  const resetForm = () => {
    setPerroId('');
    setFecha(vistaFecha);
    setHora('10:00');
    setCupoExtra(false);
    setError('');
    setEditandoId(null);
    setShowForm(false);
  };

  const abrirNuevoForm = () => {
    resetForm();
    setFecha(vistaFecha);
    setShowForm(true);
  };

  const abrirEditar = (cita, e) => {
    e.stopPropagation();
    setEditandoId(cita.id);
    setPerroId(String(cita.mascota?.id || ''));
    setFecha(cita.fecha);
    setHora(cita.hora?.substring(0, 5) || '10:00');
    setCupoExtra(true); // En edición ya estaba aceptado
    setError('');
    setShowForm(true);
  };

  // Validar separación de 2 horas (120 minutos)
  const chequearSolapamiento = (f, h, excluyeId = null) => {
    if (f !== vistaFecha) return null; // Si no es la misma fecha vista, se re-chequeará al guardar
    const [hNum, mNum] = h.split(':').map(Number);
    const minsNueva = hNum * 60 + mNum;

    return citas.find(c => {
      if (c.id === excluyeId) return false;
      const [ch, cm] = (c.hora?.substring(0, 5) || '00:00').split(':').map(Number);
      const minsExistente = ch * 60 + cm;
      return Math.abs(minsExistente - minsNueva) < 120;
    });
  };

  const conflictoActual = chequearSolapamiento(fecha, hora, editandoId);

  const guardarCita = async () => {
    if (!perroId) {
      setError('Por favor selecciona una mascota de la lista.');
      return;
    }
    if (!fecha || !hora) {
      setError('Debes ingresar la fecha y la hora.');
      return;
    }

    // 1. Validar límite de 4 perritos diarios
    const resDia = await fetch(`${API_URL}/visitas/hoy?fecha=${fecha}`);
    const citasDelDia = await resDia.json();
    const totalEnFecha = Array.isArray(citasDelDia) ? citasDelDia.length : 0;

    if (totalEnFecha >= 4 && !cupoExtra && !editandoId) {
      setError('⚠️ Has alcanzado el límite diario de 4 perritos. Marca "Autorizar cupo extra" para agendar esta excepción.');
      return;
    }

    // 2. Validar regla de 2 horas
    const [hNum, mNum] = hora.split(':').map(Number);
    const minsNueva = hNum * 60 + mNum;
    const conflicto = Array.isArray(citasDelDia) ? citasDelDia.find(c => {
      if (c.id === editandoId) return false;
      const [ch, cm] = (c.hora?.substring(0, 5) || '00:00').split(':').map(Number);
      return Math.abs(ch * 60 + cm - minsNueva) < 120;
    }) : null;

    if (conflicto) {
      setError(`⚠️ Conflicto de horario con ${conflicto.mascota?.nombre || 'otra cita'} a las ${conflicto.hora?.substring(0, 5)}. Cada perrito requiere al menos 2 horas.`);
      return;
    }

    setGuardando(true);
    setError('');

    const payload = {
      mascotaId: parseInt(perroId, 10),
      fecha,
      hora
    };

    try {
      if (editandoId) {
        await fetch(`${API_URL}/visitas/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_URL}/visitas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      setVistaFecha(fecha);
      fetchCitas(fecha);
    } catch (e) {
      console.error(e);
      setError('Error al guardar en el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCita = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return;
    try {
      await fetch(`${API_URL}/visitas/${id}`, { method: 'DELETE' });
      fetchCitas(vistaFecha);
    } catch (e) {
      console.error(e);
    }
  };

  const totalCitasHoy = citas.length;
  const esLimiteAlcanzado = totalCitasHoy >= 4;

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      {/* ── HEADER ── */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Agenda</h1>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-base sm:text-lg font-bold ${
              totalCitasHoy === 0 ? 'bg-gray-100 text-gray-600' :
              totalCitasHoy < 4 ? 'bg-green-100 text-green-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              🐾 {totalCitasHoy} de 4 perritos (máx)
            </span>
            {totalCitasHoy > 4 && (
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-bold">
                +{totalCitasHoy - 4} cupo(s) extra
              </span>
            )}
          </div>
        </div>

        {/* Controles de fecha y botón agendar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Calendar size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              className="w-full sm:w-auto pl-10 pr-3 sm:pr-5 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-white rounded-2xl shadow-sm border border-gray-200 outline-blue-500"
              value={vistaFecha}
              onChange={e => setVistaFecha(e.target.value)}
            />
          </div>

          <button
            onClick={() => setVistaFecha(new Date().toISOString().split('T')[0])}
            className="px-4 sm:px-5 py-3 sm:py-4 bg-white border border-gray-200 text-gray-700 font-bold text-lg sm:text-xl rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition"
          >
            Hoy
          </button>

          <button
            onClick={abrirNuevoForm}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 active:scale-95 text-white px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl shadow-lg font-bold text-lg sm:text-xl flex items-center justify-center gap-2 transition"
          >
            <Plus size={22} /> Agendar Cita
          </button>
        </div>
      </header>

      {/* ── FORMULARIO SIMPLE: SOLO MASCOTA, FECHA Y HORA ── */}
      {showForm && (
        <div className="mb-8 bg-white p-6 sm:p-8 rounded-3xl shadow-md border-2 border-blue-100 animate-in slide-in-from-top-3">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {editandoId ? '✏️ Cambiar Horario de Cita' : '📅 Nueva Cita'}
              </h2>
              <p className="text-gray-400 text-lg mt-0.5">
                Simple y rápido: selecciona mascota, día y hora (bloque de 2 hrs).
              </p>
            </div>
            <button
              onClick={resetForm}
              className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={28} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-bold text-xl flex items-center gap-3">
              <AlertTriangle size={28} />
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 1. Seleccionar Mascota */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                1. ¿Qué mascota viene? *
              </label>
              <select
                value={perroId}
                onChange={e => setPerroId(e.target.value)}
                className="w-full text-2xl p-5 bg-gray-50 rounded-2xl border border-gray-200 outline-blue-500 font-semibold text-gray-800"
              >
                <option value="">-- Elige una mascota de la lista --</option>
                {mascotas.map(m => (
                  <option key={m.id} value={m.id}>
                    🐶 {m.nombre} {m.raza ? `(${m.raza})` : ''} — Dueño: {m.tutor?.nombre || 'Sin tutor'}
                  </option>
                ))}
              </select>
              {mascotas.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ No hay mascotas registradas todavía. Regístralas primero en el menú "Mascotas".
                </p>
              )}
            </div>

            {/* 2. Seleccionar Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={22} className="text-blue-600" />
                  2. Fecha de la Cita *
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full text-2xl p-5 bg-gray-50 rounded-2xl border border-gray-200 outline-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xl font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={22} className="text-blue-600" />
                  3. Hora de Inicio (Demora 2 hrs aprox) *
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  className="w-full text-2xl p-5 bg-gray-50 rounded-2xl border border-gray-200 outline-blue-500 font-semibold font-mono"
                />
                {/* Horas sugeridas de acceso rápido */}
                <div className="flex gap-2 mt-3 flex-wrap items-center">
                  <span className="text-sm text-gray-400 font-semibold">Sugerencias:</span>
                  {HORAS_SUGERIDAS.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHora(h)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-base font-bold transition border ${
                        hora === h
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aviso en tiempo real de conflicto de 2 horas */}
            {conflictoActual && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-lg font-bold flex items-center gap-3">
                <AlertTriangle size={24} />
                <span>
                  Conflicto: Ya existe una cita con {conflictoActual.mascota?.nombre} a las {conflictoActual.hora?.substring(0, 5)}. Debe haber al menos 2 horas de diferencia.
                </span>
              </div>
            )}

            {/* Excepción de cupo extra (si hay 4 o más perritos ese día) */}
            {(esLimiteAlcanzado && fecha === vistaFecha && !editandoId) && (
              <div className="p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={32} />
                <div className="flex-1">
                  <p className="font-extrabold text-orange-900 text-xl">
                    Límite diario alcanzado (4 perritos para el {fecha})
                  </p>
                  <p className="text-orange-800 text-base mt-1">
                    Para asegurar la mejor atención, el máximo recomendado es de 4 perros al día. Si deseas hacer una excepción, activa la casilla:
                  </p>
                  <label className="flex items-center gap-3 mt-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cupoExtra}
                      onChange={e => setCupoExtra(e.target.checked)}
                      className="w-6 h-6 rounded accent-orange-600"
                    />
                    <span className="font-extrabold text-orange-950 text-xl">
                      Autorizar cupo extra / excepción para este perrito
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 p-5 rounded-2xl font-bold text-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardando || (conflictoActual != null)}
                onClick={guardarCita}
                className="flex-1 p-5 rounded-2xl font-bold text-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle size={24} />
                {guardando ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Confirmar Cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LISTA DE CITAS DEL DÍA ── */}
      <div className="space-y-4">
        {citas.length === 0 && !showForm && (
          <div className="text-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Dog size={56} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-3xl font-bold text-gray-800">No hay citas para el {vistaFecha}</h3>
            <p className="text-xl text-gray-400 mt-2 mb-6">
              El día está despejado. Presiona el botón para agendar un perrito.
            </p>
            <button
              onClick={abrirNuevoForm}
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-xl rounded-2xl shadow-md hover:bg-gray-800 transition"
            >
              <Plus size={24} /> Agendar Cita
            </button>
          </div>
        )}

        {citas.map(cita => {
          const status = STATUS_BADGE[cita.estado] || STATUS_BADGE.PROGRAMADA;
          const horaInicio = cita.hora?.substring(0, 5) || '00:00';
          const [hN, mN] = horaInicio.split(':').map(Number);
          const horaFinNum = hN + 2;
          const horaFinStr = `${horaFinNum < 10 ? '0' : ''}${horaFinNum}:${mN < 10 ? '0' : ''}${mN}`;

          return (
            <div
              key={cita.id}
              onClick={() => onSelectCita(cita)}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
            >
              {/* Información Principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
                  <span className="whitespace-nowrap font-mono text-base sm:text-2xl font-extrabold text-blue-600 bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-blue-100">
                    🕐 {horaInicio} - {horaFinStr} hrs
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    🐶 {cita.mascota?.nombre}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm sm:text-base font-bold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-base sm:text-xl text-gray-500 font-medium flex-wrap">
                  <span>
                    Raza: <strong className="text-gray-800">{cita.mascota?.raza || 'Mestizo'}</strong>
                  </span>
                  {cita.mascota?.tamano && (
                    <span>
                      📏 <strong className="text-gray-800">{cita.mascota.tamano}</strong>
                    </span>
                  )}
                  <span>
                    Tutor: <strong className="text-gray-800">{cita.mascota?.tutor?.nombre || 'Sin tutor'}</strong>
                  </span>
                  {cita.mascota?.tutor?.telefono && (
                    <span className="text-gray-600 font-mono">
                      📞 {cita.mascota.tutor.telefono}
                    </span>
                  )}
                </div>

                {/* Si la cita ya está finalizada/pagada, mostrar el cobro registrado */}
                {cita.montoRecaudado != null && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-bold text-lg">
                    💰 Cobrado: ${Number(cita.montoRecaudado).toLocaleString()}
                    {cita.metodoPago && <span className="text-sm font-normal text-purple-700">({cita.metodoPago})</span>}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={(e) => abrirEditar(cita, e)}
                  className="p-4 text-blue-600 hover:bg-blue-50 rounded-2xl transition"
                  title="Cambiar horario"
                >
                  <Edit3 size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => eliminarCita(cita.id, e)}
                  className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition"
                  title="Cancelar cita"
                >
                  <Trash2 size={24} />
                </button>
                <div className="p-3 text-gray-400 flex items-center font-bold text-lg text-blue-600">
                  Ver Ficha <ChevronRight size={26} className="ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
