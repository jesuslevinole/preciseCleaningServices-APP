import { useState } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, BedDouble, Maximize, Plus, X, Edit2, Trash2,
  Activity, FileText, CalendarDays, Clock, User, Wrench, Hash, Flag, Users, StickyNote, PenTool, Home, ChevronDown
} from 'lucide-react';
import type { Property, Status, Team, Priority, Service } from '../types';

// --- Mocks Relacionales ---
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

// --- 7 REGISTROS DE PRUEBA ---
const initialProperties: Property[] = [
  { 
    id: '1', address: '1405 Fairbanks St, Copperas Cove, TX', city: 'Copperas Cove', rooms: '3', bathrooms: '2', size: 'Full', description: 'Janina A. 3bds Estimate', bottomNote: '$120 - $220 Code: 0285',
    statusId: '1', invoiceStatus: 'Needs Invoice', receiveDate: '2026-03-01', scheduleDate: '', client: 'Janina A.', note: '', employeeNote: '', serviceId: 's1', priorityId: '2', teamId: '', timeIn: '', timeOut: ''
  },
  { 
    id: '2', address: '2501 Bacon Ranch Rd, Killeen, TX', city: 'Killeen', rooms: '1', bathrooms: '1', size: 'Full', description: 'CMA. Full. 1bds Apt 517 (AM)', tag: { text: 'TEAM 2', type: 'team' },
    statusId: '4', invoiceStatus: 'Paid', receiveDate: '2026-03-05', scheduleDate: '2026-03-06', client: 'CMA', note: 'Call before arriving', employeeNote: '', serviceId: 's1', priorityId: '1', teamId: '2', timeIn: '08:00', timeOut: '12:00'
  },
  {
    id: '3', address: '3402 S W S Young Dr, Killeen, TX', city: 'Killeen', rooms: '4', bathrooms: '2', size: 'Heavy', description: 'Linnemann. Heavy Clean.', tag: { text: 'PREPAID', type: 'prepaid' }, borderColorClass: 'border-red', bottomNote: '*PREPAID Mia*',
    statusId: '2', invoiceStatus: 'Pending', receiveDate: '2026-03-10', scheduleDate: '', client: 'Linnemann', note: 'Key under the mat', employeeNote: '', serviceId: 's2', priorityId: '1', teamId: '', timeIn: '', timeOut: ''
  },
  {
    id: '4', address: '1110 Indian Trail, Harker Heights, TX', city: 'Harker Heights', rooms: '2', bathrooms: '1', size: 'Medium', description: 'Impact Communities Move-out',
    statusId: '3', invoiceStatus: '', receiveDate: '2026-03-11', scheduleDate: '2026-03-15', client: 'Impact Communities', note: '', employeeNote: '', serviceId: 's1', priorityId: '2', teamId: '1', timeIn: '09:00', timeOut: '13:00'
  },
  {
    id: '5', address: '2607 Green Giant Dr, Harker Heights, TX', city: 'Harker Heights', rooms: '5', bathrooms: '3', size: 'Full', description: 'David Private. Deep Clean.', tag: { text: 'TEAM 1', type: 'team' },
    statusId: '4', invoiceStatus: 'Needs Invoice', receiveDate: '2026-03-12', scheduleDate: '2026-03-13', client: 'David (Green Giant)', note: 'Only Clean from Living room to Kitchen', employeeNote: 'Watch out for the dog', serviceId: 's1', priorityId: '1', teamId: '1', timeIn: '07:30', timeOut: '15:00'
  },
  {
    id: '6', address: '903 Mclintock Cove, Killeen, TX', city: 'Killeen', rooms: '2', bathrooms: '2', size: 'Light', description: 'Airbnb Turnover',
    statusId: '1', invoiceStatus: 'Paid', receiveDate: '2026-03-13', scheduleDate: '', client: 'Shaneque Frett', note: 'Guest leaving at 11 AM', employeeNote: '', serviceId: 's2', priorityId: '3', teamId: '', timeIn: '', timeOut: ''
  },
  {
    id: '7', address: '401 S Twin Creek Dr, Killeen, TX', city: 'Killeen', rooms: '2', bathrooms: '1', size: 'Medium', description: 'Twin Creek. Unit 3A',
    statusId: '2', invoiceStatus: 'Needs Invoice', receiveDate: '2026-03-13', scheduleDate: '', client: 'Twin Creek', note: '', employeeNote: '', serviceId: 's1', priorityId: '2', teamId: '', timeIn: '', timeOut: ''
  }
];

// --- Componente Dropdown Elegante 100% BLINDADO (Fuerza color oscuro para el texto) ---
const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.id === value);

  return (
    <div className="custom-select-wrapper" tabIndex={0} onBlur={() => setIsOpen(false)} style={{ position: 'relative', width: '100%', outline: 'none' }}>
      <div 
        className="white-input" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', paddingLeft: '40px', position: 'relative' }}
      >
        <Icon size={16} style={{ position: 'absolute', left: '14px', color: '#6b7280' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selected?.color && <span className="color-dot" style={{ backgroundColor: selected.color }}></span>}
          <span style={{ color: selected ? '#111827' : '#9ca3af' }}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        
        <ChevronDown size={16} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '220px', overflowY: 'auto', marginTop: '4px' }}>
          <div 
            style={{ padding: '12px 14px', cursor: 'pointer', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}
            onMouseDown={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
          >
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
              {o.color && <span className="color-dot" style={{ backgroundColor: o.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 }}></span>}
              <span style={{ color: '#111827', fontWeight: 500 }}>{o.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function HousesView() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  
  // Acordeones abiertos por defecto
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    mockStatuses.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);

  const [formData, setFormData] = useState<Property>({
    id: '', statusId: '', invoiceStatus: '', receiveDate: '', scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: ''
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenForm = (house?: Property) => {
    if (house) {
      setFormData(house);
    } else {
      setFormData({
        id: '', statusId: mockStatuses[0]?.id || '', invoiceStatus: 'Pending', receiveDate: new Date().toISOString().split('T')[0], scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: ''
      });
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
          <h1>Houses</h1>
          <p>{properties.length} active properties tracked</p>
        </div>
        <div className="header-actions">
          
          {/* BUSCADOR BLINDADO GRIS CLARO ELEGANTE */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', height: '42px', transition: 'all 0.2s ease' }}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search properties..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.95rem', width: '250px', color: '#1e293b' }} />
          </div>

          <button className="btn-filter"><SlidersHorizontal size={16} /> Filters</button>
          <button className="btn-primary" onClick={() => handleOpenForm()}><Plus size={18} /> Add House</button>
        </div>
      </header>

      {/* TARJETAS SUPERIORES ELEGANTES */}
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

      {/* LISTAS AGRUPADAS POR STATUS CON MAYOR SEPARACIÓN */}
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
              <span className="count-pill" style={{ backgroundColor: status.color + '20', color: status.color }}>
                {statusProperties.length}
              </span>
            </div>

            <div className={`cards-grid ${isExpanded ? 'expanded' : 'collapsed'}`}>
              {statusProperties.map((prop) => (
                <div key={prop.id} className={`property-card ${prop.borderColorClass || ''}`} onClick={() => handleOpenDetail(prop)} style={{ cursor: 'pointer' }}>
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
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* --- MODAL DE FORMULARIO PREMIUM (3 COLUMNAS) --- */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content modal-extra-wide" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{selectedHouse ? 'Edit Property Details' : 'Register New Property'}</h3>
              <button className="btn-icon close" onClick={handleCloseForm}><X size={20} /></button>
            </header>
            
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px' }}>
              <div className="form-grid-3">
                
                {/* ROW 1: Client & Address juntos arriba */}
                <div className="form-group">
                  <label>Client</label>
                  <div className="input-icon-wrapper">
                    <User className="input-icon" size={16} />
                    <input type="text" className="white-input with-icon" placeholder="Type client name..." value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                  </div>
                </div>

                <div className="form-group col-span-2">
                  <label>Address <span className="required">*</span></label>
                  <div className="input-icon-wrapper">
                    <MapPin className="input-icon" size={16} />
                    <input type="text" className="white-input with-icon" placeholder="Enter full address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                {/* ROW 2: Statuses & Service */}
                <div className="form-group">
                  <label>Status <span className="required">*</span></label>
                  <CustomSelect options={mockStatuses} value={formData.statusId} onChange={(val: string) => setFormData({...formData, statusId: val})} placeholder="Select Status..." icon={Activity} />
                </div>

                <div className="form-group">
                  <label>Invoice Status</label>
                  <CustomSelect options={invoiceOptions} value={formData.invoiceStatus} onChange={(val: any) => setFormData({...formData, invoiceStatus: val})} placeholder="Select Invoice Status..." icon={FileText} />
                </div>

                <div className="form-group">
                  <label>Services</label>
                  <CustomSelect options={mockServices} value={formData.serviceId} onChange={(val: string) => setFormData({...formData, serviceId: val})} placeholder="Select Service..." icon={Wrench} />
                </div>

                {/* ROW 3: Dates & Priority */}
                <div className="form-group">
                  <label>Receive Date</label>
                  <div className="input-icon-wrapper">
                    <CalendarDays className="input-icon" size={16} />
                    <input type="date" className="white-input with-icon" value={formData.receiveDate} onChange={e => setFormData({...formData, receiveDate: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Schedule Date</label>
                  <div className="input-icon-wrapper">
                    <CalendarDays className="input-icon" size={16} />
                    <input type="date" className="white-input with-icon" value={formData.scheduleDate} onChange={e => setFormData({...formData, scheduleDate: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <CustomSelect options={mockPriorities} value={formData.priorityId} onChange={(val: string) => setFormData({...formData, priorityId: val})} placeholder="Select Priority..." icon={Flag} />
                </div>

                {/* ROW 4: Times & Team */}
                <div className="form-group">
                  <label>Time In</label>
                  <div className="input-icon-wrapper">
                    <Clock className="input-icon" size={16} />
                    <input type="time" className="white-input with-icon" value={formData.timeIn} onChange={e => setFormData({...formData, timeIn: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Out</label>
                  <div className="input-icon-wrapper">
                    <Clock className="input-icon" size={16} />
                    <input type="time" className="white-input with-icon" value={formData.timeOut} onChange={e => setFormData({...formData, timeOut: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Team</label>
                  <CustomSelect options={mockTeams} value={formData.teamId} onChange={(val: string) => setFormData({...formData, teamId: val})} placeholder="Assign Team..." icon={Users} />
                </div>

                {/* ROW 5: Rooms & Bathrooms */}
                <div className="form-group">
                  <label>Rooms</label>
                  <CustomSelect options={roomOptions} value={formData.rooms} onChange={(val: string) => setFormData({...formData, rooms: val})} placeholder="Rooms..." icon={Hash} />
                </div>

                <div className="form-group">
                  <label>Bathrooms</label>
                  <CustomSelect options={roomOptions} value={formData.bathrooms} onChange={(val: string) => setFormData({...formData, bathrooms: val})} placeholder="Bathrooms..." icon={Hash} />
                </div>
                
                <div></div> 

                {/* ROW 6 & 7 (FULL WIDTH NOTES) */}
                <div className="form-group col-span-3">
                  <label>Note</label>
                  <div className="input-icon-wrapper" style={{ alignItems: 'flex-start' }}>
                    <StickyNote className="input-icon" size={16} style={{ top: '14px' }} />
                    <textarea className="white-input with-icon" placeholder="General instructions or notes..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                  </div>
                </div>

                <div className="form-group col-span-3">
                  <label>Employee's Note</label>
                  <div className="input-icon-wrapper" style={{ alignItems: 'flex-start' }}>
                    <PenTool className="input-icon" size={16} style={{ top: '14px' }} />
                    <textarea className="white-input with-icon" placeholder="Employee performance notes..." value={formData.employeeNote} onChange={e => setFormData({...formData, employeeNote: e.target.value})}></textarea>
                  </div>
                </div>

              </div>
            </div>
            
            <footer className="modal-footer" style={{ padding: '20px 30px' }}>
              <button className="btn-outline" onClick={handleCloseForm}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save Property</button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES PREMIUM --- */}
      {isDetailModalOpen && selectedHouse && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content modal-extra-wide" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Property Overview</h3>
              <button className="btn-icon close" onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            
            <div className="modal-body detail-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px' }}>
              
              <div className="detail-info-card" style={{ marginBottom: '24px', gridTemplateColumns: '1fr', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <div className="detail-item">
                  <span className="detail-label-with-icon" style={{ color: '#1e40af' }}><Home size={14} /> PROPERTY ADDRESS</span>
                  <span className="detail-value" style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: '500' }}>{selectedHouse.address}</span>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Activity size={14} /> STATUS</span>
                  <div className="selected-value-content mt-4">
                    <span className="color-dot" style={{ backgroundColor: mockStatuses.find(s => s.id === selectedHouse.statusId)?.color || '#ccc' }}></span>
                    <span className="detail-value" style={{ fontWeight: '500' }}>
                      {mockStatuses.find(s => s.id === selectedHouse.statusId)?.name || 'UNASSIGNED'}
                    </span>
                  </div>
                </div>
                
                <div className="detail-item"><span className="detail-label-with-icon"><FileText size={14} /> INVOICE STATUS</span><span className="detail-value mt-4">{selectedHouse.invoiceStatus || '-'}</span></div>
                <div className="detail-item"><span className="detail-label-with-icon"><User size={14} /> CLIENT</span><span className="detail-value mt-4">{selectedHouse.client || '-'}</span></div>
                
                <div className="detail-item"><span className="detail-label-with-icon"><CalendarDays size={14} /> RECEIVE DATE</span><span className="detail-value mt-4">{selectedHouse.receiveDate || '-'}</span></div>
                <div className="detail-item"><span className="detail-label-with-icon"><CalendarDays size={14} /> SCHEDULE DATE</span><span className="detail-value mt-4">{selectedHouse.scheduleDate || '-'}</span></div>
                <div className="detail-item"><span className="detail-label-with-icon"><Wrench size={14} /> SERVICE</span><span className="detail-value mt-4">{mockServices.find(s => s.id === selectedHouse.serviceId)?.name || '-'}</span></div>
                
                <div className="detail-item"><span className="detail-label-with-icon"><Clock size={14} /> TIME IN</span><span className="detail-value mt-4">{selectedHouse.timeIn || '-'}</span></div>
                <div className="detail-item"><span className="detail-label-with-icon"><Clock size={14} /> TIME OUT</span><span className="detail-value mt-4">{selectedHouse.timeOut || '-'}</span></div>
                
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Flag size={14} /> PRIORITY</span>
                  <div className="selected-value-content mt-4">
                    {mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color && <span className="color-dot" style={{ backgroundColor: mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color }}></span>}
                    <span className="detail-value">{mockPriorities.find(p => p.id === selectedHouse.priorityId)?.name || '-'}</span>
                  </div>
                </div>

                <div className="detail-item"><span className="detail-label-with-icon"><Hash size={14} /> ROOMS</span><span className="detail-value mt-4">{selectedHouse.rooms || '-'}</span></div>
                <div className="detail-item"><span className="detail-label-with-icon"><Hash size={14} /> BATHROOMS</span><span className="detail-value mt-4">{selectedHouse.bathrooms || '-'}</span></div>
                
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Users size={14} /> TEAM</span>
                  <div className="selected-value-content mt-4">
                    {mockTeams.find(t => t.id === selectedHouse.teamId)?.color && <span className="color-dot" style={{ backgroundColor: mockTeams.find(t => t.id === selectedHouse.teamId)?.color }}></span>}
                    <span className="detail-value">{mockTeams.find(t => t.id === selectedHouse.teamId)?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="detail-item col-span-3 mt-16" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <span className="detail-label-with-icon mb-16"><StickyNote size={14} /> GENERAL NOTE</span>
                  <span className="detail-value" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{selectedHouse.note || 'No notes provided.'}</span>
                </div>

                <div className="detail-item col-span-3" style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                  <span className="detail-label-with-icon mb-16" style={{ color: '#c2410c' }}><PenTool size={14} /> EMPLOYEE'S NOTE</span>
                  <span className="detail-value" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{selectedHouse.employeeNote || 'No employee notes provided.'}</span>
                </div>

              </div>
            </div>
            
            <footer className="modal-footer footer-layout-custom" style={{ padding: '20px 30px' }}>
              <button className="btn-danger-light" onClick={() => {
                setProperties(properties.filter(p => p.id !== selectedHouse.id));
                setIsDetailModalOpen(false);
              }}>
                <Trash2 size={16} style={{ marginRight: '6px' }} /> Delete Property
              </button>
              <div className="footer-right-group">
                <button className="btn-text" onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button className="btn-primary" onClick={() => handleOpenForm(selectedHouse)}><Edit2 size={16} /> Edit Details</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}