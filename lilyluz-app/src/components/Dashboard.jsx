import { useState } from 'react';
import { Calendar, Users, DollarSign, Package, PieChart } from 'lucide-react';
import Agenda from '../pages/Agenda';
import Mascotas from '../pages/Mascotas';
import Finanzas from '../pages/Finanzas';
import FichaPerrito from '../pages/FichaPerrito';
import Productos from '../pages/Productos';
import DashboardHome from '../pages/DashboardHome';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedCita, setSelectedCita] = useState(null);

  const renderContent = () => {
    if (selectedCita) {
      return <FichaPerrito citaId={selectedCita.id} onBack={() => setSelectedCita(null)} />;
    }
    switch (activeTab) {
      case 'inicio': return <DashboardHome onNavigate={setActiveTab} onSelectCita={setSelectedCita} />;
      case 'agenda': return <Agenda onSelectCita={setSelectedCita} />;
      case 'mascotas': return <Mascotas />;
      case 'productos': return <Productos />;
      case 'finanzas': return <Finanzas />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans selection:bg-blue-200">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex flex-col p-8">
        <div className="flex flex-col items-center mb-10 cursor-pointer" onClick={() => { setActiveTab('inicio'); setSelectedCita(null); }}>
          <img
            src="/logo.png"
            alt="LilyLuz Spa — Peluquería Canina"
            className="w-48 h-48 object-contain rounded-full shadow-md hover:scale-105 transition-all duration-300 border-2 border-amber-100/50 bg-[#FBF9F5]"
          />
        </div>
        <nav className="flex flex-col gap-4">
          <button onClick={() => {setActiveTab('inicio'); setSelectedCita(null);}} 
                  className={`flex items-center gap-4 text-2xl font-bold p-5 rounded-2xl transition ${activeTab === 'inicio' && !selectedCita ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
            <PieChart /> Inicio
          </button>
          <button onClick={() => {setActiveTab('agenda'); setSelectedCita(null);}} 
                  className={`flex items-center gap-4 text-2xl font-bold p-5 rounded-2xl transition ${activeTab === 'agenda' && !selectedCita ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Calendar /> Agenda
          </button>
          <button onClick={() => {setActiveTab('mascotas'); setSelectedCita(null);}} 
                  className={`flex items-center gap-4 text-2xl font-bold p-5 rounded-2xl transition ${activeTab === 'mascotas' && !selectedCita ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Users /> Mascotas
          </button>
          <button onClick={() => {setActiveTab('productos'); setSelectedCita(null);}} 
                  className={`flex items-center gap-4 text-2xl font-bold p-5 rounded-2xl transition ${activeTab === 'productos' && !selectedCita ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Package /> Inventario
          </button>
          <button onClick={() => {setActiveTab('finanzas'); setSelectedCita(null);}} 
                  className={`flex items-center gap-4 text-2xl font-bold p-5 rounded-2xl transition ${activeTab === 'finanzas' && !selectedCita ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
            <DollarSign /> Finanzas
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 overflow-auto">
        <div className="max-w-[1200px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}