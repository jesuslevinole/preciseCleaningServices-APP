import { useState, useEffect } from 'react';
import { 
  MapPin, Edit2, Trash2, Clock, ChevronDown, Filter, Menu, CheckSquare, Eye,
  Search, Plus, Briefcase, ShieldCheck, AlertTriangle, Users
} from 'lucide-react';

import type { Property, Status, Team, Priority, Service, Customer, SystemUser, Role, PayrollRecord } from '../types/index';

import { propertiesService } from '../services/propertiesService';
import { settingsService } from '../services/settingsService';
import { customersService } from '../services/customersService';
import { payrollService } from '../services/payrollService';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const collectionMap: Record<string, string> = {
  team: 'settings_teams',
  priority: 'settings_priorities',
  status: 'settings_statuses',
  service: 'settings_services',
};

// --- INLINE STATUS PILL SELECTOR ---
const StatusPillSelector = ({ currentStatusId, statuses, onChange, disabled }: { currentStatusId: string, statuses: Status[], onChange: (id: string) => void, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = String(currentStatusId || '').toLowerCase().trim();
  const status = statuses.find(s => String(s.id).toLowerCase().trim() === safeValue || String(s.name).toLowerCase().trim() === safeValue);
  
  const pointColor = status ? status.color : '#64748b';
  const text = status ? status.name : 'Unassigned';

  return (
    <div tabIndex={0} onBlur={() => setTimeout(() => setIsOpen(false), 200)} style={{ position: 'relative', display: 'inline-block', outline: 'none' }}>
      <div 
        onClick={(e) => { e.stopPropagation(); if(!disabled) setIsOpen(!isOpen); }}
        style={{ 
          backgroundColor: 'transparent', color: '#111827', padding: '6px 12px', borderRadius: '20px', 
          fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer', border: '1px solid #e5e7eb', transition: 'all 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        onMouseEnter={(e) => { if(!disabled) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
        onMouseLeave={(e) => { if(!disabled) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pointColor }}></span>
        {text}
        <ChevronDown size={14} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: 'white', 
          border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
          zIndex: 9999, minWidth: '180px', overflow: 'hidden', textAlign: 'left'
        }}>
          {statuses.map((s) => (
            <div 
              key={s.id}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                if(s.id !== currentStatusId && s.name !== currentStatusId) onChange(s.id); 
                setIsOpen(false); 
              }}
              style={{ 
                padding: '12px 14px', fontSize: '0.85rem', fontWeight: 500, color: '#111827', 
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                backgroundColor: (currentStatusId === s.id || currentStatusId === s.name) ? '#f8fafc' : 'transparent',
                borderBottom: '1px solid #f1f5f9'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (currentStatusId === s.id || currentStatusId === s.name) ? '#f8fafc' : 'transparent'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }}></span>
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper Functions
const getRelationName = (list: any[], idOrName: string, fallback = '-') => {
  if (!idOrName) return fallback;
  const safeVal = String(idOrName).toLowerCase().trim();
  const found = list.find(item => String(item.id).toLowerCase().trim() === safeVal || String(item.name).toLowerCase().trim() === safeVal);
  return found ? found.name : fallback;
};

interface HousesViewProps {
  onOpenMenu: () => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  onCheckHouse: (house: Property) => void;
  currentUser?: SystemUser | null;
  activeRole?: Role | null;
  isSuperAdmin?: boolean;
}

export default function HousesView({ onOpenMenu, properties, setProperties, onCheckHouse, currentUser, activeRole, isSuperAdmin }: HousesViewProps) {
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);
  
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]); 
  const [employees, setEmployees] = useState<any[]>([]); 

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigningWorker, setIsAssigningWorker] = useState(false);

  // ESTADOS DE PAYROLL
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [housePayrollRecords, setHousePayrollRecords] = useState<PayrollRecord[]>([]);
  const [payrollForm, setPayrollForm] = useState<PayrollRecord>({
    propertyId: '', date: new Date().toISOString().split('T')[0], employeeId: '', baseAmount: 0, extraAmount: 0, extraNote: '', discountAmount: 0, discountNote: '', totalAmount: 0
  });

  const [formData, setFormData] = useState<Property>({
    id: '', statusId: '', invoiceStatus: 'Pending', receiveDate: '', scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: '',
    beforePhotos: [], afterPhotos: [], assignedWorkers: [] 
  });

  // ESTADOS DE FOTOS
  const [beforePhotoURLs, setBeforePhotoURLs] = useState<string[]>([]);
  const [afterPhotoURLs, setAfterPhotoURLs] = useState<string[]>([]);
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);

  const housePermission = activeRole?.permissions?.find(p => p.module === 'Houses');
  const userScope = isSuperAdmin ? 'All' : (housePermission?.scope || 'Own');

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [ propsData, statusData, teamData, prioData, servData, custData, usersData ] = await Promise.all([
          propertiesService.getAll().catch(e => { console.error("Error Properties:", e); return []; }),
          settingsService.getAll(collectionMap.status).catch(e => { console.error("Error Status:", e); return []; }),
          settingsService.getAll(collectionMap.team).catch(e => { console.error("Error Teams:", e); return []; }),
          settingsService.getAll(collectionMap.priority).catch(e => { console.error("Error Priorities:", e); return []; }),
          settingsService.getAll(collectionMap.service).catch(e => { console.error("Error Services:", e); return []; }),
          customersService.getAll().catch(e => { console.error("Error Customers:", e); return []; }),
          getDocs(collection(db, 'system_users')).then(snap => snapshotToData(snap)).catch(() => []) 
        ]);

        if (propsData) setProperties(propsData);
        if (statusData) setStatuses((statusData as Status[]).sort((a, b) => Number(a.order) - Number(b.order)));
        if (teamData) setTeams(teamData as Team[]);
        if (prioData) setPriorities(prioData as Priority[]);
        if (servData) setServices(servData as Service[]);
        if (custData) setCustomersList(custData);
        if (usersData) setEmployees(usersData);

      } catch (error) {
        console.error("Critical error loading Firebase data:", error);
      } finally {
        setIsLoading(false); 
      }
    };
    fetchAllData();
  }, [setProperties]);

  const snapshotToData = (snapshot: any) => snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

  const propertiesWithScope = properties.filter(prop => {
    if (userScope === 'All') return true;
    if (!currentUser) return false;
    const isAssigned = prop.assignedWorkers?.includes(currentUser.id);
    const isSameTeam = currentUser.teamId && (prop.teamId === currentUser.teamId);
    return isAssigned || isSameTeam;
  });

  const filteredProperties = propertiesWithScope.filter(p => {
    if (activeFilter !== 'All') {
      const st = statuses.find(s => s.id === p.statusId || s.name === p.statusId);
      return st?.name === activeFilter;
    }
    return true;
  });

  // Funciones auxiliares para KPIs
  const getStatusCount = (statusName: string) => propertiesWithScope.filter(p => {
    const st = statuses.find(s => s.id === p.statusId);
    return st?.name === statusName || p.statusId === statusName;
  }).length;

  const kpis = [
    { title: 'Needs to be Schedule', count: getStatusCount('Needs to be Schedule'), icon: Briefcase, color: '#3b82f6' },
    { title: 'In Progress', count: getStatusCount('In Progress'), icon: Clock, color: '#3b82f6' },
    { title: 'Quality Check', count: getStatusCount('Quality Check'), icon: ShieldCheck, color: '#eab308' },
    { title: 'Recall', count: getStatusCount('Recall'), icon: AlertTriangle, color: '#ef4444' },
  ];

  const handleQuickStatusChange = async (propertyId: string, newStatusId: string) => {
    setIsSaving(true);
    try {
      await propertiesService.update(propertyId, { statusId: newStatusId } as any);
      setProperties(properties.map(p => p.id === propertyId ? { ...p, statusId: newStatusId } : p));
      if (selectedHouse && selectedHouse.id === propertyId) {
        setSelectedHouse({ ...selectedHouse, statusId: newStatusId });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update job status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenForm = (house?: Property) => {
    if (house) {
      setFormData(house);
    } else {
      const defaultStatus = statuses.length > 0 ? statuses[0].id : '';
      setFormData({ id: '', statusId: defaultStatus, invoiceStatus: 'Pending', receiveDate: new Date().toISOString().split('T')[0], scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: '', beforePhotos: [], afterPhotos: [], assignedWorkers: [] });
    }
    setSelectedHouse(house || null);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (house: Property) => {
    setSelectedHouse(house);
    setIsAssigningWorker(false);
    setBeforeFiles([]);
    setAfterFiles([]);
    setBeforePhotoURLs(house.beforePhotos || []);
    setAfterPhotoURLs(house.afterPhotos || []);
    setIsDetailModalOpen(true);

    try {
      const records = await payrollService.getByPropertyId(house.id);
      setHousePayrollRecords(records);
    } catch (error) {
      console.error("Error fetching payroll records:", error);
    }
  };

  const handleCustomerSelect = (customerName: string) => {
    const selectedCust = customersList.find(c => c.name === customerName);
    if (selectedCust) {
      setFormData({ ...formData, client: customerName, address: selectedCust.address || formData.address });
    } else {
      setFormData({ ...formData, client: customerName });
    }
  };

  const handleSave = async () => {
    if (!formData.client) return alert("Client is required.");
    if (!formData.address) return alert("Address is required.");

    setIsSaving(true);
    try {
      let workingId = formData.id;
      let isNew = false;
      
      let finalAssignedWorkers = formData.assignedWorkers || [];
      if (formData.teamId && finalAssignedWorkers.length === 0) {
        finalAssignedWorkers = employees.filter(emp => emp.teamId === formData.teamId).map(emp => emp.id);
      }

      if (!workingId) {
        const { id, ...restOfData } = formData;
        const dataToCreate = { 
          ...restOfData,
          assignedWorkers: finalAssignedWorkers,
          description: `${formData.client} - ${formData.rooms} rooms`, 
          city: 'TBD', 
          size: 'TBD' 
        };
        workingId = await propertiesService.create(dataToCreate as any);
        isNew = true;
      }

      const finalDataToUpdate = {
        ...formData,
        assignedWorkers: finalAssignedWorkers,
      };

      if(!isNew) await propertiesService.update(workingId, finalDataToUpdate as any);

      if (isNew) {
        const fullNewData = { ...finalDataToUpdate, id: workingId, description: `${formData.client} - ${formData.rooms} rooms`, city: 'TBD', size: 'TBD' };
        setProperties([...properties, fullNewData as Property]);
      } else {
        setProperties(properties.map(p => p.id === workingId ? { ...finalDataToUpdate } as Property : p));
      }

      setIsFormModalOpen(false);

    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("Error trying to save property.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if(!selectedHouse) return;
    const confirmDelete = window.confirm("Are you sure you want to completely delete this job?");
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      await propertiesService.delete(selectedHouse.id);
      setProperties(properties.filter(p => p.id !== selectedHouse.id));
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error trying to delete property.");
    } finally {
      setIsSaving(false);
    }
  };

  // Styles object
  const s = {
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827', verticalAlign: 'middle' as const },
    dashGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' } as React.CSSProperties,
    kpiCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
    kpiIconBox: (color: string) => ({ backgroundColor: `${color}15`, color: color, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  };

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <style>{`
        .modal-overlay-centered { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; box-sizing: border-box; }
        .modal-70 { background-color: #ffffff; width: 100%; max-width: 1000px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; }
        
        /* Clase para ocultar el scrollbar manteniendo la funcionalidad */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
      
      {/* HEADER PRINCIPAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onOpenMenu} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Menu size={20} color="#111827" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '0.9rem' }}>General operations overview</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: '#6b7280' }} />
            <input type="text" placeholder="Search job..." style={{ backgroundColor: '#ffffff', padding: '10px 14px 10px 40px', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '0.95rem', color: '#111827', width: '250px', outline: 'none' }} />
          </div>
          <button onClick={() => handleOpenForm()} style={{ backgroundColor: '#111827', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> New Job
          </button>
        </div>
      </div>

      {/* TARJETAS SUPERIORES (KPIs) */}
      <div style={s.dashGrid}>
        {kpis.map((kpi, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={s.kpiIconBox(kpi.color)}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>{kpi.title}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{kpi.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CONTENIDO DE COLUMNAS (Izquierda: Tabla | Derecha: Equipos Activos) */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* COLUMNA IZQUIERDA (TABLA) */}
        <div style={{ flex: '1 1 60%', minWidth: '0' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Daily Jobs</h2>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{dateCapitalized}</p>
            </div>

            {/* FILTROS (Solo botón de Status) */}
            <div style={{ display: 'flex', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: activeFilter !== 'All' ? '#10b981' : 'white',
                    color: activeFilter !== 'All' ? 'white' : '#111827',
                    border: `1px solid ${activeFilter !== 'All' ? '#10b981' : '#e5e7eb'}`,
                    padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, 
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <Filter size={16} />
                  {activeFilter === 'All' ? 'All Statuses' : activeFilter}
                  <ChevronDown size={16} style={{ transform: isFilterMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {isFilterMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                    backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '220px', overflow: 'hidden'
                  }}>
                    <div
                      onClick={() => { setActiveFilter('All'); setIsFilterMenuOpen(false); }}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', fontWeight: activeFilter === 'All' ? 700 : 500, backgroundColor: activeFilter === 'All' ? '#f8fafc' : 'white', color: '#111827' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeFilter === 'All' ? '#f8fafc' : 'white'}
                    >
                      All Statuses
                    </div>
                    
                    {statuses
                      .filter(st => st.name.toLowerCase() !== 'invoice' && st.id.toLowerCase() !== 'invoice')
                      .map(st => (
                        <div
                          key={st.id}
                          onClick={() => { setActiveFilter(st.name); setIsFilterMenuOpen(false); }}
                          style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: activeFilter === st.name ? 700 : 500, backgroundColor: activeFilter === st.name ? '#f8fafc' : 'white', color: '#111827' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeFilter === st.name ? '#f8fafc' : 'white'}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: st.color || '#ccc', flexShrink: 0 }}></span>
                          {st.name}
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TABLA DE TRABAJOS (Con todos los botones de acciones restaurados) */}
            <div className="hide-scrollbar" style={{ overflowX: 'auto', width: '100%' }}>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Cargando propiedades...</div>
              ) : filteredProperties.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No se encontraron trabajos.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={s.th}>Actions</th>
                      <th style={s.th}>Client</th>
                      <th style={s.th}>Time</th>
                      <th style={s.th}>Type</th>
                      <th style={s.th}>Team</th>
                      <th style={s.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((house) => (
                      <tr 
                        key={house.id} 
                        onClick={() => handleOpenDetail(house)}
                        style={{ transition: 'background-color 0.2s', cursor: 'pointer' }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={(e) => { e.stopPropagation(); onCheckHouse(house); }} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Check House"><CheckSquare size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(house); }} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px' }} title="View Details"><Eye size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenForm(house); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit2 size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedHouse(house); handleDelete(); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ fontWeight: 600 }}>{house.client}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {house.address || 'No address'}
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                            <Clock size={14} /> {house.timeIn || '08:00'}
                          </div>
                        </td>
                        <td style={s.td}>{getRelationName(services, house.serviceId, 'Services 1')}</td>
                        <td style={s.td}>{getRelationName(teams, house.teamId, 'Team 1')}</td>
                        <td style={s.td} onClick={(e) => e.stopPropagation()}>
                          <StatusPillSelector currentStatusId={house.statusId} statuses={statuses} onChange={(newStatus) => handleQuickStatusChange(house.id, newStatus)} disabled={isSaving} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (EQUIPOS ACTIVOS) */}
        <div style={{ width: '320px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#111827' }}>Active Teams</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teams.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No teams created yet.</p>}
            {teams.map(team => {
              const teamJobs = propertiesWithScope.filter(p => p.teamId === team.id).length;
              return (
                <div key={team.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{team.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{teamJobs} jobs today</div>
                    </div>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: teamJobs > 0 ? '100%' : '0%', backgroundColor: '#3b82f6' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* MODALES BÁSICOS */}
      {isFormModalOpen && (
        <div className="modal-overlay-centered">
          <div className="modal-70" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Formulario</h3>
            <p>Clientes Disponibles: {customersList.length} | Prioridades: {priorities.length}</p>
            
            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', margin: '15px auto', maxWidth: '400px', fontSize: '0.85rem', color: '#64748b', textAlign: 'left' }}>
              <strong style={{ display: 'block', marginBottom: '8px' }}>Estado de Adjuntos (Debug):</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>URLs Antes: {beforePhotoURLs.length}</span>
                <span>URLs Después: {afterPhotoURLs.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Archivos Antes: {beforeFiles.length}</span>
                <span>Archivos Después: {afterFiles.length}</span>
              </div>
              <button 
                onClick={() => { setBeforeFiles([]); setAfterFiles([]); setBeforePhotoURLs([]); setAfterPhotoURLs([]); }} 
                style={{ fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer', width: '100%', background: '#e2e8f0', border: 'none', borderRadius: '4px', color: '#475569' }}
              >
                Limpiar Adjuntos
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => handleCustomerSelect(customersList[0]?.name || '')} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Seleccionar Cliente Test</button>
              <button onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Guardar Cambios</button>
              <button onClick={() => setIsFormModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && (
        <div className="modal-overlay-centered">
          <div className="modal-70" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Detalles</h3>
            <p>Trabajadores totales en sistema: {employees.length}</p>
            <p>¿Asignando trabajador activo?: {isAssigningWorker ? 'Sí' : 'No'}</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => setIsPayrollModalOpen(true)} style={{ padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Ver Payroll</button>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {isPayrollModalOpen && (
        <div className="modal-overlay-centered">
          <div className="modal-70" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Payroll</h3>
            <p>Registros actuales de esta propiedad: {housePayrollRecords.length}</p>
            
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', margin: '15px auto', maxWidth: '300px', fontSize: '0.85rem', color: '#64748b' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>Monto Base: ${payrollForm.baseAmount}</p>
              <button 
                onClick={() => setPayrollForm({...payrollForm, baseAmount: (payrollForm.baseAmount || 0) + 10})} 
                style={{ fontSize: '0.85rem', padding: '6px 12px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', width: '100%' }}
              >
                Sumar $10 al Base
              </button>
            </div>

            <button onClick={() => setIsPayrollModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}