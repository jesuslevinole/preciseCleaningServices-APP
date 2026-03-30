import { useState } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, BedDouble, Maximize, Plus, X, Edit2, Trash2,
  Activity, FileText, CalendarDays, Clock, User, Wrench, Hash, Flag, Users, StickyNote, PenTool, Home, ChevronDown, ClipboardCheck
} from 'lucide-react';
import type { Property, Status, Team, Priority, Service } from '../types';

const mockStatuses: Status[] = [
  { id: '1', order: 1, name: 'PENDING ASSESSMENT', business: 'Regular', color: '#4b5563' },
  { id: '2', order: 2, name: 'NEEDS TO BE SCHEDULE', business: 'Regular', color: '#3b82f6' },
  { id: '3', order: 3, name: 'SCHEDULE PENDING', business: 'Regular', color: '#f97316' },
  { id: '4', order: 4, name: 'IN PROGRESS', business: 'Regular , Cavalry', color: '#a855f7' }
].sort((a, b) => Number(a.order) - Number(b.order));

const mockTeams: Team[] = [
  { id: '1', name: 'Team test', business: '', color: '#f97316' },
  { id: '2', name: 'Team Jesus', business: '', color: '#e5e7eb' },
];

const mockPriorities: Priority[] = [
  { id: '1', name: 'HIGH', business: 'a', color: '#ef4444' },
  { id: '2', name: 'MEDIUM', business: '', color: '#eab308' },
  { id: '3', name: 'LOW', business: '', color: '#22c55e' }
];

const mockServices: Service[] = [
  { id: 's1', name: 'Full', estimatedTime: '', business: '' },
  { id: 's2', name: 'Light', estimatedTime: '120', business: '' }
];

const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.id === value);

  return (
    <div tabIndex={0} onBlur={() => setIsOpen(false)} style={{ position: 'relative', width: '100%', outline: 'none' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', position: 'relative' }}
      >
        <Icon size={16} style={{ position: 'absolute', left: '14px', color: '#6b7280' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selected?.color && <span style={{ backgroundColor: selected.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
          <span style={{ color: selected ? '#111827' : '#9ca3af' }}>{selected ? selected.name : placeholder}</span>
        </div>
        <ChevronDown size={16} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '220px', overflowY: 'auto', marginTop: '4px' }}>
          <div style={{ padding: '12px 14px', cursor: 'pointer', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }} onMouseDown={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}>
            None / Unassigned
          </div>
          {options.map((o: any) => (
            <div 
              key={o.id} 
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
              onMouseDown={(e) => { e.preventDefault(); onChange(o.id); setIsOpen(false); }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {o.color && <span style={{ backgroundColor: o.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 }}></span>}
              <span style={{ color: '#111827', fontWeight: 500 }}>{o.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Se añade onCheckHouse a la interfaz
interface HousesViewProps {
  onOpenMenu: () => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  onCheckHouse: (house: Property) => void;
}

export default function HousesView({ onOpenMenu, properties, setProperties, onCheckHouse }: HousesViewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    mockStatuses.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);

  const [formData, setFormData] = useState<Property>({
    id: '', statusId: '', invoiceStatus: '', receiveDate: '', scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: ''
  });

  const s = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto', boxSizing: 'border-box' } as React.CSSProperties,
    modalWide: { backgroundColor: '#ffffff', width: '100%', maxWidth: '950px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.15rem', fontWeight: 600, color: '#111827', margin: 0 },
    body: { padding: '30px', overflowY: 'auto' } as React.CSSProperties,
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    footerBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    flexRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' } as React.CSSProperties,
    flex1: { flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    flex2: { flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    flexFull: { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    label: { fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' } as React.CSSProperties,
    icon: { position: 'absolute', left: '14px', color: '#6b7280', pointerEvents: 'none' } as React.CSSProperties,
    input: { backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
    btnPrimary: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    btnOutline: { backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
    btnDangerLight: { backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex' },
    detailBanner: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', backgroundColor: '#eff6ff', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' } as React.CSSProperties,
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' } as React.CSSProperties,
    detailLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
    detailValue: { fontSize: '1.05rem', color: '#111827', fontWeight: 500, marginTop: '4px', whiteSpace: 'pre-wrap' } as React.CSSProperties,
    noteBoxGray: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', flex: '1 1 100%' } as React.CSSProperties,
    noteBoxOrange: { backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #ffedd5', flex: '1 1 100%' } as React.CSSProperties
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenForm = (house?: Property) => {
    if (house) {
      setFormData(house);
    } else {
      setFormData({ id: '', statusId: mockStatuses[0]?.id || '', invoiceStatus: 'Pending', receiveDate: new Date().toISOString().split('T')[0], scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: '' });
    }
    setSelectedHouse(house || null);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setSelectedHouse(null);
  };

  const handleSave = () => {
    if (!formData.address) return alert("Address is required.");
    if (!formData.statusId) return alert("Status is required.");

    if (selectedHouse) {
      setProperties(properties.map(p => p.id === selectedHouse.id ? { ...formData } : p));
    } else {
      setProperties([...properties, { ...formData, id: Date.now().toString(), description: `${formData.client} - ${formData.rooms} rooms`, city: 'TBD', size: 'TBD' }]);
    }
    handleCloseForm();
  };

  const handleOpenDetail = (house: Property) => {
    setSelectedHouse(house);
    setIsDetailModalOpen(true);
  };

  const invoiceOptions = [{ id: 'Needs Invoice', name: 'Needs Invoice' }, { id: 'Pending', name: 'Pending' }, { id: 'Paid', name: 'Paid' }];
  const roomOptions = [1,2,3,4,5].map(n => ({ id: String(n), name: String(n) }));

  return (
    <div className="fade-in">
      <header className="main-header">
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 style={{ margin: 0 }}>Houses</h1>
          </div>
          <p style={{ marginTop: '4px', color: '#6b7280' }}>{properties.length} active properties tracked</p>
        </div>
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', height: '42px', transition: 'all 0.2s ease' }}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search properties..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.95rem', width: '250px', color: '#1e293b' }} />
          </div>
          <button className="btn-filter" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', padding: '0 16px', height: '42px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#111827' }}><SlidersHorizontal size={16} /> Filters</button>
          <button className="btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 20px', height: '42px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}><Plus size={18} /> Add House</button>
        </div>
      </header>

      <div className="status-summary-grid">
        {mockStatuses.map(status => {
          const count = properties.filter(p => p.statusId === status.id).length;
          return (
            <div key={`summary-${status.id}`} className="status-summary-card" style={{ borderTopColor: status.color }}>
              <div className="status-summary-title">{status.name}</div>
              <div className="status-summary-count" style={{ color: count > 0 ? '#111827' : '#cbd5e1' }}>{count}</div>
            </div>
          );
        })}
      </div>

      {mockStatuses.map(status => {
        const statusProperties = properties.filter(p => p.statusId === status.id);
        if (statusProperties.length === 0) return null; 
        const isExpanded = expandedSections[status.id];

        return (
          <div key={`section-${status.id}`} className="accordion-section-wrapper" style={{ marginBottom: '32px' }}>
            <div className="accordion-header" onClick={() => toggleSection(status.id)}>
              <button className={`accordion-toggle ${isExpanded ? 'expanded' : ''}`}>V</button>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.05rem' }}>
                <span className="color-dot" style={{ backgroundColor: status.color }}></span>
                {status.order} - {status.name}
              </h2>
              <span className="count-pill" style={{ backgroundColor: status.color + '20', color: status.color }}>{statusProperties.length}</span>
            </div>

            <div className={`cards-grid ${isExpanded ? 'expanded' : 'collapsed'}`}>
              {statusProperties.map((prop) => (
                <div key={prop.id} className={`property-card ${prop.borderColorClass || ''}`} onClick={() => handleOpenDetail(prop)} style={{ cursor: 'pointer', position: 'relative' }}>
                  <div className="card-header">
                    <input type="radio" name="property-select" onClick={(e) => e.stopPropagation()} />
                    {prop.tag && <span className={`tag ${prop.tag.type}`}>{prop.tag.text}</span>}
                  </div>
                  <h3 className="card-address">{prop.address}</h3>
                  <div className="card-pills">
                    <span className="pill"><MapPin size={14} /> {prop.city || 'TBD'}</span>
                    <span className="pill"><BedDouble size={14} /> {prop.rooms || 0} Beds</span>
                    <span className="pill"><Maximize size={14} /> {prop.size || 'TBD'}</span>
                  </div>
                  <p className="card-desc">{prop.description}</p>
                  {prop.bottomNote && <div className="card-bottom-note">{prop.bottomNote}</div>}
                  
                  {/* NUEVO BOTÓN "CHECK" EN LA TARJETA */}
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                     <button 
                       onClick={(e) => { e.stopPropagation(); onCheckHouse(prop); }}
                       style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                     >
                       <ClipboardCheck size={16} /> Check
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {isFormModalOpen && (
        <div style={s.overlay} onClick={handleCloseForm}>
          <div style={s.modalWide} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>{selectedHouse ? 'Edit Property Details' : 'Register New Property'}</h3>
              <button style={s.closeBtn} onClick={handleCloseForm}><X size={20} /></button>
            </header>
            
            <div style={s.body}>
              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Client</label>
                  <div style={s.inputWrapper}>
                    <User style={s.icon} size={16} />
                    <input type="text" style={s.input} placeholder="Type client name..." value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                  </div>
                </div>
                <div style={s.flex2}>
                  <label style={s.label}>Address <span style={{color: '#3b82f6'}}>*</span></label>
                  <div style={s.inputWrapper}>
                    <MapPin style={s.icon} size={16} />
                    <input type="text" style={s.input} placeholder="Enter full address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Status <span style={{color: '#3b82f6'}}>*</span></label>
                  <CustomSelect options={mockStatuses} value={formData.statusId} onChange={(val: string) => setFormData({...formData, statusId: val})} placeholder="Select Status..." icon={Activity} />
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Invoice Status</label>
                  <CustomSelect options={invoiceOptions} value={formData.invoiceStatus} onChange={(val: any) => setFormData({...formData, invoiceStatus: val})} placeholder="Select Invoice Status..." icon={FileText} />
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Services</label>
                  <CustomSelect options={mockServices} value={formData.serviceId} onChange={(val: string) => setFormData({...formData, serviceId: val})} placeholder="Select Service..." icon={Wrench} />
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Receive Date</label>
                  <div style={s.inputWrapper}>
                    <CalendarDays style={s.icon} size={16} />
                    <input type="date" style={s.input} value={formData.receiveDate} onChange={e => setFormData({...formData, receiveDate: e.target.value})} />
                  </div>
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Schedule Date</label>
                  <div style={s.inputWrapper}>
                    <CalendarDays style={s.icon} size={16} />
                    <input type="date" style={s.input} value={formData.scheduleDate} onChange={e => setFormData({...formData, scheduleDate: e.target.value})} />
                  </div>
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Priority</label>
                  <CustomSelect options={mockPriorities} value={formData.priorityId} onChange={(val: string) => setFormData({...formData, priorityId: val})} placeholder="Select Priority..." icon={Flag} />
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Time In</label>
                  <div style={s.inputWrapper}>
                    <Clock style={s.icon} size={16} />
                    <input type="time" style={s.input} value={formData.timeIn} onChange={e => setFormData({...formData, timeIn: e.target.value})} />
                  </div>
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Time Out</label>
                  <div style={s.inputWrapper}>
                    <Clock style={s.icon} size={16} />
                    <input type="time" style={s.input} value={formData.timeOut} onChange={e => setFormData({...formData, timeOut: e.target.value})} />
                  </div>
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Team</label>
                  <CustomSelect options={mockTeams} value={formData.teamId} onChange={(val: string) => setFormData({...formData, teamId: val})} placeholder="Assign Team..." icon={Users} />
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Rooms</label>
                  <CustomSelect options={roomOptions} value={formData.rooms} onChange={(val: string) => setFormData({...formData, rooms: val})} placeholder="Rooms..." icon={Hash} />
                </div>
                <div style={s.flex1}>
                  <label style={s.label}>Bathrooms</label>
                  <CustomSelect options={roomOptions} value={formData.bathrooms} onChange={(val: string) => setFormData({...formData, bathrooms: val})} placeholder="Bathrooms..." icon={Hash} />
                </div>
                <div style={s.flex1}></div> 
              </div>

              <div style={s.flexRow}>
                <div style={s.flexFull}>
                  <label style={s.label}>Note</label>
                  <div style={{...s.inputWrapper, alignItems: 'flex-start'}}>
                    <StickyNote style={{...s.icon, top: '14px'}} size={16} />
                    <textarea style={{...s.input, minHeight: '80px', resize: 'vertical'}} placeholder="General instructions or notes..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                  </div>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flexFull}>
                  <label style={s.label}>Employee's Note</label>
                  <div style={{...s.inputWrapper, alignItems: 'flex-start'}}>
                    <PenTool style={{...s.icon, top: '14px'}} size={16} />
                    <textarea style={{...s.input, minHeight: '80px', resize: 'vertical'}} placeholder="Employee performance notes..." value={formData.employeeNote} onChange={e => setFormData({...formData, employeeNote: e.target.value})}></textarea>
                  </div>
                </div>
              </div>

            </div>
            
            <footer style={s.footer}>
              <button style={s.btnOutline} onClick={handleCloseForm}>Cancel</button>
              <button style={s.btnPrimary} onClick={handleSave}>Save Property</button>
            </footer>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedHouse && (
        <div style={s.overlay} onClick={() => setIsDetailModalOpen(false)}>
          <div style={s.modalWide} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Property Overview</h3>
              <button style={s.closeBtn} onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            
            <div style={s.body}>
              <div style={s.detailBanner}>
                <div style={{...s.detailItem, flex: '1 1 100%'}}>
                  <span style={{...s.detailLabel, color: '#1e40af'}}><Home size={14} /> PROPERTY ADDRESS</span>
                  <span style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 600, marginTop: '4px' }}>{selectedHouse.address}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Activity size={14} /> STATUS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: mockStatuses.find(st => st.id === selectedHouse.statusId)?.color || '#ccc', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span style={s.detailValue}>{mockStatuses.find(st => st.id === selectedHouse.statusId)?.name || 'UNASSIGNED'}</span>
                  </div>
                </div>
                <div style={s.detailItem}><span style={s.detailLabel}><FileText size={14} /> INVOICE STATUS</span><span style={s.detailValue}>{selectedHouse.invoiceStatus || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><User size={14} /> CLIENT</span><span style={s.detailValue}>{selectedHouse.client || '-'}</span></div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}><span style={s.detailLabel}><CalendarDays size={14} /> RECEIVE DATE</span><span style={s.detailValue}>{selectedHouse.receiveDate || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><CalendarDays size={14} /> SCHEDULE DATE</span><span style={s.detailValue}>{selectedHouse.scheduleDate || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><Wrench size={14} /> SERVICE</span><span style={s.detailValue}>{mockServices.find(srv => srv.id === selectedHouse.serviceId)?.name || '-'}</span></div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}><span style={s.detailLabel}><Clock size={14} /> TIME IN</span><span style={s.detailValue}>{selectedHouse.timeIn || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><Clock size={14} /> TIME OUT</span><span style={s.detailValue}>{selectedHouse.timeOut || '-'}</span></div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Flag size={14} /> PRIORITY</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color && <span style={{ backgroundColor: mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{mockPriorities.find(p => p.id === selectedHouse.priorityId)?.name || '-'}</span>
                  </div>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}><span style={s.detailLabel}><Hash size={14} /> ROOMS</span><span style={s.detailValue}>{selectedHouse.rooms || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><Hash size={14} /> BATHROOMS</span><span style={s.detailValue}>{selectedHouse.bathrooms || '-'}</span></div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Users size={14} /> TEAM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {mockTeams.find(t => t.id === selectedHouse.teamId)?.color && <span style={{ backgroundColor: mockTeams.find(t => t.id === selectedHouse.teamId)?.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{mockTeams.find(t => t.id === selectedHouse.teamId)?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
                
              <div style={s.flexRow}>
                <div style={s.noteBoxGray}>
                  <span style={{...s.detailLabel, marginBottom: '8px'}}><StickyNote size={14} /> GENERAL NOTE</span>
                  <span style={{...s.detailValue, fontSize: '0.95rem'}}>{selectedHouse.note || 'No notes provided.'}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.noteBoxOrange}>
                  <span style={{...s.detailLabel, marginBottom: '8px', color: '#c2410c'}}><PenTool size={14} /> EMPLOYEE'S NOTE</span>
                  <span style={{...s.detailValue, fontSize: '0.95rem'}}>{selectedHouse.employeeNote || 'No employee notes provided.'}</span>
                </div>
              </div>

            </div>
            
            <footer style={s.footerBetween}>
              <button style={s.btnDangerLight} onClick={() => {
                setProperties(properties.filter(p => p.id !== selectedHouse.id));
                setIsDetailModalOpen(false);
              }}>
                <Trash2 size={16} style={{ marginRight: '6px' }} /> Delete Property
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={s.btnOutline} onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button style={s.btnPrimary} onClick={() => handleOpenForm(selectedHouse)}><Edit2 size={16} /> Edit Details</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}