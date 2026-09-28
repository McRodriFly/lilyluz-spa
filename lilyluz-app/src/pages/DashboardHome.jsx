import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, TrendingUp, Sparkles, Dog, Wrench, ChevronRight, Plus, AlertTriangle, CheckCircle2, Scissors } from 'lucide-react';

const API_URL = `http://${window.location.hostname}:8080/api`;
const STORAGE_KEY_HERRAMIENTAS = 'lilyluz_inventario_herramientas';
const STORAGE_KEY_INSUMOS = 'lilyluz_inventario_insumos';

const STATUS_BADGE = {
  PROGRAMADA: { label: 'Programada', color: 'bg-gray-100 text-gray-700' },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-green-100 text-green-800 animate-pulse' },
  LISTO:      { label: 'Listo p/ Retiro', color: 'bg-blue-100 text-blue-800' },
  POR_PAGAR:  { label: 'Por Cobrar',  color: 'bg-orange-100 text-orange-800' },
  FINALIZADA: { label: 'Cerrada', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' },
  PAGADO:     { label: 'Cerrada', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' },
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function DashboardHome({ onNavigate, onSelectCita }) {
  const [citasHoy, setCitasHoy] = useState([]);
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Inventario local
  const [herramientas, setHerramientas] = useState([]);
  const [insumos, setInsumos] = useState([]);

  const fechaActualObj = new Date();
  const hoyStr = fechaActualObj.toISOString().split('T')[0];
  const mesActualPrefijo = hoyStr.substring(0, 7); // 'YYYY-MM'
  const nombreMesActual = MESES[fechaActualObj.getMonth()];

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Citas de hoy
      const resHoy = await fetch(`${API_URL}/visitas/hoy?fecha=${hoyStr}`);
      const dataHoy = await resHoy.json();
      setCitasHoy(Array.isArray(dataHoy) ? dataHoy : []);

      // 2. Todas las citas para métricas mensuales e históricas
      const resTodas = await fetch(`${API_URL}/visitas`);
      const dataTodas = await resTodas.json();
      setTodasLasCitas(Array.isArray(dataTodas) ? dataTodas : []);
    } catch (e) {
      console.error('Error cargando métricas en dashboard:', e);
    } finally {
      setCargando(false);
    }

    // 3. Cargar inventario desde localStorage
    try {
      const hSaved = localStorage.getItem(STORAGE_KEY_HERRAMIENTAS);
      if (hSaved) setHerramientas(JSON.parse(hSaved));
      const iSaved = localStorage.getItem(STORAGE_KEY_INSUMOS);
      if (iSaved) setInsumos(JSON.parse(iSaved));
    } catch (_) {}
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── CÁLCULO DE INGRESOS Y MÉTRICAS ──
  // Citas cerradas
  const esCerrada = (c) => c.estado === 'FINALIZADA' || c.estado === 'PAGADO';

  // Ingresos del mes actual
  const citasDelMes = todasLasCitas.filter(c => c.fecha?.startsWith(mesActualPrefijo) && esCerrada(c));
  const ingresosMes = citasDelMes.reduce((acc, c) => acc + (c.montoRecaudado || 0), 0);

  // Ingresos históricos totales
  const citasHistoricas = todasLasCitas.filter(esCerrada);
  const ingresosTotales = citasHistoricas.reduce((acc, c) => acc + (c.montoRecaudado || 0), 0);

  // Citas de hoy cerradas y cobradas
  const citasHoyCerradas = citasHoy.filter(esCerrada);
  const cobradoHoy = citasHoyCerradas.reduce((acc, c) => acc + (c.montoRecaudado || 0), 0);

  // Perritos en atención ahora
  const enAtencionHoy = citasHoy.filter(c => c.estado === 'EN_PROCESO' || c.estado === 'LISTO').length;

  // Alertas de herramientas
  const herramientasAlertas = herramientas.filter(h => {
    if (h.estado !== 'OPERATIVA') return true;
    if (h.ultimoMantenimiento) {
      const diff = Math.floor((new Date() - new Date(h.ultimoMantenimiento)) / (1000 * 60 * 60 * 24));
      return diff > 60; // más de 2 meses sin mantención
    }
    return false;
  });

  // Shampoos activos
  const shampoosEnUso = insumos.filter(i => i.estado === 'EN_USO');

  return (
    <div className="animate-in fade-in duration-300 pb-20 space-y-8">
      {/* ── CABECERA ── */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/logo.png"
            alt="LilyLuz Spa"
            className="hidden md:block w-20 h-20 rounded-full object-contain shadow-sm border border-amber-100/60 bg-[#FBF9F5] flex-shrink-0"
          />
          <div>
            <span className="text-blue-600 font-extrabold text-xs sm:text-sm md:text-lg uppercase tracking-wider block">
              LilyLuz Spa • Panel Principal
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mt-0.5">
              Resumen del Día
            </h1>
            <p className="text-sm sm:text-lg md:text-2xl text-gray-500 font-medium mt-0.5 capitalize">
              {fechaActualObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Atajos Rápidos */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => onNavigate && onNavigate('agenda')}
            className="flex-1 sm:flex-initial bg-black hover:bg-gray-800 active:scale-95 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Calendar size={18} /> Ir a Agenda
          </button>
          <button
            onClick={() => onNavigate && onNavigate('mascotas')}
            className="flex-1 sm:flex-initial bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-95 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <Dog size={18} /> Mascotas
          </button>
        </div>
      </header>

      {/* ── 4 TARJETAS PRINCIPALES DE MÉTRICAS (GRID 2x2 EN MÓVIL, 4 EN DESKTOP) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* 1. Citas Hoy */}
        <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-bold text-sm sm:text-lg">Citas de Hoy</span>
            <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl">
              <Calendar size={20} className="sm:w-7 sm:h-7" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
              {citasHoy.length} <span className="text-lg sm:text-2xl font-bold text-gray-400">/ 4</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2 leading-tight">
              {citasHoyCerradas.length} finalizada{citasHoyCerradas.length === 1 ? '' : 's'} • {enAtencionHoy} en curso
            </p>
          </div>
        </div>

        {/* 2. Cobrado Hoy */}
        <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-bold text-sm sm:text-lg">Cobrado Hoy</span>
            <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl">
              <DollarSign size={20} className="sm:w-7 sm:h-7" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-700">
              ${cobradoHoy.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2 leading-tight">
              {citasHoyCerradas.length === 1 ? '1 servicio cobrado' : `${citasHoyCerradas.length} servicios cobrados`}
            </p>
          </div>
        </div>

        {/* 3. Ingresos del Mes */}
        <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-purple-600 font-bold text-sm sm:text-lg truncate">{nombreMesActual}</span>
            <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-xl sm:rounded-2xl">
              <TrendingUp size={20} className="sm:w-7 sm:h-7" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-900">
              ${ingresosMes.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2 leading-tight">
              {citasDelMes.length === 1 ? '1 servicio cobrado' : `${citasDelMes.length} servicios cobrados`}
            </p>
          </div>
        </div>

        {/* 4. Total Histórico Acumulado */}
        <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-bold text-sm sm:text-lg">Histórico</span>
            <div className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-xl sm:rounded-2xl">
              <Sparkles size={20} className="sm:w-7 sm:h-7" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
              ${ingresosTotales.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2 leading-tight">
              {citasHistoricas.length === 1 ? '1 perrito atendido' : `${citasHistoricas.length} perritos atendidos`}
            </p>
          </div>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL: 2 COLUMNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA (7 cols): CITAS DE HOY */}
        <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Clock className="text-blue-600" /> Citas de Hoy
              </h2>
              <p className="text-gray-400 text-lg mt-0.5">
                {citasHoy.length === 0 ? 'Sin citas agendadas hoy' : `${citasHoy.length} perrito(s) programados`}
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('agenda')}
              className="text-blue-600 font-bold text-lg hover:underline flex items-center gap-1"
            >
              Ver Agenda <ChevronRight size={20} />
            </button>
          </div>

          {citasHoy.length === 0 ? (
            <div className="text-center py-14 space-y-4">
              <Dog size={64} className="mx-auto text-gray-300" />
              <p className="text-2xl text-gray-500 font-bold">No hay citas para hoy</p>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                El día de hoy está despejado. Puedes agendar una cita rápidamente desde la agenda.
              </p>
              <button
                onClick={() => onNavigate && onNavigate('agenda')}
                className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white font-bold text-xl px-7 py-4 rounded-2xl shadow-md hover:bg-blue-700 transition"
              >
                <Plus size={22} /> Agendar Cita
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {citasHoy.map(cita => {
                const status = STATUS_BADGE[cita.estado] || STATUS_BADGE.PROGRAMADA;
                const horaInicio = cita.hora?.substring(0, 5) || '00:00';

                return (
                  <div
                    key={cita.id}
                    onClick={() => onSelectCita ? onSelectCita(cita) : onNavigate && onNavigate('agenda')}
                    className="p-6 bg-gray-50 hover:bg-blue-50/40 rounded-2xl border border-gray-100 hover:border-blue-200 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xl font-extrabold text-blue-700 bg-blue-100/60 px-3 py-1 rounded-xl">
                          🕐 {horaInicio} hrs
                        </span>
                        <h3 className="text-2xl font-black text-gray-900">
                          🐶 {cita.mascota?.nombre}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="text-lg text-gray-600 font-medium mt-2">
                        {cita.mascota?.raza || 'Mestizo'} • Tutor: <strong>{cita.mascota?.tutor?.nombre || 'Sin tutor'}</strong>
                        {cita.mascota?.tutor?.telefono && (
                          <span className="text-gray-400 font-mono text-base"> ({cita.mascota.tutor.telefono})</span>
                        )}
                      </p>

                      {cita.montoRecaudado != null && (
                        <p className="text-xl font-black text-emerald-700 mt-2">
                          💰 Cobrado: ${Number(cita.montoRecaudado).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="self-end sm:self-auto text-blue-600 font-bold text-lg flex items-center">
                      Ficha <ChevronRight size={22} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA (5 cols): INFORMACIÓN RELEVANTE */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta 1: Alertas y Estado de Herramientas */}
          <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Wrench className="text-purple-600" size={24} /> Herramientas y Máquinas
              </h3>
              <button
                onClick={() => onNavigate && onNavigate('productos')}
                className="text-purple-600 font-bold text-base hover:underline"
              >
                Inventario
              </button>
            </div>

            {herramientasAlertas.length > 0 ? (
              <div className="space-y-3">
                {herramientasAlertas.map(h => (
                  <div key={h.id} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 mt-1 flex-shrink-0" size={22} />
                    <div>
                      <p className="font-bold text-lg text-amber-900">{h.nombre}</p>
                      <p className="text-sm text-amber-800">
                        {h.estado !== 'OPERATIVA'
                          ? `Estado: ${h.estado}`
                          : `Más de 60 días sin afilado/mantención (última: ${h.ultimoMantenimiento})`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                <p className="font-bold text-lg text-green-900">
                  Todas las herramientas y máquinas operativas al 100%.
                </p>
              </div>
            )}
          </div>

          {/* Tarjeta 2: Shampoos en Uso (Duración) */}
          <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-blue-500" size={24} /> Shampoos en Uso
              </h3>
              <button
                onClick={() => onNavigate && onNavigate('productos')}
                className="text-blue-600 font-bold text-base hover:underline"
              >
                Ver Todo
              </button>
            </div>

            {shampoosEnUso.length === 0 ? (
              <p className="text-gray-400 text-lg py-2">No hay shampoos marcados en uso actualmente.</p>
            ) : (
              <div className="space-y-3">
                {shampoosEnUso.map(s => {
                  const ini = s.fechaApertura ? new Date(s.fechaApertura) : new Date();
                  const dias = Math.max(0, Math.floor((new Date() - ini) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={s.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{s.nombre}</p>
                        <p className="text-sm text-gray-500">Abierto: {s.fechaApertura}</p>
                      </div>
                      <span className="font-extrabold text-blue-700 bg-blue-100/70 px-3 py-1.5 rounded-xl text-base">
                        ⏳ {dias} días
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tarjeta 3: Resumen Rápido de Finanzas */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-purple-950 flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={24} /> Resumen de {nombreMesActual}
              </h3>
              <button
                onClick={() => onNavigate && onNavigate('finanzas')}
                className="text-purple-700 font-bold text-base hover:underline"
              >
                Ver Finanzas
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-600">Total Ingresos:</span>
              <span className="text-3xl font-black text-purple-900">
                ${ingresosMes.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-600">Servicios Cobrados:</span>
              <span className="text-2xl font-black text-gray-900">
                {citasDelMes.length} perritos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
