import { useState, useEffect } from 'react'
import { PlayCircle, CheckCircle, MessageCircle, RefreshCw, Plus, X } from 'lucide-react'

// Detecta automáticamente si entras por localhost o por la IP del celular
const API_URL = `http://${window.location.hostname}:8080/api`

export default function App() {
  const [visitas, setVisitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)

  // Estado del formulario
  const [nuevoTutor, setNuevoTutor] = useState('')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevoPerrito, setNuevoPerrito] = useState('')
  const [nuevaRaza, setNuevaRaza] = useState('')
  const [nuevaHora, setNuevaHora] = useState('10:00')
  const [guardando, setGuardando] = useState(false)

  // 1. Cargar citas del día
  const cargarVisitas = async () => {
    try {
      setCargando(true)
      const res = await fetch(`${API_URL}/visitas/hoy`)
      const data = await res.json()
      setVisitas(data)
    } catch (error) {
      console.error('Error al conectar con la API:', error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarVisitas()
  }, [])

  // 2. Iniciar visita
  const iniciarVisita = async (id) => {
    try {
      const res = await fetch(`${API_URL}/visitas/${id}/iniciar`, {
        method: 'PATCH',
      })
      if (res.ok) cargarVisitas()
    } catch (error) {
      console.error('Error al iniciar visita:', error)
    }
  }

  // 3. Terminar visita
  const terminarVisita = async (id) => {
    try {
      const res = await fetch(`${API_URL}/visitas/${id}/terminar`, {
        method: 'PATCH',
      })
      if (res.ok) cargarVisitas()
    } catch (error) {
      console.error('Error al terminar visita:', error)
    }
  }

  // 4. Guardar nueva cita (Tutor -> Mascota -> Visita)
  const handleGuardarCita = async (e) => {
    e.preventDefault()
    setGuardando(false)

    try {
      // Paso A: Crear el tutor
      const resTutor = await fetch(`${API_URL}/tutores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoTutor,
          telefono: nuevoTelefono,
          direccion: 'No especificada'
        })
      })
      const tutorData = await resTutor.json()

      // Paso B: Crear la mascota
      const resMascota = await fetch(`${API_URL}/mascotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoPerrito,
          raza: nuevaRaza || 'Mestizo',
          edad: 1,
          peso: 5.0,
          tutor: { id: tutorData.id },
          tagsComportamiento: []
        })
      })
      const mascotaData = await resMascota.json()

      // Paso C: Crear la visita para hoy
      const hoy = new Date().toISOString().split('T')[0]
      await fetch(`${API_URL}/visitas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascota: { id: mascotaData.id },
          fecha: hoy,
          hora: `${nuevaHora}:00`,
          estado: 'PROGRAMADA'
        })
      })

      // Limpiar formulario y refrescar lista
      setNuevoTutor('')
      setNuevoTelefono('')
      setNuevoPerrito('')
      setNuevaRaza('')
      setNuevaHora('10:00')
      setMostrarModal(false)
      cargarVisitas()
    } catch (error) {
      console.error('Error al registrar la cita:', error)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24 font-sans relative">
      <header className="bg-pink-500 text-white p-6 shadow-md rounded-b-3xl text-center">
        <h1 className="text-3xl font-bold">🐾 Lily Luz Spa</h1>
        <h2 className="text-xl mt-2 font-medium opacity-90">¿Qué tengo hoy?</h2>
      </header>

      <div className="flex justify-between items-center px-5 mt-4">
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
        >
          <Plus size={20} /> Agendar Cita
        </button>

        <button 
          onClick={cargarVisitas}
          className="flex items-center gap-2 text-pink-600 bg-pink-50 font-bold px-4 py-2 rounded-xl border border-pink-200 active:bg-pink-100 cursor-pointer"
        >
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      <main className="p-4 space-y-6">
        {cargando ? (
          <p className="text-center text-gray-500 text-xl font-medium mt-10">Cargando perritos...</p>
        ) : visitas.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-2xl border border-gray-100 mt-6 shadow-sm">
            <p className="text-xl font-bold text-gray-700">No hay perritos agendados para hoy</p>
            <p className="text-sm text-gray-400 mt-2">Usa el botón "+ Agendar Cita" para agregar el primero.</p>
          </div>
        ) : (
          visitas.map((visita) => {
            const tel = visita.mascota?.tutor?.telefono || ''
            const tutorNombre = visita.mascota?.tutor?.nombre || 'Tutor'
            const mensajeWa = encodeURIComponent(
              `🐶❤️ ¡Hola ${tutorNombre}! ${visita.mascota?.nombre} ya está listo para que lo vengas a buscar a Lily Luz Spa 🐾`
            )

            return (
              <div key={visita.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{visita.mascota?.nombre}</p>
                    <p className="text-lg text-gray-500">{visita.mascota?.raza || 'Sin raza'}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-bold">{visita.hora?.substring(0, 5)}</span>
                  </div>
                </div>

                {visita.estado === 'PROGRAMADA' && (
                  <button 
                    onClick={() => iniciarVisita(visita.id)}
                    className="w-full bg-green-500 active:bg-green-600 text-white text-xl font-bold py-5 rounded-2xl shadow-md flex items-center justify-center gap-3 cursor-pointer transition-colors"
                  >
                    <PlayCircle size={32} />
                    Iniciar Visita
                  </button>
                )}

                {visita.estado === 'EN_PROCESO' && (
                  <button 
                    onClick={() => terminarVisita(visita.id)}
                    className="w-full bg-blue-500 active:bg-blue-600 text-white text-xl font-bold py-5 rounded-2xl shadow-md flex items-center justify-center gap-3 cursor-pointer transition-colors"
                  >
                    <CheckCircle size={32} />
                    ¡Perrito Listo!
                  </button>
                )}

                {visita.estado === 'LISTO' && (
                  <a 
                    href={`https://wa.me/${tel}?text=${mensajeWa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-green-500 active:bg-green-600 text-white text-xl font-bold py-5 rounded-2xl shadow-md flex items-center justify-center gap-3 text-center transition-colors"
                  >
                    <MessageCircle size={32} />
                    Avisar por WhatsApp
                  </a>
                )}
              </div>
            )
          })
        )}
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl relative">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Agendar Perrito 🐶</h3>

            <form onSubmit={handleGuardarCita} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre del Perrito</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Max"
                  value={nuevoPerrito}
                  onChange={(e) => setNuevoPerrito(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-lg focus:outline-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Raza</label>
                <input
                  type="text"
                  placeholder="Ej: Maltés"
                  value={nuevaRaza}
                  onChange={(e) => setNuevaRaza(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-lg focus:outline-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-lg focus:outline-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="56912345678"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-lg focus:outline-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre del Dueño(a)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Camila"
                  value={nuevoTutor}
                  onChange={(e) => setNuevoTutor(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-lg focus:outline-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold py-3.5 rounded-2xl text-lg mt-4 cursor-pointer shadow-md"
              >
                {guardando ? 'Guardando...' : 'Guardar Cita'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}