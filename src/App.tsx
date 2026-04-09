import { useState, useMemo } from 'react'; // Agregamos useMemo para optimizar
import Sidebar from './components/Sidebar';
import HousesView from './views/HousesView';
import CustomersView from './views/CustomersView';
import SettingsView from './views/SettingsView';
import CalendarView from './views/CalendarView';
import QualityCheckView from './views/QualityCheckView';
import LoginView from './views/auth/LoginView';
import RolesView from './views/admin/RolesView';
import UsersView from './views/admin/UsersView';

import type { Property, Role } from './types/index';
import './App.css';

const initialProperties: Property[] = [
  { id: '1', address: '1405 Fairbanks St, Copperas Cove, TX', city: 'Copperas Cove', rooms: '3', bathrooms: '2', size: 'Full', description: 'Janina A. 3bds Estimate', bottomNote: '$120 - $220 Code: 0285', statusId: '1', invoiceStatus: 'Needs Invoice', receiveDate: '2026-03-01', scheduleDate: '', client: 'Janina A.', note: '', employeeNote: '', serviceId: 's1', priorityId: '2', teamId: '', timeIn: '', timeOut: '' },
  { id: '2', address: '2501 Bacon Ranch Rd, Killeen, TX', city: 'Killeen', rooms: '1', bathrooms: '1', size: 'Full', description: 'CMA. Full. 1bds Apt 517 (AM)', tag: { text: 'TEAM 2', type: 'team' }, statusId: '4', invoiceStatus: 'Paid', receiveDate: '2026-03-05', scheduleDate: '2026-03-06', client: 'CMA', note: 'Call before arriving', employeeNote: '', serviceId: 's1', priorityId: '1', teamId: '2', timeIn: '08:00', timeOut: '12:00' },
  { id: '3', address: '3402 S W S Young Dr, Killeen, TX', city: 'Killeen', rooms: '4', bathrooms: '2', size: 'Heavy', description: 'Linnemann. Heavy Clean.', tag: { text: 'PREPAID', type: 'prepaid' }, borderColorClass: 'border-red', bottomNote: '*PREPAID Mia*', statusId: '2', invoiceStatus: 'Pending', receiveDate: '2026-03-10', scheduleDate: '', client: 'Linnemann', note: 'Key under the mat', employeeNote: '', serviceId: 's2', priorityId: '1', teamId: '', timeIn: '', timeOut: '' }
];

type TabOptions = 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings' | 'roles' | 'users';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabOptions>('houses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [currentSettingView, setCurrentSettingView] = useState<string>('menu');
  const [houseToInspect, setHouseToInspect] = useState<Property | null>(null);

  // --- LÓGICA DE ROLES Y SIMULACIÓN ---
  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', name: 'Administrator', description: 'Full Access', permissions: [] },
    { id: 'r2', name: 'Employee', description: 'Limited Access', permissions: [] }
  ]);
  const [simulationRole, setSimulationRole] = useState<string | null>(null);

  // SOLUCIÓN ALERTA: Usamos useMemo para que la función sea útil y eficiente
  const activeRoleId = useMemo(() => simulationRole || "r1", [simulationRole]);

  // SOLUCIÓN ALERTA: Aplicamos una lógica de filtrado de datos basada en el rol activo
  const visibleProperties = useMemo(() => {
    // Si el rol activo es Admin, ve todo. Si es otro, podrías filtrar aquí
    const currentRole = roles.find(r => r.id === activeRoleId);
    if (currentRole?.name === 'Administrator') return properties;
    return properties; // Por ahora devolvemos todo, pero aquí iría tu lógica de "Own Records"
  }, [properties, activeRoleId, roles]);

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setCurrentSettingView('menu');
  }; 

  const handleCheckHouse = (house: Property) => {
    setHouseToInspect(house);
    setActiveTab('qc_report');
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab} 
        onSettingsClick={handleSettingsClick}
        simulationRole={simulationRole}
        setSimulationRole={setSimulationRole}
        roles={roles}
      />

      <main className="main-content">
        {activeTab === 'houses' && (
          <HousesView 
            properties={visibleProperties as any} 
            setProperties={setProperties as any} 
            onOpenMenu={() => setIsSidebarOpen(true)} 
            onCheckHouse={handleCheckHouse} 
          />
        )}
        
        {activeTab === 'calendar' && <CalendarView properties={visibleProperties as any} onOpenMenu={() => setIsSidebarOpen(true)} />}
        
        {activeTab === 'qc_report' && (
          <QualityCheckView 
            properties={visibleProperties as any} 
            onOpenMenu={() => setIsSidebarOpen(true)} 
            houseToInspect={houseToInspect as any}
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

        {/* SOLUCIÓN ALERTA: Pasamos setRoles a la vista para que pueda actualizar el estado global */}
        {activeTab === 'roles' && (
          <RolesView 
            onOpenMenu={() => setIsSidebarOpen(true)} 
            roles={roles} 
            setRoles={setRoles} 
          />
        )}
        
        {activeTab === 'users' && <UsersView onOpenMenu={() => setIsSidebarOpen(true)} />}

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