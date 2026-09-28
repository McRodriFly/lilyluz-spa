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

  const navItems = [
    { id: 'inicio',    label: 'Inicio',     icon: PieChart },
    { id: 'agenda',    label: 'Agenda',     icon: Calendar },
    { id: 'mascotas',  label: 'Mascotas',   icon: Users },
    { id: 'productos', label: 'Inventario', icon: Package },
    { id: 'finanzas',  label: 'Finanzas',   icon: DollarSign },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedCita(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (selectedCita) {
      return <FichaPerrito citaId={selectedCita.id} onBack={() => setSelectedCita(null)} />;
    }
    switch (activeTab) {
      case 'inicio':    return <DashboardHome onNavigate={handleTabChange} onSelectCita={setSelectedCita} />;
      case 'agenda':    return <Agenda onSelectCita={setSelectedCita} />;
      case 'mascotas':  return <Mascotas />;
      case 'productos': return <Productos />;
      case 'finanzas':  return <Finanzas />;
      default:          return <DashboardHome onNavigate={handleTabChange} onSelectCita={setSelectedCita} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans selection:bg-blue-200 flex flex-col md:flex-row">
      {/* ── TOPBAR PARA IPHONE / MÓVIL (ESTILO IOS NAVIGATION BAR) ── */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-2xl border-b border-gray-200/80 px-4 py-3 flex items-center justify-between pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          onClick={() => handleTabChange('inicio')}
          className="flex items-center gap-2.5 active:opacity-70 transition"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 rounded-full object-contain border border-amber-100 bg-[#FBF9F5]"
          />
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">
            LilyLuz Spa
          </span>
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {navItems.find(i => i.id === activeTab)?.label || 'Inicio'}
        </span>
      </header>

      {/* ── SIDEBAR PARA ESCRITORIO / IPAD LANDSCAPE (MD EN ADELANTE) ── */}
      <aside className="hidden md:flex w-72 lg:w-80 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 flex-col p-6 lg:p-8 flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div
          className="flex flex-col items-center mb-10 cursor-pointer group"
          onClick={() => handleTabChange('inicio')}
        >
          <img
            src="/logo.png"
            alt="LilyLuz Spa — Peluquería Canina"
            className="w-44 h-44 object-contain rounded-full shadow-md group-hover:scale-105 transition-all duration-300 border-2 border-amber-100/50 bg-[#FBF9F5]"
          />
        </div>

        <nav className="flex flex-col gap-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedCita;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-4 text-xl lg:text-2xl font-bold p-4 lg:p-5 rounded-2xl transition active:scale-98 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={26} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── CONTENIDO PRINCIPAL (CON PADDING INFERIOR SEGURO PARA LA TABBAR DE IPHONE) ── */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-36 md:pb-12 max-w-7xl w-full mx-auto overflow-x-hidden">
        {renderContent()}
      </main>

      {/* ── BOTTOM TABBAR ESTILO APPLE PARA IPHONE / MÓVIL ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-gray-200/90 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedCita;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-90 ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] font-bold mt-0.5 tracking-tight ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
