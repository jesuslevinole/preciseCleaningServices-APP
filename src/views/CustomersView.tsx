import { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Plus, Edit2, Trash2, X,
  User, Briefcase, Building, Mail, MapPin, Map, StickyNote, Palette
} from 'lucide-react';
import type { Customer } from '../types';

// IMPORTACIÓN DEL SERVICIO DE FIREBASE
import { customersService } from '../services/customersService';

interface CustomersViewProps {
  onOpenMenu: () => void;
}

export default function CustomersView({ onOpenMenu }: CustomersViewProps) {
  // Inicializa vacío para poblar desde Firebase
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Customer>({
    id: '', color: '#e5e7eb', type: 'Property manager', name: '', business: 'Regular', note: '', address: '', cityStateZip: '', email: ''
  });

  // --- CARGA INICIAL DESDE FIREBASE ROBUSTA ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await customersService.getAll();
        if (data) setCustomers(data);
      } catch (error: any) {
        console.error("Error fetching customers:", error);
        if (error.code === 'permission-denied') {
           console.error("Firebase Auth: Permission Denied to read customers.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // --- ESTILOS BLINDADOS (TABLA Y MODALES) ---
  const thStyle = { backgroundColor: '#f9fafb', padding: '12px 16px', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', textAlign: 'left' as const, whiteSpace: 'nowrap' as const };
  const tdStyle = { padding: '16px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '0.95rem', verticalAlign: 'middle' as const };

  const s = {
    // Overlay Centrado Absoluto (Fix para que no se mueva a la derecha)
    overlayCentered: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' } as React.CSSProperties,
    modalWide: { backgroundColor: '#ffffff', width: '100%', maxWidth: '950px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    modalSmall: { backgroundColor: '#ffffff', width: '100%', maxWidth: '450px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.15rem', fontWeight: 600, color: '#111827', margin: 0 },
    body: { padding: '30px', overflowY: 'auto' } as React.CSSProperties,
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    footerBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    
    // Formularios Grid/Flex
    flexRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' } as React.CSSProperties,
    flex1: { flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    flex2: { flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    flexFull: { flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    
    label: { fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' } as React.CSSProperties,
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' } as React.CSSProperties,
    icon: { position: 'absolute', left: '14px', color: '#6b7280', pointerEvents: 'none' } as React.CSSProperties,
    // input con fondo obligatoriamente blanco
    input: { backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s' } as React.CSSProperties,
    
    // Botones
    btnPrimary: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' } as React.CSSProperties,
    btnOutline: { backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' } as React.CSSProperties,
    btnDanger: { backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex' },
    
    // Detalles
    detailBanner: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', backgroundColor: '#eff6ff', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' } as React.CSSProperties,
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' } as React.CSSProperties,
    detailLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
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

  // --- GUARDADO ASÍNCRONO ROBUSTO ---
  const handleSave = async () => {
    if (formData.name.trim() === '') return alert('Customer Name is required.');
    
    setIsSaving(true);
    try {
      if (selectedCustomer && selectedCustomer.id) {
        // Actualizar (usando as any para evitar conflictos TS y destructurando para quitar el id)
        const { id, ...dataToUpdate } = formData;
        await customersService.update(selectedCustomer.id, dataToUpdate as any);
        setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...formData } : c));
      } else {
        // Crear
        const { id, ...dataToAdd } = formData;
        const newId = await customersService.create(dataToAdd as any);
        setCustomers([...customers, { ...formData, id: newId }]);
      }
      handleCloseForm();
    } catch (error: any) {
      console.error("Error al guardar:", error);
      if (error.code === 'permission-denied') {
        alert("❌ Firebase Error: Access Denied. You don't have permissions to write to the database.");
      } else {
        alert("❌ Error: Could not save customer. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // --- ELIMINADO ASÍNCRONO ROBUSTO ---
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsSaving(true);
    try {
      await customersService.delete(itemToDelete);
      setCustomers(customers.filter(c => c.id !== itemToDelete));
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      if (error.code === 'permission-denied') {
        alert("❌ Firebase Error: Access Denied. You don't have permissions to delete this record.");
      } else {
        alert("❌ Error: Could not delete customer.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      
      {/* CSS PARA TABLA RESPONSIVA Y MODALES MÓVILES */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-customer-table thead { display: none; }
          .responsive-customer-table tr {
            display: flex;
            flex-direction: column;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 16px;
            padding: 16px;
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .responsive-customer-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            text-align: right;
            white-space: normal !important;
          }
          .responsive-customer-table td:last-child { border-bottom: none !important; padding-bottom: 0 !important; }
          .responsive-customer-table td::before {
            content: attr(data-label);
            font-weight: 700;
            color: #6b7280;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-right: 16px;
          }
          
          /* Centrar acciones en móvil */
          .mobile-actions { justify-content: flex-end; width: 100%; }
        }
      `}</style>

      <header className="main-header" style={{ marginBottom: '24px' }}>
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827' }}>Customers</h1>
          </div>
          <p style={{ marginTop: '4px', color: '#6b7280' }}>{isLoading ? '...' : customers.length} registered customers</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', height: '42px', transition: 'all 0.2s ease', flex: 1, minWidth: '200px' }}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search customers..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.95rem', width: '100%', color: '#1e293b' }} />
          </div>
          <button style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', padding: '0 16px', height: '42px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#111827' }}><SlidersHorizontal size={16} /> Filters</button>
          <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '0 20px', height: '42px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}><Plus size={18} /> Add Customer</button>
        </div>
      </header>

      {/* TABLA BLINDADA Y RESPONSIVA */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', overflow: 'hidden', padding: '10px' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="responsive-customer-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
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
              {isLoading ? (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '40px' }}>No customers registered.</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} onClick={() => handleOpenDetail(customer)} style={{ cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td data-label="Color" style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ backgroundColor: customer.color, display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%' }}></span>
                    </td>
                    <td data-label="Type" style={{ ...tdStyle, color: '#6b7280' }}>{customer.type}</td>
                    <td data-label="Name" style={{ ...tdStyle, fontWeight: '600' }}>{customer.name}</td>
                    <td data-label="Business" style={tdStyle}>{customer.business}</td>
                    <td data-label="Note" style={{ ...tdStyle, color: '#6b7280', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {customer.note || '-'}
                    </td>
                    <td data-label="Address" style={tdStyle}>{customer.address || '-'}</td>
                    <td data-label="City/State/Zip" style={tdStyle}>{customer.cityStateZip || '-'}</td>
                    <td data-label="Email" style={{...tdStyle, color: '#3b82f6'}}>{customer.email || '-'}</td>
                    <td data-label="Actions" style={{ ...tdStyle, textAlign: 'right' }}>
                      <div className="mobile-actions" style={{ display: 'flex', gap: '4px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '6px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(customer); }}><Edit2 size={18} /></button>
                        <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer.id); }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE FORMULARIO BLINDADO (CENTRADO Y FONDOS BLANCOS) --- */}
      {isFormModalOpen && (
        <div style={s.overlayCentered} onClick={handleCloseForm}>
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
              <button style={s.btnOutline} onClick={handleCloseForm} disabled={isSaving}>Cancel</button>
              <button style={s.btnPrimary} onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Customer'}</button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES BLINDADO CENTRADO --- */}
      {isDetailModalOpen && selectedCustomer && (
        <div style={s.overlayCentered} onClick={() => setIsDetailModalOpen(false)}>
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
                  <span style={{ fontSize: '1.1rem', color: '#1e3a8a', marginTop: '4px', fontWeight: 500 }}>{selectedCustomer.type}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Palette size={14} /> HEX COLOR</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: selectedCustomer.color, width: '16px', height: '16px', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span style={{...s.detailValue, fontFamily: 'monospace'}}>{selectedCustomer.color.toUpperCase()}</span>
                  </div>
                </div>
                
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Building size={14} /> BUSINESS</span>
                  <span style={s.detailValue}>{selectedCustomer.business || '-'}</span>
                </div>
                
                <div style={s.flex1}>
                  <span style={s.detailLabel}><Mail size={14} /> EMAIL</span>
                  <span style={{...s.detailValue, color: '#3b82f6'}}>{selectedCustomer.email || '-'}</span>
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
              <button style={s.btnDanger} onClick={() => handleDeleteClick(selectedCustomer.id)} disabled={isSaving}>
                <Trash2 size={16} /> {isSaving ? 'Deleting...' : 'Delete Customer'}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={s.btnOutline} onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button style={s.btnPrimary} onClick={() => handleOpenForm(selectedCustomer)}><Edit2 size={16} /> Edit Details</button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN BLINDADO CENTRADO --- */}
      {isDeleteModalOpen && (
        <div style={s.overlayCentered} onClick={() => setIsDeleteModalOpen(false)}>
          <div style={s.modalSmall} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Confirm Deletion</h3>
              <button style={s.closeBtn} onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </header>
            <div style={s.body}>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Are you sure you want to delete this customer? This action cannot be undone.</p>
            </div>
            <footer style={s.footer}>
              <button style={s.btnOutline} onClick={() => setIsDeleteModalOpen(false)} disabled={isSaving}>Cancel</button>
              <button style={{...s.btnPrimary, backgroundColor: '#ef4444'}} onClick={confirmDelete} disabled={isSaving}>{isSaving ? 'Deleting...' : 'Delete'}</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}