import { useState } from 'react';
import Sidebar from './components/Sidebar';
import HousesView from './views/HousesView';
import CustomersView from './views/CustomersView';
import SettingsView from './views/SettingsView';
import CalendarView from './views/CalendarView';
import QualityCheckView from './views/QualityCheckView'; // <-- 1. Importamos la nueva vista
import type { Property } from './types';
import './App.css';

const initialProperties: Property[] = [
  { id: '1', address: '1405 Fairbanks St, Copperas Cove, TX', city: 'Copperas Cove', rooms: '3', bathrooms: '2', size: 'Full', description: 'Janina A. 3bds Estimate', bottomNote: '$120 - $220 Code: 0285', statusId: '1', invoiceStatus: 'Needs Invoice', receiveDate: '2026-03-01', scheduleDate: '', client: 'Janina A.', note: '', employeeNote: '', serviceId: 's1', priorityId: '2', teamId: '', timeIn: '', timeOut: '' },
  { id: '2', address: '2501 Bacon Ranch Rd, Killeen, TX', city: 'Killeen', rooms: '1', bathrooms: '1', size: 'Full', description: 'CMA. Full. 1bds Apt 517 (AM)', tag: { text: 'TEAM 2', type: 'team' }, statusId: '4', invoiceStatus: 'Paid', receiveDate: '2026-03-05', scheduleDate: '2026-03-06', client: 'CMA', note: 'Call before arriving', employeeNote: '', serviceId: 's1', priorityId: '1', teamId: '2', timeIn: '08:00', timeOut: '12:00' },
  { id: '3', address: '3402 S W S Young Dr, Killeen, TX', city: 'Killeen', rooms: '4', bathrooms: '2', size: 'Heavy', description: 'Linnemann. Heavy Clean.', tag: { text: 'PREPAID', type: 'prepaid' }, borderColorClass: 'border-red', bottomNote: '*PREPAID Mia*', statusId: '2', invoiceStatus: 'Pending', receiveDate: '2026-03-10', scheduleDate: '', client: 'Linnemann', note: 'Key under the mat', employeeNote: '', serviceId: 's2', priorityId: '1', teamId: '', timeIn: '', timeOut: '' }
];

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings'>('houses');
  const [currentSettingView, setCurrentSettingView] = useState<string>('menu');
  const [properties, setProperties] = useState<Property[]>(initialProperties);

  // NUEVO: Estado para saber qué casa se va a inspeccionar cuando le den al botón "Check"
  const [houseToInspect, setHouseToInspect] = useState<Property | null>(null);

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setCurrentSettingView('menu');
  }; 

  // Función que se dispara desde HousesView para abrir el Quality Check
  const handleCheckHouse = (house: Property) => {
    setHouseToInspect(house);
    setActiveTab('qc_report');
  };

  return (
    <div className="app-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettingsClick={handleSettingsClick}
      />

      <main className="main-content">
        {activeTab === 'houses' && (
          <HousesView 
            properties={properties} 
            setProperties={setProperties} 
            onOpenMenu={() => setIsSidebarOpen(true)} 
            onCheckHouse={handleCheckHouse} // Pasamos la función al componente
          />
        )}
        
        {activeTab === 'calendar' && <CalendarView properties={properties} onOpenMenu={() => setIsSidebarOpen(true)} />}
        
        {/* NUEVO: Renderizamos la vista de Quality Check */}
        {activeTab === 'qc_report' && (
          <QualityCheckView 
            properties={properties} 
            onOpenMenu={() => setIsSidebarOpen(true)} 
            houseToInspect={houseToInspect}
            clearHouseToInspect={() => setHouseToInspect(null)}
          />
        )}

        {activeTab === 'customers' && <CustomersView onOpenMenu={() => setIsSidebarOpen(true)} />}
        
        {activeTab === 'settings' && (
          <SettingsView 
            currentSettingView={currentSettingView}
            setCurrentSettingView={setCurrentSettingView}
            onOpenMenu={() => setIsSidebarOpen(true)}
          />
        )}

        {(activeTab === 'invoices' || activeTab === 'done' || activeTab === 'qc_route' || activeTab === 'payroll') && (
          <div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h2 style={{ color: '#111827', fontSize: '1.5rem', marginBottom: '8px' }}>Under Construction</h2>
            <p>The {activeTab.replace('_', ' ')} view is currently being developed.</p>
          </div>
        )}
      </main>
    </div>
  );
}