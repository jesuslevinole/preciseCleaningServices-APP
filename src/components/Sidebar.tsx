import { 
  Building2, Home, Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen, Users, CalendarDays,
  FileText, CheckCircle, ClipboardCheck, Map, DollarSign 
} from 'lucide-react';

// Interfaz para asegurar que TypeScript reconozca todas nuestras nuevas pestañas
interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings';
  setActiveTab: (tab: 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings') => void;
  onSettingsClick: () => void;
}

export default function Sidebar({ 
  isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, onSettingsClick 
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
          {isSidebarOpen ? (
            <><PanelLeftClose size={18} /><span></span></>
          ) : (
            <><PanelLeftOpen size={18} /><span></span></>
          )}
        </button>
      </div>

      {isSidebarOpen && <div className="menu-label">MENU</div>}
      
      {/* Contenedor de navegación principal */}
      <nav className="sidebar-nav">
        
        <button className={`nav-item ${activeTab === 'houses' ? 'active' : ''}`} onClick={() => setActiveTab('houses')}>
          <Home size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Houses</span>}
        </button>

        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <CalendarDays size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Calendar</span>}
        </button>

        <button className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
          <FileText size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Invoices</span>}
        </button>

        <button className={`nav-item ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>
          <CheckCircle size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Done</span>}
        </button>

        <button className={`nav-item ${activeTab === 'qc_report' ? 'active' : ''}`} onClick={() => setActiveTab('qc_report')}>
          <ClipboardCheck size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Quality Check Report</span>}
        </button>

        <button className={`nav-item ${activeTab === 'qc_route' ? 'active' : ''}`} onClick={() => setActiveTab('qc_route')}>
          <Map size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Quality Check Route</span>}
        </button>

        <button className={`nav-item ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>
          <DollarSign size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Payroll</span>}
        </button>
        
        <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          <Users size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Customers</span>}
        </button>
        
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={onSettingsClick}>
          <SettingsIcon size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Settings</span>}
        </button>
        
      </nav>
    </aside>
  );
}