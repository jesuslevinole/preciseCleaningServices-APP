import { useState } from 'react';
import { 
  Search, SlidersHorizontal, Plus, Edit2, Trash2, X,
  User, Briefcase, Building, Mail, MapPin, Map, StickyNote, Palette
} from 'lucide-react';
import type { Customer } from '../types';

// Datos de prueba
const initialCustomers: Customer[] = [
  { id: '1', color: '#ef4444', type: 'Property manager', name: 'Linnemann', business: 'Regular', note: '', address: '3402 S W S Young Dr', cityStateZip: 'Killeen, Texas 76542', email: 'linnemann@example.com' },
  { id: '2', color: '#a855f7', type: 'Property manager', name: 'Isbell Rentals', business: 'Regular', note: '', address: '1200 E Stan Schlueter Loop', cityStateZip: 'Killeen, Texas 76542', email: '' },
  { id: '3', color: '#f97316', type: 'Property manager', name: 'Impact Communities', business: 'Regular', note: '', address: '1110 Indian Trail', cityStateZip: 'Harker Heights, TX 76548', email: 'tx.indianmhpteam@...' },
  { id: '4', color: '#e5e7eb', type: 'Private customer', name: 'David (Green Giant) Private', business: 'Regular', note: 'Only Clean from Living room to...', address: '2607 Green Giant Dr', cityStateZip: 'Harker Heights, TX 76548', email: '' },
  { id: '5', color: '#e5e7eb', type: 'Private customer', name: 'Shaneque Frett Private', business: 'Regular', note: 'Airbnb Customer', address: '903 Mclintock Cove', cityStateZip: 'Killeen, TX', email: 'shanequeeddy@gmail.com' }
];

interface CustomersViewProps {
  onOpenMenu: () => void;
}

export default function CustomersView({ onOpenMenu }: CustomersViewProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Customer>({
    id: '', color: '#e5e7eb', type: 'Property manager', name: '', business: 'Regular', note: '', address: '', cityStateZip: '', email: ''
  });

  // --- ESTILOS BLINDADOS (TABLA) ---
  const thStyle = { backgroundColor: '#f9fafb', padding: '6px 12px', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', textAlign: 'left' as const };
  const tdStyle = { padding: '6px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '0.95rem' };

  // --- ESTILOS BLINDADOS (MODALES Y FORMULARIOS) ---
  const s = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto', boxSizing: 'border-box' } as React.CSSProperties,
    modalWide: { backgroundColor: '#ffffff', width: '100%', maxWidth: '950px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    modalSmall: { backgroundColor: '#ffffff', width: '100%', maxWidth: '450px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.15rem', fontWeight: 600, color: '#111827', margin: 0 },
    body: { padding: '30px', overflowY: 'auto' } as React.CSSProperties,
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    footerBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    
    // Formularios
    flexRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' } as React.CSSProperties,
    flex1: { flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    flex2: { flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    flexFull: { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    
    label: { fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' } as React.CSSProperties,
    icon: { position: 'absolute', left: '14px', color: '#6b7280', pointerEvents: 'none' } as React.CSSProperties,
    input: { backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
    
    // Botones
    btnPrimary: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    btnOutline: { backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
    btnDanger: { backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex' },
    
    // Detalles
    detailBanner: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', backgroundColor: '#eff6ff', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' } as React.CSSProperties,
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' } as React.CSSProperties,
    detailLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
    detailValue: { fontSize: '1.05rem', color: '#111827', fontWeight: 500, marginTop: '4px', whiteSpace: 'pre-wrap' } as React.CSSProperties,
    noteBox: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', flex: '1 1 100%' } as React.CSSProperties
  };

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData(customer);
    } else {
      setSelectedCustomer(null);
      setFormData({ id: '', color: '#e5e7eb', type: 'Property manager', name: '', business: 'Regular', note: '', address: '', cityStateZip: '', email: '' });
    }
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSave = () => {
    if (formData.name.trim() === '') return alert('Customer Name is required.');
    if (selectedCustomer) {
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...formData } : c));
    } else {
      setCustomers([...customers, { ...formData, id: Date.now().toString() }]);
    }
    handleCloseForm();
  };

  const handleOpenDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setCustomers(customers.filter(c => c.id !== itemToDelete));
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
    }
  };

  return (
    <div className="fade-in">
      <header className="main-header">
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 style={{ margin: 0 }}>Customers</h1>
          </div>
          <p style={{ marginTop: '4px', color: '#6b7280' }}>{customers.length} registered customers</p>
        </div>
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', height: '42px', transition: 'all 0.2s ease' }}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search customers..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.95rem', width: '250px', color: '#1e293b' }} />
          </div>
          <button className="btn-filter" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', padding: '0 16px', height: '42px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#111827' }}><SlidersHorizontal size={16} /> Filters</button>
          <button className="btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 20px', height: '42px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}><Plus size={18} /> Add Customer</button>
        </div>
      </header>

      {/* TABLA BLINDADA Y COMPACTA */}
      <div className="fade-in" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}>C...</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Business</th>
                <th style={thStyle}>Note</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>City - State - Zip</th>
                <th style={thStyle}>Email</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} onClick={() => handleOpenDetail(customer)} style={{ cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ backgroundColor: customer.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{customer.type}</td>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{customer.name}</td>
                  <td style={tdStyle}>{customer.business}</td>
                  <td style={{ ...tdStyle, color: '#6b7280', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customer.note || '-'}
                  </td>
                  <td style={tdStyle}>{customer.address || '-'}</td>
                  <td style={tdStyle}>{customer.cityStateZip || '-'}</td>
                  <td style={tdStyle}>{customer.email || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(customer); }}><Edit2 size={16} /></button>
                      <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer.id); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '30px' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE FORMULARIO BLINDADO --- */}
      {isFormModalOpen && (
        <div style={s.overlay} onClick={handleCloseForm}>
          <div style={s.modalWide} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>{selectedCustomer ? 'Edit Customer Profile' : 'Register New Customer'}</h3>
              <button style={s.closeBtn} onClick={handleCloseForm}><X size={20} /></button>
            </header>
            
            <div style={s.body}>
              
              {/* Row 1 */}
              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Customer Name <span style={{color: '#3b82f6'}}>*</span></label>
                  <div style={s.inputWrapper}>
                    <User style={s.icon} size={16} />
                    <input type="text" autoFocus style={s.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Type full name..." />
                  </div>
                </div>

                <div style={s.flex2}>
                  <label style={s.label}>Address</label>
                  <div style={s.inputWrapper}>
                    <MapPin style={s.icon} size={16} />
                    <input type="text" style={s.input} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St..." />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Type</label>
                  <div style={s.inputWrapper}>
                    <Briefcase style={s.icon} size={16} />
                    <select style={s.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="Property manager">Property manager</option>
                      <option value="Private customer">Private customer</option>
                    </select>
                  </div>
                </div>

                <div style={s.flex1}>
                  <label style={s.label}>Business</label>
                  <div style={s.inputWrapper}>
                    <Building style={s.icon} size={16} />
                    <select style={s.input} value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})}>
                      <option value="Regular">Regular</option>
                      <option value="Cavalry">Cavalry</option>
                    </select>
                  </div>
                </div>

                <div style={s.flex1}>
                  <label style={s.label}>Color Identifier</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="color" style={{ width: '44px', height: '44px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px', backgroundColor: 'transparent' }} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                    <input type="text" style={{...s.input, paddingLeft: '14px', fontFamily: 'monospace'}} value={formData.color.toUpperCase()} 
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#')) val = '#' + val.replace(/#/g, '');
                        setFormData({ ...formData, color: val.slice(0, 7) });
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <label style={s.label}>Email Address</label>
                  <div style={s.inputWrapper}>
                    <Mail style={s.icon} size={16} />
                    <input type="email" style={s.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@email.com" />
                  </div>
                </div>

                <div style={s.flex2}>
                  <label style={s.label}>City - State - Zip</label>
                  <div style={s.inputWrapper}>
                    <Map style={s.icon} size={16} />
                    <input type="text" style={s.input} value={formData.cityStateZip} onChange={e => setFormData({...formData, cityStateZip: e.target.value})} placeholder="Killeen, TX 76542" />
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div style={s.flexRow}>
                <div style={s.flexFull}>
                  <label style={s.label}>Additional Notes</label>
                  <div style={{...s.inputWrapper, alignItems: 'flex-start'}}>
                    <StickyNote style={{...s.icon, top: '14px'}} size={16} />
                    <textarea style={{...s.input, minHeight: '80px', resize: 'vertical'}} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Any special instructions or information about this customer..."></textarea>
                  </div>
                </div>
              </div>

            </div>
            
            <footer style={s.footer}>
              <button style={s.btnOutline} onClick={handleCloseForm}>Cancel</button>
              <button style={s.btnPrimary} onClick={handleSave}>Save Customer</button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES BLINDADO --- */}
      {isDetailModalOpen && selectedCustomer && (
        <div style={s.overlay} onClick={() => setIsDetailModalOpen(false)}>
          <div style={s.modalWide} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Customer Overview</h3>
              <button style={s.closeBtn} onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            
            <div style={s.body}>
              
              <div style={s.detailBanner}>
                <div style={s.detailItem}>
                  <span style={{...s.detailLabel, color: '#1e40af'}}><User size={14} /> CUSTOMER NAME</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: selectedCustomer.color, width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 600 }}>{selectedCustomer.name}</span>
                  </div>
                </div>
                <div style={s.detailItem}>
                  <span style={{...s.detailLabel, color: '#1e40af'}}><Briefcase size={14} /> ACCOUNT TYPE</span>
                  <span style={{ fontSize: '1.1rem', color: '#1e3a8a', marginTop: '4px' }}>{selectedCustomer.type}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Palette size={14} /> HEX COLOR</span>
                  <span style={s.detailValue}>{selectedCustomer.color.toUpperCase()}</span>
                </div>
                
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Building size={14} /> BUSINESS</span>
                  <span style={s.detailValue}>{selectedCustomer.business || '-'}</span>
                </div>
                
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Mail size={14} /> EMAIL</span>
                  <span style={s.detailValue}>{selectedCustomer.email || '-'}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex2}>
                  <span style={s.detailLabel}><MapPin size={14} /> ADDRESS</span>
                  <span style={s.detailValue}>{selectedCustomer.address || '-'}</span>
                </div>
                
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Map size={14} /> CITY - STATE - ZIP</span>
                  <span style={s.detailValue}>{selectedCustomer.cityStateZip || '-'}</span>
                </div>
              </div>
                
              <div style={s.flexRow}>
                <div style={s.noteBox}>
                  <span style={{...s.detailLabel, marginBottom: '8px'}}><StickyNote size={14} /> NOTES</span>
                  <span style={s.detailValue}>{selectedCustomer.note || 'No additional notes provided for this customer.'}</span>
                </div>
              </div>

            </div>
            
            <footer style={s.footerBetween}>
              <button style={s.btnDanger} onClick={() => handleDeleteClick(selectedCustomer.id)}>
                <Trash2 size={16} /> Delete Customer
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={s.btnOutline} onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button style={s.btnPrimary} onClick={() => handleOpenForm(selectedCustomer)}><Edit2 size={16} /> Edit Details</button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN BLINDADO --- */}
      {isDeleteModalOpen && (
        <div style={s.overlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div style={s.modalSmall} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Confirm Deletion</h3>
              <button style={s.closeBtn} onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </header>
            <div style={s.body}>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Are you sure you want to delete this customer? This action cannot be undone.</p>
            </div>
            <footer style={s.footer}>
              <button style={s.btnOutline} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button style={{...s.btnPrimary, backgroundColor: '#ef4444'}} onClick={confirmDelete}>Delete</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}