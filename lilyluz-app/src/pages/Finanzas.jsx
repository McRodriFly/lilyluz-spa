import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

import { API_URL } from '../api';

export default function Finanzas() {
  const [citasPagadas, setCitasPagadas] = useState([]);
  const [citasPendientes, setCitasPendientes] = useState([]);

  // Modal State para registrar monto pendiente
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [citaActiva, setCitaActiva] = useState(null);
  const [monto, setMonto] = useState('');

  const fetchData = () => {
    fetch(`${API_URL}/visitas`)
      .then(r => r.json())
      .then(data => {
        setCitasPagadas(data.filter(c => c.estado === 'PAGADO' || c.estado === 'FINALIZADA'));
        setCitasPendientes(data.filter(c => c.estado === 'POR_PAGAR' || c.estado === 'LISTO'));
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const abrirPago = (cita) => {
    setCitaActiva(cita);
    setMonto(cita.montoRecaudado != null ? String(cita.montoRecaudado) : '');
    setShowPagoModal(true);
  };

  const procesarPago = async () => {
    if (!monto || isNaN(monto) || Number(monto) < 0) {
      return alert('Debes ingresar un monto válido.');
    }
    try {
      await fetch(`${API_URL}/visitas/${citaActiva.id}/pagar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoRecaudado: monto, metodoPago: '', comprobantePago: '' }),
      });
      setShowPagoModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error al registrar el cobro.');
    }
  };

  const ingresosTotal = citasPagadas.reduce((acc, c) => acc + (c.montoRecaudado || 0), 0) || 0;

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      <header className="mb-6 sm:mb-8 flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Finanzas</h1>
      </header>

      {/* Recaudación Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 flex items-center gap-4 sm:gap-6 shadow-sm">
          <div className="p-3.5 sm:p-5 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl">
            <TrendingUp size={36} className="sm:w-12 sm:h-12" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-bold text-gray-500">Recaudación Total</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              ${ingresosTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Cuentas Por Cobrar */}
      {citasPendientes.length > 0 && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-orange-100 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-orange-600 flex items-center gap-2 sm:gap-3">
            <AlertCircle size={26} /> Servicios Por Cobrar
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {citasPendientes.map(c => (
              <div key={c.id} className="p-4 sm:p-5 bg-orange-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-orange-200">
                <div>
                  <p className="font-bold text-2xl sm:text-3xl text-gray-900">🐶 {c.mascota?.nombre}</p>
                  <p className="text-orange-800 text-base sm:text-lg font-medium mt-0.5">
                    Cita: {c.fecha} — {c.hora?.substring(0, 5)} hrs
                  </p>
                </div>
                <button
                  onClick={() => abrirPago(c)}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-lg sm:text-xl px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition shadow-md text-center"
                >
                  Registrar Cobro
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial Pagados */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Detalle de Ingresos Cobrados</h2>
        <div className="space-y-3 sm:space-y-4">
          {citasPagadas.length === 0 && (
            <p className="text-lg sm:text-xl text-gray-400 py-6 text-center">No hay cobros registrados todavía.</p>
          )}
          {citasPagadas
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map(c => (
              <div key={c.id} className="p-4 sm:p-5 bg-gray-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-gray-100">
                <div>
                  <p className="font-bold text-xl sm:text-2xl text-gray-800">🐶 {c.mascota?.nombre}</p>
                  <p className="text-gray-500 text-sm sm:text-base">{c.fecha} — {c.hora?.substring(0, 5)} hrs</p>
                  {c.detalleVisita && (
                    <p className="text-gray-600 text-sm sm:text-base mt-1 italic">"{c.detalleVisita}"</p>
                  )}
                </div>
                <div className="self-end sm:self-auto text-right">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-purple-800">
                    ${(c.montoRecaudado || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL SIMPLE DE COBRO */}
      {showPagoModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Registrar Cobro</h2>
            <p className="text-xl text-gray-500">
              Mascota: <strong className="text-gray-800">{citaActiva?.mascota?.nombre}</strong>
            </p>

            <div>
              <label className="block text-xl font-bold mb-2 text-gray-700">Monto cobrado ($)</label>
              <input
                type="number"
                className="w-full text-4xl font-extrabold p-5 bg-purple-50/50 border-2 border-purple-200 rounded-2xl outline-purple-600 font-mono"
                placeholder="Ej: 25000"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowPagoModal(false)}
                className="flex-1 p-5 rounded-2xl font-bold text-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={procesarPago}
                className="flex-1 p-5 rounded-2xl font-bold text-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={22} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
