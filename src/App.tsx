import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HousesView from './views/HousesView';
import CustomersView from './views/CustomersView';
import SettingsView from './views/SettingsView';
import CalendarView from './views/CalendarView';
import QualityCheckView from './views/QualityCheckView'; 
import PayrollView from './views/PayrollView'; 
import InvoicesView from './views/InvoicesView';
import NoticeBoardView from './views/NoticeBoardView';
import LoginView from './views/auth/LoginView';
import RolesView from './views/admin/RolesView';
import UsersView from './views/admin/UsersView';

import type { Property, Role, SystemUser } from './types/index';
import './App.css';

import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

export type TabOptions = 'houses' | 'calendar' | 'invoices' | 'board' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings' | 'roles' | 'users';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isBypass, setIsBypass] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabOptions>('houses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentSettingView, setCurrentSettingView] = useState<string>('menu');
  const [houseToInspect, setHouseToInspect] = useState<Property | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'settings_roles'));
        const loadedRoles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
        setRoles(loadedRoles);
      } catch (error) {
        console.error("Error loading roles globally:", error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
        setIsBypass(false);
        try {
          const q = query(collection(db, 'system_users'), where('email', '==', user.email.toLowerCase().trim()));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const userData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SystemUser;
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    if (!auth.currentUser) {
      setIsBypass(true);
    }
  };

  const activeRole = useMemo(() => {
    if (!currentUser || roles.length === 0) return null;
    return roles.find(r => r.id === currentUser.roleId) || null;
  }, [currentUser, roles]);

  const isSuperAdmin = isBypass || activeRole?.name === 'Administrator';
  const visibleProperties = properties; 

  const handleSettingsClick = () => {
    setActiveTab('settings');
    setCurrentSettingView('menu');
  }; 

  const handleCheckHouse = (house: Property) => {
    setHouseToInspect(house);
    setActiveTab('qc_report');
  };

  const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab} 
        onSettingsClick={handleSettingsClick}
        activeRole={activeRole} 
        isSuperAdmin={isSuperAdmin}
      />

      <main className="main-content">
        {activeTab === 'houses' && (
          <HousesView 
            properties={visibleProperties as any} 
            setProperties={setProperties as any} 
            onOpenMenu={toggleMenu} 
            onCheckHouse={handleCheckHouse} 
            currentUser={currentUser}
            activeRole={activeRole}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        
        {activeTab === 'invoices' && (
          <InvoicesView 
            properties={visibleProperties as any} 
            setProperties={setProperties as any} 
            onOpenMenu={toggleMenu} 
            currentUser={currentUser}
            activeRole={activeRole}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {/* VISTA DEL MURO SOCIAL */}
        {activeTab === 'board' && (
          <NoticeBoardView 
            onOpenMenu={toggleMenu} 
            currentUser={currentUser} 
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {activeTab === 'calendar' && <CalendarView properties={visibleProperties as any} onOpenMenu={toggleMenu} />}
        
        {activeTab === 'payroll' && <PayrollView onOpenMenu={toggleMenu} />}

        {activeTab === 'qc_report' && (
          <QualityCheckView 
            onOpenMenu={toggleMenu} 
            properties={visibleProperties as any}
            houseToInspect={houseToInspect as any}
            clearHouseToInspect={() => setHouseToInspect(null)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'customers' && <CustomersView onOpenMenu={toggleMenu} />}
        
        {activeTab === 'settings' && (
          <SettingsView 
            currentSettingView={currentSettingView}
            setCurrentSettingView={setCurrentSettingView}
            onOpenMenu={toggleMenu}
          />
        )}

        {activeTab === 'roles' && <RolesView onOpenMenu={toggleMenu} roles={roles} setRoles={setRoles} />}
        
        {activeTab === 'users' && <UsersView onOpenMenu={toggleMenu} roles={roles} />}

        {(activeTab === 'done' || activeTab === 'qc_route') && (
          <div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h2 style={{ color: '#111827', fontSize: '1.5rem', margin: '0 0 8px 0' }}>Under Construction</h2>
            <p style={{ margin: 0 }}>The {activeTab.replace('_', ' ')} view is currently being developed.</p>
          </div>
        )}
      </main>
    </div>
  );
}