import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HousesView from './views/HousesView';
import CustomersView from './views/CustomersView';
import SettingsView from './views/SettingsView';
import CalendarView from './views/CalendarView';
import QualityCheckView from './views/QualityCheckView';
import LoginView from './views/auth/LoginView';
import RolesView from './views/admin/RolesView';
import UsersView from './views/admin/UsersView';

import type { Property, Role, SystemUser } from './types/index';
import './App.css';

// Importaciones para detectar la sesión y leer de Firebase
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

type TabOptions = 'houses' | 'calendar' | 'invoices' | 'done' | 'qc_report' | 'qc_route' | 'payroll' | 'customers' | 'settings' | 'roles' | 'users';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabOptions>('houses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentSettingView, setCurrentSettingView] = useState<string>('menu');
  const [houseToInspect, setHouseToInspect] = useState<Property | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);

  // 1. CARGAR TODOS LOS ROLES GLOBALES
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

  // 2. DETECTAR EL USUARIO ACTIVO Y BUSCAR SU PERFIL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
        try {
          // Buscamos el perfil del usuario en Firestore por su email
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
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. CALCULAR EL ROL ACTIVO EN BASE AL USUARIO
  const activeRole = useMemo(() => {
    if (!currentUser || roles.length === 0) return null;
    return roles.find(r => r.id === currentUser.roleId) || null;
  }, [currentUser, roles]);

  // 4. LÓGICA PARA OCULTAR REGISTROS (SCOPE: OWN vs ALL)
  const visibleProperties = useMemo(() => {
    if (!activeRole) return [];
    if (activeRole.name === 'Administrator') return properties;
    
    // Verificamos si tiene permiso de ver Houses
    const housesPerm = activeRole.permissions.find(p => p.module === 'Houses');
    if (!housesPerm || !housesPerm.canView) return [];
    
    // Si el scope es "Own", aquí filtraremos por su equipo cuando lo implementemos
    if (housesPerm.scope === 'Own') {
      // TODO: Filtrar properties.filter(p => p.teamId === currentUser.teamId)
      return properties; // Por ahora mostramos todas las que el sistema traiga
    }
    
    return properties; 
  }, [properties, activeRole]);

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
      {/* Pasamos el activeRole al Sidebar para que sepa qué ocultar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab} 
        onSettingsClick={handleSettingsClick}
        activeRole={activeRole} 
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