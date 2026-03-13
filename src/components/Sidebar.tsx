import { 
  Building2, Home, Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen, Users
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: 'houses' | 'customers' | 'settings';
  setActiveTab: (tab: 'houses' | 'customers' | 'settings') => void;
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
      
      <nav className="sidebar-nav">
        <button className={`nav-item ${activeTab === 'houses' ? 'active' : ''}`} onClick={() => setActiveTab('houses')}>
          <Home size={20} className="nav-icon" />
          {isSidebarOpen && <span className="nav-text">Houses</span>}
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