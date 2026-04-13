import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Calendar, User, DollarSign, CheckCircle, Activity, MapPin, 
  X, Home, FileText, CalendarDays, Clock, Wrench, Hash, Flag, Users, StickyNote, PenTool
} from 'lucide-react';
import { payrollService } from '../services/payrollService';
import { propertiesService } from '../services/propertiesService';
import { settingsService } from '../services/settingsService';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PayrollRecord, Property, SystemUser, Status, Team, Priority, Service } from '../types/index';

interface PayrollViewProps {
  onOpenMenu: () => void;
}

const collectionMap: Record<string, string> = {
  team: 'settings_teams',
  priority: 'settings_priorities',
  status: 'settings_statuses',
  service: 'settings_services',
};

// Helper Functions
const getRelationName = (list: any[], idOrName: string, fallback = '-') => {
  if (!idOrName) return fallback;
  const safeVal = String(idOrName).toLowerCase().trim();
  const found = list.find(item => String(item.id).toLowerCase().trim() === safeVal || String(item.name).toLowerCase().trim() === safeVal);
  return found ? found.name : fallback;
};

const getRelationColor = (list: any[], idOrName: string) => {
  if (!idOrName) return undefined;
  const safeVal = String(idOrName).toLowerCase().trim();
  return list.find(item => String(item.id).toLowerCase().trim() === safeVal || String(item.name).toLowerCase().trim() === safeVal)?.color;
};

export default function PayrollView({ onOpenMenu }: PayrollViewProps) {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<SystemUser[]>([]);
  
  // Catálogos para el detalle de la casa
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [payrollData, propsData, usersSnap, statusData, teamData, prioData, servData] = await Promise.all([
          payrollService.getAll(),
          propertiesService.getAll(),
          getDocs(collection(db, 'system_users')),
          settingsService.getAll(collectionMap.status).catch(() => []),
          settingsService.getAll(collectionMap.team).catch(() => []),
          settingsService.getAll(collectionMap.priority).catch(() => []),
          settingsService.getAll(collectionMap.service).catch(() => [])
        ]);
        
        setRecords(payrollData);
        setProperties(propsData);
        setEmployees(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as SystemUser)));
        
        setStatuses((statusData as Status[]).sort((a, b) => Number(a.order) - Number(b.order)));
        setTeams(teamData as Team[]);
        setPriorities(prioData as Priority[]);
        setServices(servData as Service[]);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lógica de Filtros
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (selectedEmployee && record.employeeId !== selectedEmployee) return false;
      if (selectedStatus && (record.status || 'Pending') !== selectedStatus) return false;
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      return true;
    });
  }, [records, startDate, endDate, selectedEmployee, selectedStatus]);

  // Cálculos dinámicos
  const totalPaid = filteredRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPending = filteredRecords.filter(r => r.status !== 'Paid').reduce((sum, r) => sum + r.totalAmount, 0);

  const handleMarkAsPaid = async (id: string) => {
    if (!window.confirm("Mark this record as Paid?")) return;
    try {
      await payrollService.update(id, { status: 'Paid' });
      setRecords(records.map(r => r.id === id ? { ...r, status: 'Paid' } : r));
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status.");
    }
  };

  const handleMarkAsPending = async (id: string) => {
    if (!window.confirm("Change status back to Pending?")) return;
    try {
      await payrollService.update(id, { status: 'Pending' });
      setRecords(records.map(r => r.id === id ? { ...r, status: 'Pending' } : r));
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status.");
    }
  };

  const s = {
    input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, marginBottom: '6px' },
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827', verticalAlign: 'middle' as const },
    
    // Estilos del Modal
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 },
    body: { padding: '30px', overflowY: 'auto', paddingBottom: '60px' } as React.CSSProperties, 
    detailBanner: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', backgroundColor: '#eff6ff', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' } as React.CSSProperties,
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' } as React.CSSProperties,
    detailLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
    detailValue: { fontSize: '1.05rem', color: '#111827', fontWeight: 500, marginTop: '4px', whiteSpace: 'pre-wrap' } as React.CSSProperties,
    noteBoxGray: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%' } as React.CSSProperties,
    noteBoxOrange: { backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #ffedd5', width: '100%' } as React.CSSProperties,
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <style>{`
        .modal-overlay-centered { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; box-sizing: border-box; }
        .modal-70 { background-color: #ffffff; width: 100%; max-width: 1000px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; max-height: 90vh; }
        @media (min-width: 769px) { .modal-70 { width: 70%; } }
        .grid-3-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px; }
        .col-span-full { grid-column: 1 / -1; }
      `}</style>

      {/* HEADER RESPONSIVO ACTUALIZADO */}
      <header className="main-header dashboard-header-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="view-header-title-group">
          <button className="hamburger-btn" onClick={onOpenMenu} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>Payroll & Payments</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Manage employee payments and debts</p>
          </div>
        </div>

        <div className="dashboard-actions-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box-container" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '0 16px', height: '42px', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="#9ca3af" />
            <input type="text" placeholder="Search records..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.9rem', width: '100%', color: '#111827' }} />
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={s.label}>Start Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="date" style={{...s.input, paddingLeft: '36px'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label style={s.label}>End Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="date" style={{...s.input, paddingLeft: '36px'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 250px' }}>
          <label style={s.label}>Employee</label>
          <div style={{ position: 'relative' }}>
            <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <select style={{...s.input, paddingLeft: '36px', cursor: 'pointer'}} value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
              <option value="">All Employees...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </div>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={s.label}>Status</label>
          <div style={{ position: 'relative' }}>
            <Activity size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <select style={{...s.input, paddingLeft: '36px', cursor: 'pointer'}} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses...</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESUMEN FINANCIERO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Total Paid (Filtered)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46' }}>${totalPaid.toFixed(2)}</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ffedd5', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={24} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>Total Pending (Filtered)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400e' }}>${totalPending.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* REGISTROS */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={s.th}>Property</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Employee</th>
              <th style={{...s.th, textAlign: 'right'}}>Total Amount</th>
              <th style={{...s.th, textAlign: 'center'}}>Status</th>
              <th style={{...s.th, textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading payroll data...</td></tr> : 
             filteredRecords.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found for this filter.</td></tr> :
             filteredRecords.map(record => {
               const emp = employees.find(e => e.id === record.employeeId);
               const prop = properties.find(p => p.id === record.propertyId);
               const isPaid = record.status === 'Paid';

               return (
                 <tr 
                   key={record.id} 
                   onClick={() => prop && setSelectedHouse(prop)}
                   style={{ transition: 'background-color 0.2s', cursor: prop ? 'pointer' : 'default' }} 
                   onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                   onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                 >
                   <td style={s.td}>
                     <div style={{ fontWeight: 600, color: '#111827' }}>{prop ? prop.client : 'Unknown'}</div>
                     <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={12} /> {prop ? prop.address : 'Unknown Address'}</div>
                   </td>
                   
                   <td style={s.td}>{record.date}</td>
                   
                   <td style={{...s.td, fontWeight: 600}}>{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}</td>
                   
                   <td style={{...s.td, fontWeight: 700, color: '#111827', textAlign: 'right', fontSize: '1.05rem'}}>${record.totalAmount.toFixed(2)}</td>
                   
                   <td style={{...s.td, textAlign: 'center'}}>
                     <span style={{ 
                       padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                       backgroundColor: isPaid ? '#d1fae5' : '#ffedd5',
                       color: isPaid ? '#047857' : '#b45309'
                     }}>
                       {record.status || 'Pending'}
                     </span>
                   </td>
                   
                   <td style={{...s.td, textAlign: 'right'}}>
                     {isPaid ? (
                       <button onClick={(e) => { e.stopPropagation(); handleMarkAsPending(record.id as string); }} style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Undo</button>
                     ) : (
                       <button onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(record.id as string); }} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Mark Paid</button>
                     )}
                   </td>
                   
                 </tr>
               )
             })
            }
          </tbody>
        </table>
      </div>

      {/* --- MODAL DETALLE DE PROPIEDAD (READ ONLY) --- */}
      {selectedHouse && (
        <div className="modal-overlay-centered" onClick={() => setSelectedHouse(null)}>
          <div className="modal-70" onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Property Overview</h3>
              <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '4px' }} onClick={() => setSelectedHouse(null)}><X size={24} /></button>
            </header>

            <div style={s.body}>
              <div style={s.detailBanner}>
                <div style={s.detailItem}>
                  <span style={{ ...s.detailLabel, color: '#1e40af' }}><Home size={14} /> PROPERTY ADDRESS</span>
                  <span style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 600, marginTop: '4px' }}>{selectedHouse.address}</span>
                </div>
              </div>

              <div className="grid-3-cols">
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Activity size={14} /> STATUS</span>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                      {getRelationName(statuses, selectedHouse.statusId, selectedHouse.statusId)}
                    </span>
                  </div>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><FileText size={14} /> INVOICE STATUS</span>
                  <span style={s.detailValue}>{selectedHouse.invoiceStatus || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><User size={14} /> CLIENT</span>
                  <span style={s.detailValue}>{selectedHouse.client || '-'}</span>
                </div>

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><CalendarDays size={14} /> RECEIVE DATE</span>
                  <span style={s.detailValue}>{selectedHouse.receiveDate || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><CalendarDays size={14} /> SCHEDULE DATE</span>
                  <span style={s.detailValue}>{selectedHouse.scheduleDate || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Wrench size={14} /> SERVICE</span>
                  <span style={s.detailValue}>{getRelationName(services, selectedHouse.serviceId)}</span>
                </div>

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Clock size={14} /> TIME IN</span>
                  <span style={s.detailValue}>{selectedHouse.timeIn || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Clock size={14} /> TIME OUT</span>
                  <span style={s.detailValue}>{selectedHouse.timeOut || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Flag size={14} /> PRIORITY</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {getRelationColor(priorities, selectedHouse.priorityId) && <span style={{ backgroundColor: getRelationColor(priorities, selectedHouse.priorityId), width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{getRelationName(priorities, selectedHouse.priorityId)}</span>
                  </div>
                </div>

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Hash size={14} /> ROOMS</span>
                  <span style={s.detailValue}>{selectedHouse.rooms || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Hash size={14} /> BATHROOMS</span>
                  <span style={s.detailValue}>{selectedHouse.bathrooms || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Users size={14} /> TEAM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {getRelationColor(teams, selectedHouse.teamId) && <span style={{ backgroundColor: getRelationColor(teams, selectedHouse.teamId), width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{getRelationName(teams, selectedHouse.teamId, 'Unassigned')}</span>
                  </div>
                </div>

                <div className="col-span-full" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={s.detailLabel}><User size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}/> ASSIGNED WORKERS</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {!(selectedHouse.assignedWorkers && selectedHouse.assignedWorkers.length > 0) ? (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No workers assigned.</span>
                    ) : (
                      selectedHouse.assignedWorkers.map(workerId => {
                        const emp = employees.find(e => e.id === workerId);
                        if (!emp) return null;
                        return (
                          <div key={workerId} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={12} color="#64748b" />
                            {emp.firstName} {emp.lastName}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="col-span-full"><div style={s.noteBoxGray}><span style={{ ...s.detailLabel, marginBottom: '8px' }}><StickyNote size={14} /> GENERAL NOTE</span><span style={{ ...s.detailValue, fontSize: '0.95rem' }}>{selectedHouse.note || 'No notes.'}</span></div></div>
                <div className="col-span-full"><div style={s.noteBoxOrange}><span style={{ ...s.detailLabel, marginBottom: '8px', color: '#c2410c' }}><PenTool size={14} /> EMPLOYEE'S NOTE</span><span style={{ ...s.detailValue, fontSize: '0.95rem' }}>{selectedHouse.employeeNote || 'No employee notes.'}</span></div></div>

              </div>
            </div>
            
            <footer style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setSelectedHouse(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}