import { useState, useEffect } from 'react';
import { Plus, Trash2, Scissors, Sparkles, CheckCircle2, AlertTriangle, Calendar, Clock, PenTool, Check, Wrench, RefreshCw, X } from 'lucide-react';

const STORAGE_KEY_INSUMOS = 'lilyluz_inventario_insumos';
const STORAGE_KEY_HERRAMIENTAS = 'lilyluz_inventario_herramientas';

const INSUMOS_DEFAULT = [
  {
    id: 1,
    nombre: 'Shampoo Hipoalergénico 5L',
    capacidad: '5 Litros',
    costoTotal: 25000,
    costoPorLitro: 5000,
    fechaApertura: '2026-09-01',
    fechaTermino: null,
    estado: 'EN_USO', // EN_USO, TERMINADO
  },
  {
    id: 2,
    nombre: 'Acondicionador Desenredante 5L',
    capacidad: '5 Litros',
    costoTotal: 22000,
    costoPorLitro: 4400,
    fechaApertura: '2026-08-15',
    fechaTermino: null,
    estado: 'EN_USO',
  },
];

const HERRAMIENTAS_DEFAULT = [
  {
    id: 1,
    nombre: 'Máquina Wahl KM10',
    tipo: 'Máquina de Corte',
    estado: 'OPERATIVA', // OPERATIVA, MANTENCION_PENDIENTE, EN_TALLER
    ultimoMantenimiento: '2026-08-20',
    notasMantenimiento: 'Limpieza de filtro y cambio de carbones de motor.',
  },
  {
    id: 2,
    nombre: 'Tijera Curva 7.5" Japonesa',
    tipo: 'Tijera de Corte',
    estado: 'OPERATIVA',
    ultimoMantenimiento: '2026-09-10',
    notasMantenimiento: 'Afilado y ajuste de tensión en taller.',
  },
  {
    id: 3,
    nombre: 'Turbina Secadora Doble Motor',
    tipo: 'Secador / Turbina',
    estado: 'OPERATIVA',
    ultimoMantenimiento: '2026-07-15',
    notasMantenimiento: 'Limpieza profunda de rejillas de ventilación.',
  },
];

export default function Productos() {
  const [tab, setTab] = useState('insumos'); // 'insumos' | 'herramientas'

  // Insumos State
  const [insumos, setInsumos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSUMOS);
      return saved ? JSON.parse(saved) : INSUMOS_DEFAULT;
    } catch {
      return INSUMOS_DEFAULT;
    }
  });

  // Herramientas State
  const [herramientas, setHerramientas] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HERRAMIENTAS);
      return saved ? JSON.parse(saved) : HERRAMIENTAS_DEFAULT;
    } catch {
      return HERRAMIENTAS_DEFAULT;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(insumos)); } catch {}
  }, [insumos]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_HERRAMIENTAS, JSON.stringify(herramientas)); } catch {}
  }, [herramientas]);

  // Modal Insumo Form
  const [showInsumoModal, setShowInsumoModal] = useState(false);
  const [nombreInsumo, setNombreInsumo] = useState('');
  const [capacidad, setCapacidad] = useState('5 Litros');
  const [costoInsumo, setCostoInsumo] = useState('');
  const [litrosNum, setLitrosNum] = useState('5');
  const [fechaApertura, setFechaApertura] = useState(new Date().toISOString().split('T')[0]);

  // Modal Herramienta Form
  const [showHerramientaModal, setShowHerramientaModal] = useState(false);
  const [nombreHerramienta, setNombreHerramienta] = useState('');
  const [tipoHerramienta, setTipoHerramienta] = useState('Máquina de Corte');
  const [fechaMantencion, setFechaMantencion] = useState(new Date().toISOString().split('T')[0]);
  const [notasMantencion, setNotasMantencion] = useState('');
  const [estadoHerramienta, setEstadoHerramienta] = useState('OPERATIVA');

  // Modal Rápido de Mantención
  const [itemMantencionRapida, setItemMantencionRapida] = useState(null);
  const [notaRapida, setNotaRapida] = useState('');

  // ── ACCIONES INSUMOS ──
  const agregarInsumo = () => {
    if (!nombreInsumo.trim()) return alert('Ingresa el nombre del producto.');
    const costo = costoInsumo ? parseFloat(costoInsumo) : null;
    const ltrs = litrosNum ? parseFloat(litrosNum) : 5;
    const porLitro = costo && ltrs ? Math.round(costo / ltrs) : null;

    const nuevo = {
      id: Date.now(),
      nombre: nombreInsumo.trim(),
      capacidad: capacidad.trim() || `${ltrs}L`,
      costoTotal: costo,
      costoPorLitro: porLitro,
      fechaApertura,
      fechaTermino: null,
      estado: 'EN_USO',
    };

    setInsumos([nuevo, ...insumos]);
    setNombreInsumo('');
    setCostoInsumo('');
    setShowInsumoModal(false);
  };

  const marcarTerminado = (id) => {
    const hoy = new Date().toISOString().split('T')[0];
    setInsumos(insumos.map(i => i.id === id ? { ...i, estado: 'TERMINADO', fechaTermino: hoy } : i));
  };

  const reabrirOReemplazar = (id) => {
    const hoy = new Date().toISOString().split('T')[0];
    setInsumos(insumos.map(i => i.id === id ? { ...i, estado: 'EN_USO', fechaApertura: hoy, fechaTermino: null } : i));
  };

  const eliminarInsumo = (id) => {
    if (confirm('¿Eliminar este insumo del inventario?')) {
      setInsumos(insumos.filter(i => i.id !== id));
    }
  };

  // Calcular días de duración
  const calcularDias = (fInicio, fFin) => {
    if (!fInicio) return 0;
    const ini = new Date(fInicio);
    const fin = fFin ? new Date(fFin) : new Date();
    const diff = Math.floor((fin - ini) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  };

  // ── ACCIONES HERRAMIENTAS ──
  const agregarHerramienta = () => {
    if (!nombreHerramienta.trim()) return alert('Ingresa el nombre de la herramienta.');

    const nueva = {
      id: Date.now(),
      nombre: nombreHerramienta.trim(),
      tipo: tipoHerramienta,
      estado: estadoHerramienta,
      ultimoMantenimiento: fechaMantencion,
      notasMantenimiento: notasMantencion.trim(),
    };

    setHerramientas([nueva, ...herramientas]);
    setNombreHerramienta('');
    setNotasMantencion('');
    setShowHerramientaModal(false);
  };

  const guardarMantencionRapida = () => {
    if (!itemMantencionRapida) return;
    const hoy = new Date().toISOString().split('T')[0];
    setHerramientas(herramientas.map(h => {
      if (h.id === itemMantencionRapida.id) {
        return {
          ...h,
          ultimoMantenimiento: hoy,
          notasMantenimiento: notaRapida.trim() || 'Mantenimiento preventivo general realizado.',
          estado: 'OPERATIVA',
        };
      }
      return h;
    }));
    setItemMantencionRapida(null);
    setNotaRapida('');
  };

  const cambiarEstadoHerramienta = (id, nuevoEstado) => {
    setHerramientas(herramientas.map(h => h.id === id ? { ...h, estado: nuevoEstado } : h));
  };

  const eliminarHerramienta = (id) => {
    if (confirm('¿Eliminar esta herramienta del inventario?')) {
      setHerramientas(herramientas.filter(h => h.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Inventario</h1>
          <p className="text-xl text-gray-500 mt-1 font-medium">
            Control simple de duración de shampoos y mantención de herramientas.
          </p>
        </div>

        <button
          onClick={() => tab === 'insumos' ? setShowInsumoModal(true) : setShowHerramientaModal(true)}
          className="bg-black hover:bg-gray-800 active:scale-95 text-white px-7 py-4 rounded-2xl shadow-lg font-bold text-xl flex items-center gap-2 transition self-start md:self-auto"
        >
          <Plus size={26} /> {tab === 'insumos' ? 'Nuevo Insumo' : 'Nueva Herramienta'}
        </button>
      </header>

      {/* ── SEGMENTED CONTROL / TABS ── */}
      <div className="flex gap-3 p-1.5 bg-gray-200/80 rounded-2xl w-full max-w-md mb-8">
        <button
          onClick={() => setTab('insumos')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xl transition flex items-center justify-center gap-2 ${
            tab === 'insumos'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          🧴 Insumos ({insumos.length})
        </button>
        <button
          onClick={() => setTab('herramientas')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xl transition flex items-center justify-center gap-2 ${
            tab === 'herramientas'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          ✂️ Herramientas ({herramientas.length})
        </button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 1: SHAMPOOS E INSUMOS                   */}
      {/* ═══════════════════════════════════════════ */}
      {tab === 'insumos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insumos.map(item => {
              const enUso = item.estado === 'EN_USO';
              const dias = calcularDias(item.fechaApertura, item.fechaTermino);

              return (
                <div
                  key={item.id}
                  className={`bg-white p-7 rounded-3xl shadow-sm border transition flex flex-col justify-between ${
                    enUso ? 'border-gray-100 hover:border-blue-200' : 'border-gray-200/60 bg-gray-50/60 opacity-80'
                  }`}
                >
                  <div>
                    {/* Fila superior: Nombre y Estado */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 leading-snug">
                          {item.nombre}
                        </h2>
                        <p className="text-lg text-gray-400 font-semibold mt-0.5">
                          Formato: {item.capacidad}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-base font-bold ${
                        enUso
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {enUso ? '🟢 En Uso' : '⚪ Terminado'}
                      </span>
                    </div>

                    {/* Métricas clave */}
                    <div className="grid grid-cols-2 gap-3 my-6">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apertura</p>
                        <p className="text-xl font-extrabold text-gray-800 mt-1">
                          📅 {item.fechaApertura}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                          {enUso ? 'Tiempo en Uso' : 'Duración Total'}
                        </p>
                        <p className="text-2xl font-black text-blue-900 mt-1">
                          ⏳ {dias} {dias === 1 ? 'día' : 'días'}
                        </p>
                      </div>
                    </div>

                    {/* Costo si existe */}
                    {item.costoTotal != null && (
                      <p className="text-lg text-gray-600 font-medium mb-4">
                        Costo: <strong>${Number(item.costoTotal).toLocaleString()}</strong>
                        {item.costoPorLitro && (
                          <span className="text-gray-400 font-normal"> (${Number(item.costoPorLitro).toLocaleString()}/L)</span>
                        )}
                      </p>
                    )}

                    {item.fechaTermino && (
                      <p className="text-base text-gray-400 italic mb-4">
                        Se terminó el: {item.fechaTermino} (duró {dias} días en la peluquería).
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
                    {enUso ? (
                      <button
                        onClick={() => marcarTerminado(item.id)}
                        className="flex-1 py-3.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-lg rounded-2xl transition flex items-center justify-center gap-2"
                      >
                        <Check size={20} /> Marcar Terminado
                      </button>
                    ) : (
                      <button
                        onClick={() => reabrirOReemplazar(item.id)}
                        className="flex-1 py-3.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-lg rounded-2xl transition flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={20} /> Reemplazar (Nuevo Bidón)
                      </button>
                    )}

                    <button
                      onClick={() => eliminarInsumo(item.id)}
                      className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition"
                      title="Eliminar del inventario"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 2: HERRAMIENTAS Y MÁQUINAS (MANTENCIÓN) */}
      {/* ═══════════════════════════════════════════ */}
      {tab === 'herramientas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {herramientas.map(tool => {
              const dias = calcularDias(tool.ultimoMantenimiento);
              const esCritico = dias > 60; // si lleva más de 60 días sin mantención

              return (
                <div
                  key={tool.id}
                  className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-200 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Fila superior: Nombre y Estado */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 leading-snug">
                          {tool.nombre}
                        </h2>
                        <p className="text-lg text-gray-400 font-semibold mt-0.5">
                          {tool.tipo}
                        </p>
                      </div>

                      {/* Selector de estado de 1 toque */}
                      <select
                        value={tool.estado}
                        onChange={e => cambiarEstadoHerramienta(tool.id, e.target.value)}
                        className={`font-bold text-base px-3 py-1.5 rounded-full border outline-none cursor-pointer ${
                          tool.estado === 'OPERATIVA'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : tool.estado === 'MANTENCION_PENDIENTE'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        <option value="OPERATIVA">🟢 Operativa</option>
                        <option value="MANTENCION_PENDIENTE">🟡 Requiere Revisión</option>
                        <option value="EN_TALLER">🔴 En Taller</option>
                      </select>
                    </div>

                    {/* Métrica de último mantenimiento */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 my-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Último Mantenimiento / Afilado
                        </p>
                        <p className="text-xl font-extrabold text-gray-800 mt-1">
                          📅 {tool.ultimoMantenimiento || 'Sin registro'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Hace
                        </p>
                        <p className={`text-2xl font-black mt-1 ${esCritico ? 'text-amber-600' : 'text-gray-800'}`}>
                          {dias} {dias === 1 ? 'día' : 'días'}
                        </p>
                      </div>
                    </div>

                    {/* Notas de la última mantención */}
                    {tool.notasMantenimiento && (
                      <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 mb-4 text-lg text-gray-700">
                        <strong className="text-purple-900 block text-sm uppercase tracking-wider mb-1 font-bold">
                          📝 Último Trabajo Realizado:
                        </strong>
                        {tool.notasMantenimiento}
                      </div>
                    )}
                  </div>

                  {/* Acciones de la Herramienta */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button
                      onClick={() => {
                        setItemMantencionRapida(tool);
                        setNotaRapida('');
                      }}
                      className="flex-1 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Wrench size={20} /> Registrar Mantención Hoy
                    </button>

                    <button
                      onClick={() => eliminarHerramienta(tool.id)}
                      className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition"
                      title="Eliminar herramienta"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRAR NUEVO INSUMO ── */}
      {showInsumoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-lg w-full animate-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-3xl font-extrabold text-gray-900">
                🧴 Nuevo Insumo / Shampoo
              </h3>
              <button onClick={() => setShowInsumoModal(false)} className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={26} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Shampoo Hipoalergénico 5L"
                  value={nombreInsumo}
                  onChange={e => setNombreInsumo(e.target.value)}
                  className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-blue-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    Cantidad (Litros)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 5"
                    value={litrosNum}
                    onChange={e => setLitrosNum(e.target.value)}
                    className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    Costo Total ($) (Opcional)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 25000"
                    value={costoInsumo}
                    onChange={e => setCostoInsumo(e.target.value)}
                    className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  Fecha de Apertura
                </label>
                <input
                  type="date"
                  value={fechaApertura}
                  onChange={e => setFechaApertura(e.target.value)}
                  className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button onClick={() => setShowInsumoModal(false)} className="flex-1 p-5 rounded-2xl font-bold text-xl bg-gray-100 hover:bg-gray-200 text-gray-700">
                Cancelar
              </button>
              <button onClick={agregarInsumo} className="flex-1 p-5 rounded-2xl font-bold text-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                Guardar Insumo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRAR NUEVA HERRAMIENTA ── */}
      {showHerramientaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-lg w-full animate-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-3xl font-extrabold text-gray-900">
                ✂️ Nueva Herramienta o Máquina
              </h3>
              <button onClick={() => setShowHerramientaModal(false)} className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={26} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-2">
                  Nombre de la Máquina / Herramienta *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Máquina Wahl KM10, Tijera Curva 7.5"
                  value={nombreHerramienta}
                  onChange={e => setNombreHerramienta(e.target.value)}
                  className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  Tipo de Herramienta
                </label>
                <select
                  value={tipoHerramienta}
                  onChange={e => setTipoHerramienta(e.target.value)}
                  className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-purple-500"
                >
                  <option value="Máquina de Corte">Máquina de Corte</option>
                  <option value="Tijera de Corte">Tijera de Corte</option>
                  <option value="Secador / Turbina">Secador / Turbina</option>
                  <option value="Cuchilla / Cabezal">Cuchilla / Cabezal</option>
                  <option value="Otra Herramienta">Otra Herramienta</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  Fecha de Último Mantenimiento / Afilado
                </label>
                <input
                  type="date"
                  value={fechaMantencion}
                  onChange={e => setFechaMantencion(e.target.value)}
                  className="w-full text-xl p-4 bg-gray-50 border rounded-2xl outline-purple-500"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  Notas del Trabajo Realizado (Opcional)
                </label>
                <textarea
                  placeholder="Ej: Se afiló la hoja y se aceitó el motor..."
                  value={notasMantencion}
                  onChange={e => setNotasMantencion(e.target.value)}
                  className="w-full text-lg p-4 bg-gray-50 border rounded-2xl outline-purple-500 min-h-[90px]"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button onClick={() => setShowHerramientaModal(false)} className="flex-1 p-5 rounded-2xl font-bold text-xl bg-gray-100 hover:bg-gray-200 text-gray-700">
                Cancelar
              </button>
              <button onClick={agregarHerramienta} className="flex-1 p-5 rounded-2xl font-bold text-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                Guardar Herramienta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RÁPIDO: REGISTRAR MANTENCIÓN HOY ── */}
      {itemMantencionRapida && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-3xl font-extrabold text-gray-900">
                  🛠️ Registrar Mantención
                </h3>
                <p className="text-gray-500 text-lg mt-1">
                  Para: <strong className="text-gray-900">{itemMantencionRapida.nombre}</strong>
                </p>
              </div>
              <button onClick={() => setItemMantencionRapida(null)} className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={26} />
              </button>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                ¿Qué se le hizo hoy? (Opcional)
              </label>
              <textarea
                placeholder="Ej: Se aceitó, se limpiaron pelos acumulados y se afiló la cuchilla..."
                value={notaRapida}
                onChange={e => setNotaRapida(e.target.value)}
                className="w-full text-lg p-4 bg-gray-50 border rounded-2xl outline-purple-500 min-h-[100px]"
                autoFocus
              />
              <p className="text-sm text-gray-400 mt-2">
                Se registrará con la fecha de hoy y su estado pasará a 🟢 Operativa.
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button onClick={() => setItemMantencionRapida(null)} className="flex-1 p-5 rounded-2xl font-bold text-xl bg-gray-100 hover:bg-gray-200 text-gray-700">
                Cancelar
              </button>
              <button onClick={guardarMantencionRapida} className="flex-1 p-5 rounded-2xl font-bold text-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center justify-center gap-2">
                <CheckCircle2 size={22} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
