import { 
  Building2, Home, Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen, Users, CalendarDays,
  ShieldCheck, UserPlus, UserCircle, RefreshCcw 
} from 'lucide-react';

// Centralizamos las opciones de pestañas
type TabOptions = 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings' | 'roles' | 'users';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: TabOptions;
  setActiveTab: (tab: TabOptions) => void;
  onSettingsClick: () => void;
  simulationRole: string | null;
  setSimulationRole: (roleId: string | null) => void;
  roles: any[];
}

export default function Sidebar({ 
  isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, onSettingsClick,
  simulationRole, setSimulationRole, roles 
}: SidebarProps) {
  
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon"><Building2 size={20} color="white" /></div>
          {isSidebarOpen && <span className="logo-text">Precise Cleaning</span>}
        </div>
      </div>
      
      <div className="sidebar-toggle-container">
        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* MÓDULOS OPERATIVOS */}
        <button className={`nav-item ${activeTab === 'houses' ? 'active' : ''}`} onClick={() => setActiveTab('houses')}>
          <Home size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Houses</span>}
        </button>

        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <CalendarDays size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Calendar</span>}
        </button>

        <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          <Users size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Customers</span>}
        </button>

        {/* SECCIÓN ADMIN */}
        {isSidebarOpen && <div className="menu-label" style={{ marginTop: '20px' }}>ADMIN</div>}

        <button className={`nav-item ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>
          <ShieldCheck size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Roles & Permissions</span>}
        </button>

        <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <UserPlus size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">System Users</span>}
        </button>
        
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={onSettingsClick}>
          <SettingsIcon size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Settings</span>}
        </button>

        {/* --- SIMULADOR DE ROLES --- */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {isSidebarOpen && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>SIMULATE VIEW</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              onClick={() => setSimulationRole(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', backgroundColor: simulationRole === null ? '#2563eb' : 'transparent', color: 'white', width: '100%' }}
            >
              <UserCircle size={16} /> {isSidebarOpen && "Real Identity"}
            </button>

            {roles.map(r => (
              <button 
                key={r.id}
                onClick={() => setSimulationRole(r.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', backgroundColor: simulationRole === r.id ? '#f59e0b' : 'transparent', color: 'white', width: '100%' }}
              >
                <RefreshCcw size={14} /> {isSidebarOpen && `As ${r.name}`}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}