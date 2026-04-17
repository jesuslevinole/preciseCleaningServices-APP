import { useState, useEffect } from 'react';
import { 
  Search, Calendar, ChevronDown, MapPin, Users, FileText, StickyNote, CalendarDays 
} from 'lucide-react';

import type { Property, Status, Team, SystemUser, Role } from '../types/index';
import { propertiesService } from '../services/propertiesService';
import { settingsService } from '../services/settingsService';

const collectionMap = {
  team: 'settings_teams',
  status: 'settings_statuses',
};

// --- INLINE INVOICE STATUS PILL SELECTOR ---
const InvoiceStatusPillSelector = ({ currentStatus, onChange, disabled }: { currentStatus: string, onChange: (status: string) => void, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = currentStatus || 'Needs Invoice';
  
  const options = [
    { id: 'Needs Invoice', color: '#ef4444' },
    { id: 'Pending', color: '#f59e0b' },
    { id: 'Paid', color: '#10b981' }
  ];

  const currentOpt = options.find(o => o.id === safeValue) || options[0];

  return (
    <div tabIndex={0} onBlur={() => setTimeout(() => setIsOpen(false), 200)} style={{ position: 'relative', display: 'inline-block', outline: 'none' }}>
      <div 
        onClick={(e) => { e.stopPropagation(); if(!disabled) setIsOpen(!isOpen); }}
        style={{ 
          backgroundColor: `${currentOpt.color}15`, color: currentOpt.color, padding: '6px 12px', borderRadius: '20px', 
          fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer', border: `1px solid ${currentOpt.color}50`, transition: 'all 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentOpt.color }}></span>
        {currentOpt.id}
        <ChevronDown size={14} color={currentOpt.color} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 9999, minWidth: '160px', overflow: 'hidden', textAlign: 'left' }}>
          {options.map((opt) => (
            <div 
              key={opt.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(opt.id !== safeValue) onChange(opt.id); setIsOpen(false); }}
              style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: safeValue === opt.id ? '#f8fafc' : 'transparent', borderBottom: '1px solid #f1f5f9' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = safeValue === opt.id ? '#f8fafc' : 'transparent'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: opt.color, flexShrink: 0 }}></span>
              {opt.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface InvoicesViewProps {
  onOpenMenu: () => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  currentUser?: SystemUser | null;
  activeRole?: Role | null;
  isSuperAdmin?: boolean;
}

export default function InvoicesView({ onOpenMenu, properties, setProperties, currentUser, activeRole, isSuperAdmin }: InvoicesViewProps) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // FILTERS
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');

  const canEdit = isSuperAdmin || activeRole?.permissions?.find(p => p.module === 'Houses')?.canEdit;

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [statusData, teamData, propsData] = await Promise.all([
          settingsService.getAll(collectionMap.status).catch(() => []),
          settingsService.getAll(collectionMap.team).catch(() => []),
          properties.length === 0 ? propertiesService.getAll().catch(() => []) : Promise.resolve([])
        ]);

        setStatuses(statusData as Status[]);
        setTeams(teamData as Team[]);
        
        if (properties.length === 0 && propsData.length > 0) {
           setProperties(propsData as Property[]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false); 
      }
    };
    fetchAllData();
  }, []);

  const housePermission = activeRole?.permissions?.find(p => p.module === 'Houses');
  const userScope = isSuperAdmin ? 'All' : (housePermission?.scope || 'Own');
  
  const propertiesWithScope = properties.filter(prop => {
    if (userScope === 'All') return true;
    if (!currentUser) return false;
    const isAssigned = prop.assignedWorkers?.includes(currentUser.id);
    const isSameTeam = currentUser.teamId && (prop.teamId === currentUser.teamId);
    return isAssigned || isSameTeam;
  });

  // FILTRADO PRINCIPAL: Solo las propiedades cuyo Estatus sea "Invoice"
  const invoiceProperties = propertiesWithScope.filter(p => {
    const st = statuses.find(s => s.id === p.statusId || s.name === p.statusId);
    const isInvoiceStatus = st?.name?.toLowerCase() === 'invoice' || p.statusId?.toLowerCase() === 'invoice';
    if (!isInvoiceStatus) return false;

    // Filtros adicionales del usuario (Con protección contra errores de undefined)
    if (invoiceStatusFilter !== 'All' && (p.invoiceStatus || 'Needs Invoice') !== invoiceStatusFilter) return false;
    if (clientSearch && !(p.client || '').toLowerCase().includes(clientSearch.toLowerCase())) return false;
    if (startDate && p.scheduleDate < startDate) return false;
    if (endDate && p.scheduleDate > endDate) return false;

    return true;
  });

  const handleInvoiceStatusChange = async (propertyId: string, newStatus: string) => {
    setIsSaving(true);
    try {
      await propertiesService.update(propertyId, { invoiceStatus: newStatus } as any);
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, invoiceStatus: newStatus } : p));
    } catch (error) {
      console.error("Error updating invoice status:", error);
      alert("Failed to update invoice status.");
    } finally {
      setIsSaving(false);
    }
  };

  const s = {
    input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, marginBottom: '6px' },
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827', verticalAlign: 'top' as const },
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <style>{`
        .view-header-title-group { display: flex; align-items: center; gap: 16px; }
        .hamburger-btn { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; cursor: pointer; color: #111827; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .hamburger-btn:hover { background-color: #f8fafc; }
        
        .td-content { display: flex; flex-direction: column; gap: 4px; }

        @media (max-width: 768px) {
          .view-header-title-group { flex-direction: row-reverse; justify-content: space-between; width: 100%; }
          .responsive-table thead { display: none; }
          .responsive-table tr { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px; padding: 16px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .responsive-table td { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; }
          .responsive-table td:last-child { border-bottom: none; padding-bottom: 0; }
          .responsive-table td::before { content: attr(data-label); font-weight: 700; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; padding-right: 15px; white-space: nowrap; }
          .responsive-table td .td-content { text-align: right; max-width: 65%; word-break: break-word; align-items: flex-end; }
          .actions-cell { justify-content: flex-end !important; width: 100%; flex-direction: row !important;}
        }
      `}</style>

      {/* HEADER */}
      <header className="main-header dashboard-header-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="view-header-title-group">
          <button className="hamburger-btn" onClick={onOpenMenu} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>Invoices</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Finished jobs ready for billing</p>
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label style={s.label}>Start Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="date" style={{...s.input, paddingLeft: '36px'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={s.label}>End Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="date" style={{...s.input, paddingLeft: '36px'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 250px' }}>
          <label style={s.label}>Client Name</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="text" placeholder="Search by client..." style={{...s.input, paddingLeft: '36px'}} value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={s.label}>Invoice Status</label>
          <div style={{ position: 'relative' }}>
            <FileText size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <select style={{...s.input, paddingLeft: '36px', cursor: 'pointer'}} value={invoiceStatusFilter} onChange={e => setInvoiceStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Needs Invoice">Needs Invoice</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA DE INVOICES */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={s.th}>Address</th>
              <th style={s.th}>Client</th>
              <th style={s.th}>Note</th>
              <th style={s.th}>Schedule Date</th>
              <th style={s.th}>Team</th>
              <th style={{...s.th, textAlign: 'right'}}>Invoice Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading invoices...</td></tr>
            ) : invoiceProperties.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No completed jobs found for invoicing.</td></tr>
            ) : (
              invoiceProperties.map(prop => {
                const teamObj = teams.find(t => t.id === prop.teamId);
                const teamName = teamObj ? teamObj.name : 'Unassigned';

                return (
                  <tr key={prop.id} style={{ transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td data-label="Address" style={s.td}>
                      <div className="td-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><MapPin size={14} color="#64748b"/> {prop.address}</div>
                      </div>
                    </td>
                    <td data-label="Client" style={s.td}>
                      <div className="td-content">
                        <div style={{ fontWeight: 600, color: '#111827' }}>{prop.client}</div>
                      </div>
                    </td>
                    <td data-label="Note" style={{...s.td, color: '#64748b', fontSize: '0.85rem', maxWidth: '250px'}}>
                      <div className="td-content">
                        {prop.note ? (
                           <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                             <StickyNote size={14} style={{flexShrink: 0, marginTop: '2px'}}/>
                             <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prop.note}</span>
                           </div>
                        ) : '-'}
                      </div>
                    </td>
                    <td data-label="Schedule Date" style={s.td}>
                      <div className="td-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={14} color="#64748b"/> {prop.scheduleDate || '-'}</div>
                      </div>
                    </td>
                    <td data-label="Team" style={s.td}>
                      <div className="td-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Users size={14} color="#64748b"/> {teamName}
                        </div>
                      </div>
                    </td>
                    <td data-label="Invoice Status" style={{...s.td, textAlign: 'right'}}>
                      <div className="td-content actions-cell">
                        <InvoiceStatusPillSelector 
                          currentStatus={prop.invoiceStatus || 'Needs Invoice'} 
                          onChange={(newStatus) => handleInvoiceStatusChange(prop.id, newStatus)} 
                          disabled={isSaving || !canEdit}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}