import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, Plus, Trash2, Edit2, Phone, Calendar, ShieldAlert, MessageCircle, Save, X, Camera, Grid, List, Loader2, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../api';

const ACTION_OBS = ['😇 Excelente', '❤️ Regalón', '😬 Nervioso', '😨 Miedoso', '💨 No turbina', '✂️ No máquina', '🛑 Pausas'];
const FOTOS_KEY = 'lilyluz_mascotas_fotos';

// Helpers para fotos en localStorage (fallback offline)
const cargarFotosStorage = () => {
  try { return JSON.parse(localStorage.getItem(FOTOS_KEY) || '{}'); } catch { return {}; }
};
const guardarFotoStorage = (mascotaId, dataUrl) => {
  const fotos = cargarFotosStorage();
  fotos[mascotaId] = dataUrl;
  localStorage.setItem(FOTOS_KEY, JSON.stringify(fotos));
};
const eliminarFotoStorage = (mascotaId) => {
  const fotos = cargarFotosStorage();
  delete fotos[mascotaId];
  localStorage.setItem(FOTOS_KEY, JSON.stringify(fotos));
};

export default function Mascotas() {
  const [search, setSearch] = useState('');
  const [perros, setPerros] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [vistaGrid, setVistaGrid] = useState(false);
  const [fotos, setFotos] = useState(cargarFotosStorage());
  
  // Estado para subida de fotos y loading screen
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoSubidaOk, setFotoSubidaOk] = useState(false);
  const [targetMascota, setTargetMascota] = useState(null);
  const [fotoTargetId, setFotoTargetId] = useState(null);
  const fileInputRef = useRef(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('1');
  const [peso, setPeso] = useState('');
  const [tamano, setTamano] = useState('Pequeño');
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorTelDigits, setTutorTelDigits] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [comportamiento, setComportamiento] = useState([]);
  const [currentTutorId, setCurrentTutorId] = useState(null);

  const fetchPerros = async () => {
    try {
      const res = await fetch(`${API_URL}/mascotas`);
      const data = await res.json();
      setPerros(data);

      // Sincronizar fotos desde el backend con el state local
      const fotosObj = { ...cargarFotosStorage() };
      data.forEach(p => {
        if (p.fotoUrl) {
          const urlBase = API_URL.replace(/\/api\/?$/, '');
          fotosObj[p.id] = p.fotoUrl.startsWith('http') ? p.fotoUrl : `${urlBase}${p.fotoUrl}`;
        }
      });
      setFotos(fotosObj);
    } catch (e) {
      console.error('Error al cargar mascotas:', e);
    }
  };

  const fetchVisitas = async () => {
    try {
      const res = await fetch(`${API_URL}/visitas`);
      const data = await res.json();
      setVisitas(data);
    } catch (e) {
      console.error('Error al cargar visitas:', e);
    }
  };

  useEffect(() => {
    fetchPerros();
    fetchVisitas();
  }, []);

  const resetFormFields = () => {
    setNombre('');
    setRaza('');
    setEdad('1');
    setPeso('');
    setTamano('Pequeño');
    setTutorNombre('');
    setTutorTelDigits('');
    setComentarios('');
    setComportamiento([]);
    setCurrentTutorId(null);
    setEditingId(null);
    setErrorMsg('');
  };

  const abrirEdicionInline = (p, e) => {
    if (e) e.stopPropagation();
    setExpandedId(p.id);
    setEditingId(p.id);
    setShowNewForm(false);
    setNombre(p.nombre || '');
    setRaza(p.raza || '');
    setEdad(p.edad != null ? String(p.edad) : '1');
    setPeso(p.peso != null ? String(p.peso) : '');
    setTamano(p.tamano || 'Pequeño');
    setTutorNombre(p.tutor?.nombre || '');
    const telRaw = (p.tutor?.telefono || '').replace(/\D/g, '');
    const digits = telRaw.startsWith('569') ? telRaw.slice(3) : (telRaw.startsWith('9') ? telRaw.slice(1) : telRaw);
    setTutorTelDigits(digits.slice(0, 8));
    setComentarios(p.comentarios || '');
    setComportamiento(p.tagsComportamiento || []);
    setCurrentTutorId(p.tutor?.id || null);
    setErrorMsg('');
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    resetFormFields();
  };

  const toggleExpand = (id) => {
    if (editingId === id) return;
    setExpandedId(prev => (prev === id ? null : id));
    if (editingId && editingId !== id) {
      setEditingId(null);
      resetFormFields();
    }
  };

  const toggleTag = (tag) => {
    setComportamiento(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Abrir selector de foto (sin forzar cámara; abre galería o menú nativo de iOS)
  const handleFotoClick = (p, e) => {
    if (e) e.stopPropagation();
    setTargetMascota(p);
    setFotoTargetId(p.id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Procesamiento y guardado de foto en la carpeta ./data/uploads/ del proyecto
  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !fotoTargetId) return;

    setSubiendoFoto(true);
    setFotoSubidaOk(false);

    try {
      // 1. Optimizar imagen en Canvas a 600x600 px (calidad retina, tamaño ligero)
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 600;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const min = Math.min(img.width, img.height);
            const sx = (img.width - min) / 2;
            const sy = (img.height - min) / 2;
            ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = reject;
          img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Guardar en el backend (carpeta ./data/uploads/ del proyecto)
      const res = await fetch(`${API_URL}/mascotas/${fotoTargetId}/foto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      });

      let finalUrl = dataUrl;
      if (res.ok) {
        const json = await res.json();
        const urlBase = API_URL.replace(/\/api\/?$/, '');
        finalUrl = json.fotoUrl ? (json.fotoUrl.startsWith('http') ? json.fotoUrl : `${urlBase}${json.fotoUrl}`) : dataUrl;
      }

      // Guardar en cache local y actualizar estados
      guardarFotoStorage(fotoTargetId, finalUrl);
      setFotos(prev => ({ ...prev, [fotoTargetId]: finalUrl }));
      setPerros(prev => prev.map(p => p.id === fotoTargetId ? { ...p, fotoUrl: finalUrl } : p));

      setFotoSubidaOk(true);
      setTimeout(() => {
        setSubiendoFoto(false);
        setFotoSubidaOk(false);
      }, 700);
    } catch (err) {
      console.error('Error procesando y guardando imagen:', err);
      alert('Hubo un error al procesar y guardar la imagen.');
      setSubiendoFoto(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const guardarMascota = async (idDestino = null) => {
    const nom = nombre.trim();
    const tutNom = tutorNombre.trim();
    const cleanDigits = tutorTelDigits.replace(/\D/g, '').slice(0, 8);

    if (!nom) {
      setErrorMsg('El nombre de la mascota es obligatorio.');
      return;
    }
    if (!tutNom) {
      setErrorMsg('El nombre del dueño/tutor es obligatorio.');
      return;
    }
    if (cleanDigits.length < 8) {
      setErrorMsg('El teléfono debe tener los 8 dígitos (ej: 8765 4321).');
      return;
    }

    setGuardando(true);
    setErrorMsg('');

    const formattedPhone = `+56 9 ${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4)}`;

    const payload = {
      nombre: nom,
      raza: raza.trim() || 'Sin especificar',
      edad: edad ? parseInt(edad, 10) : 1,
      peso: peso ? parseFloat(peso) : 0.0,
      tamano,
      tutor: {
        id: currentTutorId,
        nombre: tutNom,
        telefono: formattedPhone,
        direccion: ''
      },
      tagsComportamiento: comportamiento,
      comentarios: comentarios.trim()
    };

    try {
      const url = idDestino ? `${API_URL}/mascotas/${idDestino}` : `${API_URL}/mascotas`;
      const method = idDestino ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor (${res.status})`);
      }

      await fetchPerros();
      resetFormFields();
      setShowNewForm(false);
      setEditingId(null);
      if (idDestino) {
        setExpandedId(idDestino);
      }
    } catch (err) {
      console.error('Error guardando mascota:', err);
      setErrorMsg('No se pudo guardar la mascota. Revisa la conexión.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMascota = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar permanentemente esta mascota y su ficha?')) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/mascotas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPerros(prev => prev.filter(p => p.id !== id));
        eliminarFotoStorage(id);
        if (expandedId === id) setExpandedId(null);
        if (editingId === id) setEditingId(null);
      } else {
        alert('No se pudo eliminar la mascota.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al eliminar.');
    }
  };

  const filtered = perros.filter(p =>
    (p.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.tutor?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.raza || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderFormulario = (idDestino = null) => (
    <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center border-b pb-3 sm:pb-4">
        <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900">
          {idDestino ? '✏️ Editar Ficha de Mascota' : '🐶 Nueva Ficha de Mascota'}
        </h3>
        <button
          onClick={() => (idDestino ? cancelarEdicion() : setShowNewForm(false))}
          className="p-1.5 sm:p-2.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl text-red-700 font-bold text-xs sm:text-base flex items-center gap-2">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Datos Básicos Mascota */}
      <div>
        <p className="text-sm sm:text-lg font-bold text-gray-700 mb-2">1. Datos de la Mascota</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-2.5 sm:mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del Perrito *</label>
            <input
              type="text"
              placeholder="Ej: Bobby, Luna..."
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full text-base sm:text-xl p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Raza</label>
            <input
              type="text"
              placeholder="Ej: Poodle, Maltés, Mestizo..."
              value={raza}
              onChange={e => setRaza(e.target.value)}
              className="w-full text-base sm:text-xl p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">🎂 Edad (años) *</label>
            <input
              type="number"
              min="0"
              max="30"
              placeholder="Ej: 3"
              value={edad}
              onChange={e => setEdad(e.target.value)}
              className="w-full text-base sm:text-xl p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">⚖️ Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="Ej: 7.5"
              value={peso}
              onChange={e => setPeso(e.target.value)}
              className="w-full text-base sm:text-xl p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">📏 Categoría de Tamaño</label>
            <select
              value={tamano}
              onChange={e => setTamano(e.target.value)}
              className="w-full text-base sm:text-xl p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500 font-semibold"
            >
              <option value="Pequeño">Pequeño (&lt; 10 kg)</option>
              <option value="Mediano">Mediano (10 - 25 kg)</option>
              <option value="Grande">Grande (25 - 45 kg)</option>
              <option value="Gigante">Gigante (&gt; 45 kg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Datos del Tutor */}
      <div className="border-t pt-3 sm:pt-5">
        <p className="text-sm sm:text-lg font-bold text-gray-700 mb-2">2. Datos del Dueño / Tutor</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del Tutor *</label>
            <input
              type="text"
              placeholder="Ej: Carolina González"
              value={tutorNombre}
              onChange={e => setTutorNombre(e.target.value)}
              className="w-full text-base sm:text-xl p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono (Obligatorio) *</label>
            <div className="flex items-center bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden focus-within:border-blue-500">
              <span className="px-3 text-sm sm:text-lg font-bold text-gray-500 select-none bg-gray-100 py-3 sm:py-4 border-r border-gray-200">
                +56 9
              </span>
              <input
                type="tel"
                maxLength={8}
                placeholder="12345678"
                value={tutorTelDigits}
                onChange={e => setTutorTelDigits(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="w-full text-base sm:text-xl p-3 sm:p-4 bg-transparent outline-none font-mono tracking-wider font-semibold"
              />
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Escribe los 8 dígitos siguientes al +56 9</p>
          </div>
        </div>
      </div>

      {/* Comportamiento */}
      <div className="border-t pt-3 sm:pt-5">
        <label className="block text-sm sm:text-lg font-bold text-gray-700 mb-1">3. Comportamiento Habitual</label>
        <p className="text-[11px] sm:text-xs text-gray-400 mb-2">Selecciona las emociones que apliquen:</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {ACTION_OBS.map(obs => {
            const activo = comportamiento.includes(obs);
            return (
              <button
                key={obs}
                type="button"
                onClick={() => toggleTag(obs)}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 transition ${
                  activo
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {obs}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comentarios */}
      <div className="border-t pt-3 sm:pt-5">
        <label className="block text-sm sm:text-lg font-bold text-gray-700 mb-1">4. Notas Permanentes / Observaciones</label>
        <textarea
          rows={3}
          placeholder="Ej: Es alérgico al shampoo regular. Cuidado con la patita trasera derecha..."
          value={comentarios}
          onChange={e => setComentarios(e.target.value)}
          className="w-full text-sm sm:text-base p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 outline-blue-500"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => (idDestino ? cancelarEdicion() : setShowNewForm(false))}
          className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={guardando}
          onClick={() => guardarMascota(idDestino)}
          className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {guardando ? 'Guardando...' : idDestino ? 'Actualizar' : 'Guardar Mascota'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      {/* Input de archivo nativo (SIN capture para abrir la galería por defecto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFotoChange}
      />

      {/* ── LOADING SCREEN / SPINNER MODAL PARA SUBIDA DE FOTO ── */}
      {subiendoFoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xs w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {fotoSubidaOk ? (
              <>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={36} className="animate-in zoom-in duration-200" />
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-gray-900">¡Foto Guardada!</h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Guardada en la carpeta del proyecto.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Loader2 size={34} className="animate-spin text-blue-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  Guardando Foto
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Optimizando y guardando imagen de <strong className="text-gray-800">{targetMascota?.nombre || 'la mascota'}</strong>...
                </p>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                  <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4"></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Encabezado */}
      <header className="flex justify-between items-center gap-3 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Directorio de Mascotas</h1>
          <p className="text-xs sm:text-base text-gray-400 mt-0.5">{perros.length} perritos registrados en total</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Grid / Lista */}
          <button
            onClick={() => setVistaGrid(!vistaGrid)}
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition active:scale-95 ${
              vistaGrid ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
            title={vistaGrid ? 'Ver como lista' : 'Ver como galería'}
          >
            {vistaGrid ? <List size={20} /> : <Grid size={20} />}
          </button>
          <button
            onClick={() => {
              resetFormFields();
              setShowNewForm(!showNewForm);
              setExpandedId(null);
              setEditingId(null);
            }}
            className="bg-black hover:bg-gray-800 text-white p-3 sm:p-4 rounded-full shadow-md hover:scale-105 active:scale-95 transition flex items-center justify-center flex-shrink-0"
            title="Nueva Mascota"
          >
            <Plus size={22} />
          </button>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <div className="relative mb-4 sm:mb-8">
        <Search className="absolute left-3.5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por perrito, dueño o raza..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 sm:pl-16 pr-4 sm:pr-6 py-2.5 sm:py-3.5 text-sm sm:text-lg bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm outline-blue-500 font-medium"
        />
      </div>

      {/* Formulario nuevo arriba (solo si se abre explícitamente con el botón +) */}
      {showNewForm && !editingId && (
        <div className="mb-5 sm:mb-8 animate-in slide-in-from-top-4">
          {renderFormulario(null)}
        </div>
      )}

      {/* ── LISTA O GRID DE MASCOTAS ── */}
      {vistaGrid ? (
        /* ── VISTA GALERÍA / GRID DE FOTOS (COMPACTA Y ADAPTATIVA) ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full text-center p-8 text-gray-400 font-medium text-sm sm:text-lg bg-white rounded-2xl border border-gray-100">
              No se encontraron mascotas {search ? `para "${search}"` : 'registradas aún'}.
            </div>
          )}
          {filtered.map(p => {
            const foto = fotos[p.id];
            return (
              <div
                key={p.id}
                onClick={() => { setVistaGrid(false); setExpandedId(p.id); }}
                className="bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition cursor-pointer overflow-hidden group flex flex-col justify-between"
              >
                {/* Foto cuadrada o placeholder */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {foto ? (
                    <img src={foto} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <span className="text-4xl sm:text-5xl">🐶</span>
                    </div>
                  )}
                  {/* Botón de cambiar foto siempre visible en la esquina */}
                  <button
                    onClick={(e) => handleFotoClick(p, e)}
                    className="absolute bottom-2 right-2 p-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md text-gray-700 hover:text-blue-600 active:scale-90 transition"
                    title="Subir foto desde galería"
                  >
                    <Camera size={15} />
                  </button>
                </div>
                {/* Info compacta */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-lg font-extrabold text-gray-900 capitalize truncate">{p.nombre}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{p.raza || 'Sin raza'} • {p.edad != null ? `${p.edad} años` : ''}</p>
                  <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">{p.tutor?.nombre || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── VISTA LISTA: TARJETA HORIZONTAL COMPACTA (ESTILO APPLE CONTACTS) ── */
        <div className="space-y-2.5 sm:space-y-4">
          {filtered.length === 0 && (
            <div className="text-center p-8 sm:p-12 text-gray-400 font-medium text-sm sm:text-xl bg-white rounded-2xl sm:rounded-3xl border border-gray-100">
              No se encontraron mascotas {search ? `para "${search}"` : 'registradas aún'}.
            </div>
          )}

          {filtered.map(p => {
            const isExpanded = expandedId === p.id;
            const isEditingThis = editingId === p.id;
            const telLimpio = (p.tutor?.telefono || '').replace(/\D/g, '');
            const historialPerrito = visitas.filter(v => v.mascota?.id === p.id);
            const foto = fotos[p.id];

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border transition-all overflow-hidden ${
                  isExpanded ? 'border-blue-300 ring-2 ring-blue-50 shadow-md' : 'border-gray-100 hover:shadow-md'
                }`}
              >
                {/* Tarjeta principal clickeable con layout horizontal Apple */}
                <div
                  onClick={() => toggleExpand(p.id)}
                  className="p-3 sm:p-6 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Foto / Avatar a la izquierda */}
                    <div
                      onClick={(e) => handleFotoClick(p, e)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition group relative shadow-inner border border-gray-100"
                      title="Toca para elegir foto de galería"
                    >
                      {foto ? (
                        <img src={foto} alt={p.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl text-gray-300">🐶</div>
                      )}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Camera size={18} className="text-white drop-shadow" />
                      </div>
                    </div>

                    {/* Columna derecha: Nombre, Botones, Badges y Tutor */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base sm:text-xl font-extrabold text-gray-900 tracking-tight capitalize truncate">
                          {p.nombre}
                        </h3>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => abrirEdicionInline(p, e)}
                            className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 active:scale-95 rounded-lg sm:rounded-xl transition"
                            title="Editar ficha"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => eliminarMascota(p.id, e)}
                            className="p-1 sm:p-2 text-red-500 hover:bg-red-50 active:scale-95 rounded-lg sm:rounded-xl transition"
                            title="Eliminar mascota"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="p-1 text-gray-400">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Chips / Badges en fila */}
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mt-1">
                        {p.raza && (
                          <span className="text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md sm:rounded-lg truncate max-w-[120px]">
                            {p.raza}
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md sm:rounded-lg">
                          🎂 {p.edad != null ? `${p.edad} ${p.edad === 1 ? 'año' : 'años'}` : 'Sin edad'}
                        </span>
                        {p.tamano && (
                          <span className="text-[10px] sm:text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md sm:rounded-lg">
                            📏 {p.tamano}
                          </span>
                        )}
                      </div>

                      {/* Tutor y Teléfono */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                        <span className="truncate max-w-[140px]">Tutor: <strong className="text-gray-900">{p.tutor?.nombre || 'Sin tutor'}</strong></span>
                        {p.tutor?.telefono && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-blue-600 font-mono font-semibold whitespace-nowrap">
                              📞 {p.tutor.telefono}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── DESPLIEGUE EN EL MISMO LUGAR DE LA MASCOTA ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-[#FAFAFC] p-3.5 sm:p-8 animate-in slide-in-from-top-2">
                    {isEditingThis ? (
                      renderFormulario(p.id)
                    ) : (
                      <div className="space-y-3.5 sm:space-y-6">
                        {/* Grid de ficha completa */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                          <div className="p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Edad Exacta</p>
                            <p className="text-sm sm:text-xl font-extrabold text-gray-800 mt-0.5">
                              🎂 {p.edad != null ? `${p.edad} años` : 'No registrada'}
                            </p>
                          </div>
                          <div className="p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Peso</p>
                            <p className="text-sm sm:text-xl font-extrabold text-gray-800 mt-0.5">
                              ⚖️ {p.peso ? `${p.peso} kg` : 'No registrado'}
                            </p>
                          </div>
                          <div className="p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Tamaño</p>
                            <p className="text-sm sm:text-xl font-extrabold text-gray-800 mt-0.5">
                              📏 {p.tamano || 'No definido'}
                            </p>
                          </div>
                          <div className="p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Visitas Realizadas</p>
                            <p className="text-sm sm:text-xl font-extrabold text-blue-600 mt-0.5">
                              🐾 {historialPerrito.length} citas
                            </p>
                          </div>
                        </div>

                        {/* Contacto Directo con Tutor */}
                        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                          <div>
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Dueño / Contacto</p>
                            <p className="text-base sm:text-xl font-extrabold text-gray-900 mt-0.5">{p.tutor?.nombre}</p>
                            <p className="text-xs sm:text-base text-gray-600 font-mono mt-0.5">{p.tutor?.telefono}</p>
                          </div>
                          <div className="flex gap-2">
                            {p.tutor?.telefono && (
                              <>
                                <a
                                  href={`tel:${p.tutor.telefono}`}
                                  className="px-3 sm:px-5 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs sm:text-base flex items-center gap-1.5 transition"
                                >
                                  <Phone size={15} /> Llamar
                                </a>
                                <a
                                  href={`https://wa.me/${telLimpio}?text=Hola!%20Te%20escribimos%20de%20LilyLuz%20Spa%20por%20tu%20mascota%20${encodeURIComponent(p.nombre)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 sm:px-5 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs sm:text-base flex items-center gap-1.5 transition shadow-sm"
                                >
                                  <MessageCircle size={15} /> WhatsApp
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Botón para cambiar foto desde la ficha abierta */}
                        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              {foto ? (
                                <img src={foto} alt={p.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg text-gray-300">🐶</div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-800">Foto de perfil</p>
                              <p className="text-[10px] sm:text-xs text-gray-400">Guardada en el proyecto</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleFotoClick(p, e)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
                          >
                            <Camera size={14} /> Cambiar Foto
                          </button>
                        </div>

                        {/* Emojis y Comportamiento */}
                        {p.tagsComportamiento?.length > 0 && (
                          <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1.5">Comportamiento Habitual</p>
                            <div className="flex flex-wrap gap-1.5">
                              {p.tagsComportamiento.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg font-semibold text-xs sm:text-sm border border-blue-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notas médicas / permanentes */}
                        {p.comentarios && (
                          <div className="bg-amber-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-200 text-amber-900 text-xs sm:text-base font-medium">
                            <strong>⚠️ Observaciones Fijas:</strong> {p.comentarios}
                          </div>
                        )}

                        {/* Historial de Visitas de esta mascota */}
                        <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
                          <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-2.5 sm:mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-600" />
                            Historial de Citas de {p.nombre}
                          </h4>
                          {historialPerrito.length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-400">Aún no tiene visitas registradas en la agenda.</p>
                          ) : (
                            <div className="space-y-2">
                              {historialPerrito
                                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                .map(v => (
                                  <div
                                    key={v.id}
                                    className="p-2.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap justify-between items-center gap-2"
                                  >
                                    <div>
                                      <p className="font-bold text-xs sm:text-base text-gray-900">
                                        📅 {v.fecha} — 🕐 {v.hora?.substring(0, 5) || ''}
                                      </p>
                                      {v.detalleVisita && (
                                        <p className="text-[11px] sm:text-sm text-gray-600 mt-0.5">
                                          📝 {v.detalleVisita}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] sm:text-xs">
                                        {v.estado === 'FINALIZADA' || v.estado === 'PAGADO' ? 'Cerrada' : v.estado}
                                      </span>
                                      {v.montoRecaudado != null && (
                                        <p className="text-xs sm:text-base font-extrabold text-purple-700 mt-0.5">
                                          💰 ${Number(v.montoRecaudado).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Botón para editar inline dentro del mismo menú */}
                        <div className="flex gap-2 sm:gap-4 pt-1">
                          <button
                            type="button"
                            onClick={(e) => abrirEdicionInline(p, e)}
                            className="flex-1 p-2.5 sm:p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl transition flex items-center justify-center gap-1.5"
                          >
                            <Edit2 size={15} /> Editar Datos
                          </button>
                          <button
                            type="button"
                            onClick={(e) => eliminarMascota(p.id, e)}
                            className="flex-1 p-2.5 sm:p-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl transition flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={15} /> Eliminar Ficha
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
