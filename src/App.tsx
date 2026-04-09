import { useState, useMemo } from 'react';
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

type TabOptions = 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings' | 'roles' | 'users';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabOptions>('houses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentSettingView, setCurrentSettingView] = useState<string>('menu');
  const [houseToInspect, setHouseToInspect] = useState<Property | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [simulationRole, setSimulationRole] = useState<string | null>(null);

  const activeRoleId = useMemo(() => simulationRole || "", [simulationRole]);

  const visibleProperties = useMemo(() => {
    const currentRole = roles.find(r => r.id === activeRoleId);
    if (currentRole?.name === 'Administrator') return properties;
    return properties; 
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

        {activeTab === 'roles' && (
          <RolesView 
            onOpenMenu={() => setIsSidebarOpen(true)} 
            roles={roles} 
            setRoles={setRoles} 
          />
        )}
        
        {activeTab === 'users' && <UsersView onOpenMenu={() => setIsSidebarOpen(true)} roles={roles} />}

        {(activeTab === 'invoices' || activeTab === 'done' || activeTab === 'qc_route' || activeTab === 'payroll') && (
          <div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h2 style={{ color: '#111827', fontSize: '1.5rem', margin: '0 0 8px 0' }}>Under Construction</h2>
            <p style={{ margin: 0 }}>The {activeTab.replace('_', ' ')} view is currently being developed.</p>
          </div>
        )}
      </main>
    </div>
  );
}