
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Agenda from './pages/Agenda';
import Finanzas from './pages/Finanzas';
import Mascotas from './pages/Mascotas';
import FichaPerrito from './pages/FichaPerrito';
import Productos from './pages/Productos';

export default function App() {
  const [view, setView] = useState('agenda');
  const [selectedCita, setSelectedCita] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null); 

  const renderView = () => {
    switch(view) {
      case 'agenda': return <Agenda onSelectCita={(cita) => { setSelectedCita(cita.id); setSelectedMascota(null); setView('ficha'); }} />;
      case 'mascotas': return <Mascotas onSelectMascota={(nombre) => { setSelectedMascota(nombre); setSelectedCita(null); setView('ficha'); }} />;
      case 'finanzas': return <Finanzas />;
      case 'productos': return <Productos />;
      case 'ficha':
        return <FichaPerrito 
                 citaId={selectedCita} 
                 mascotaNombre={selectedMascota} 
                 onBack={() => { setView(selectedMascota ? 'mascotas' : 'agenda'); setSelectedCita(null); setSelectedMascota(null); }} 
               />;
      default: return <Agenda />;
    }
  };
  return <Dashboard view={view} setView={setView}>{renderView()}</Dashboard>;
}
