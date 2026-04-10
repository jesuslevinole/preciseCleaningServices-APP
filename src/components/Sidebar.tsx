import { 
  Building2, Home, Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen, Users, CalendarDays,
  ShieldCheck, UserPlus, LogOut 
} from 'lucide-react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import type { Role } from '../types/index';

type TabOptions = 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings' | 'roles' | 'users';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: TabOptions;
  setActiveTab: (tab: TabOptions) => void;
  onSettingsClick: () => void;
  activeRole: Role | null;
  isSuperAdmin: boolean; // Recibimos la llave maestra
}

export default function Sidebar({ 
  isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, onSettingsClick, activeRole, isSuperAdmin 
}: SidebarProps) {
  
  // Función universal para chequear permisos
  const canView = (moduleName: string) => {
    if (isSuperAdmin) return true; // Llave maestra ve todo
    if (!activeRole) return false;
    
    const permission = activeRole.permissions?.find(p => p.module === moduleName);
    return permission ? permission.canView : false;
  };

  // El acceso a Admin (Roles, Users, Settings) está dictado por el permiso "Settings" de la matriz
  const canViewAdmin = isSuperAdmin || canView('Settings');

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut(auth);
      window.location.reload(); // Forzamos limpieza si era bypass
    }
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`} style={{ display: 'flex', flexDirection: 'column' }}>
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

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {/* MÓDULOS OPERATIVOS */}
        
        {canView('Houses') && (
          <button className={`nav-item ${activeTab === 'houses' ? 'active' : ''}`} onClick={() => setActiveTab('houses')}>
            <Home size={20} className="nav-icon" />
            {isSidebarOpen && <span className="nav-text">Houses</span>}
          </button>
        )}

        {canView('Calendar') && (
          <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <CalendarDays size={20} className="nav-icon" />
            {isSidebarOpen && <span className="nav-text">Calendar</span>}
          </button>
        )}

        {canView('Customers') && (
          <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
            <Users size={20} className="nav-icon" />
            {isSidebarOpen && <span className="nav-text">Customers</span>}
          </button>
        )}

        {/* SECCIÓN ADMIN */}
        {canViewAdmin && (
          <>
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
          </>
        )}
      </nav>

      {/* BOTÓN DE LOGOUT */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', backgroundColor: 'transparent', color: '#ef4444', width: '100%', fontWeight: 600, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={18} /> {isSidebarOpen && "Log Out"}
        </button>
      </div>
    </aside>
  );
}