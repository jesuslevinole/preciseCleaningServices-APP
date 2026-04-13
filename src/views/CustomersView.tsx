import { useState, useEffect } from 'react';
import { 
  Search, Plus, X, Edit2, Trash2, Filter
} from 'lucide-react';
import { customersService } from '../services/customersService';
import type { Customer } from '../types/index';

interface CustomersViewProps {
  onOpenMenu: () => void;
}

export default function CustomersView({ onOpenMenu }: CustomersViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Unificamos city, state y zip en cityStateZip para coincidir con tu Type
  const [formData, setFormData] = useState<any>({
    id: '', name: '', type: 'Residential', business: '', note: '', address: '', cityStateZip: '', email: '', phone: '', color: '#3b82f6'
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await customersService.getAll();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.business && c.business.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({ id: '', name: '', type: 'Residential', business: '', note: '', address: '', cityStateZip: '', email: '', phone: '', color: '#3b82f6' });
    }
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
  };

  const handleSave = async () => {
    if (!formData.name) return alert('Name is required.');
    setIsSaving(true);
    try {
      if (formData.id) {
        await customersService.update(formData.id, formData as any);
        setCustomers(customers.map(c => c.id === formData.id ? (formData as Customer) : c));
      } else {
        const { id, ...dataToAdd } = formData;
        const newId = await customersService.create(dataToAdd as any);
        setCustomers([...customers, { ...formData, id: newId } as Customer]);
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Error saving customer.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    setIsSaving(true);
    try {
      await customersService.delete(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Error deleting customer.");
    } finally {
      setIsSaving(false);
    }
  };

  const s = {
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827', verticalAlign: 'middle' as const },
    label: { fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px', display: 'block' },
    input: { backgroundColor: '#ffffff', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', width: '100%', boxSizing: 'border-box' as const, outline: 'none' },
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <style>{`
        .modal-overlay-centered { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; box-sizing: border-box; }
        .modal-70 { background-color: #ffffff; width: 100%; max-width: 800px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; max-height: 90vh; }
        
        /* HEADER RESPONSIVO CON HAMBURGUESA */
        .view-header-title-group { display: flex; align-items: center; gap: 16px; }
        .hamburger-btn { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; cursor: pointer; color: #111827; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .hamburger-btn:hover { background-color: #f8fafc; }
        
        .grid-2-cols { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .col-span-full { grid-column: 1 / -1; }

        .td-content { display: flex; flex-direction: column; gap: 4px; }

        @media (max-width: 768px) {
          .view-header-title-group { flex-direction: row-reverse; justify-content: space-between; width: 100%; }
          .dashboard-actions-wrapper { flex-direction: column; align-items: stretch !important; width: 100%; gap: 12px; }
          .grid-2-cols { grid-template-columns: 1fr; }
          
          .responsive-table thead { display: none; }
          .responsive-table tr { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px; padding: 16px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          
          .responsive-table td { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; }
          .responsive-table td:last-child { border-bottom: none; padding-bottom: 0; }
          .responsive-table td::before { content: attr(data-label); font-weight: 700; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; padding-right: 15px; white-space: nowrap; }
          .responsive-table td .td-content { text-align: right; max-width: 65%; word-break: break-word; align-items: flex-end; }
          .actions-cell { justify-content: flex-end !important; width: 100%; flex-direction: row !important;}
        }
      `}</style>

      {/* HEADER DINÁMICO */}
      <header className="main-header dashboard-header-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="view-header-title-group">
          <button className="hamburger-btn" onClick={onOpenMenu} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>Customers</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>{customers.length} registered customers</p>
          </div>
        </div>

        <div className="dashboard-actions-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box-container" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '0 16px', height: '42px', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="#9ca3af" />
            <input type="text" placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.9rem', width: '100%', color: '#111827' }} />
          </div>
          
          <button style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '0 16px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600 }}>
            <Filter size={16} /> Filters
          </button>

          <button className="add-btn-mobile" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '0 20px', height: '42px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0 }}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </header>

      {/* TABLE */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{...s.th, width: '60px'}}>Color</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Name</th>
              <th style={s.th}>Business</th>
              <th style={s.th}>Note</th>
              <th style={s.th}>Address</th>
              <th style={s.th}>City/State/Zip</th>
              <th style={s.th}>Email</th>
              <th style={{...s.th, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading customers...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No customers found.</td></tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td data-label="Color" style={s.td}>
                    <div className="td-content">
                      <span style={{ backgroundColor: c.color || '#e2e8f0', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }}></span>
                    </div>
                  </td>
                  <td data-label="Type" style={s.td}><div className="td-content"><span style={{ backgroundColor: c.type === 'Commercial' ? '#eff6ff' : '#f0fdf4', color: c.type === 'Commercial' ? '#1e40af' : '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{c.type}</span></div></td>
                  <td data-label="Name" style={{...s.td, fontWeight: 600}}><div className="td-content">{c.name}</div></td>
                  <td data-label="Business" style={s.td}><div className="td-content">{c.business || '-'}</div></td>
                  <td data-label="Note" style={{...s.td, color: '#64748b', fontSize: '0.8rem'}}><div className="td-content">{c.note || '-'}</div></td>
                  <td data-label="Address" style={s.td}><div className="td-content">{c.address || '-'}</div></td>
                  
                  {/* Corregido: Ahora lee c.cityStateZip en lugar de intentar separar [c.city, c.state, c.zip] */}
                  <td data-label="City/State/Zip" style={s.td}><div className="td-content">{c.cityStateZip || '-'}</div></td>
                  
                  <td data-label="Email" style={s.td}><div className="td-content">{c.email || '-'}</div></td>
                  <td data-label="Actions" style={{...s.td, textAlign: 'right'}}>
                    <div className="td-content actions-cell" style={{ gap: '12px' }}>
                      <button onClick={() => handleOpenForm(c)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.id as string)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {isFormModalOpen && (
        <div className="modal-overlay-centered" onClick={handleCloseForm}>
          <div className="modal-70" onClick={e => e.stopPropagation()}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{formData.id ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={handleCloseForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </header>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div className="grid-2-cols">
                <div>
                  <label style={s.label}>Type</label>
                  <select style={{...s.input, cursor: 'pointer'}} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Color Marker</label>
                  <input type="color" style={{...s.input, height: '42px', padding: '2px 8px'}} value={formData.color || '#3b82f6'} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                  <input type="text" style={s.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Business Name</label>
                  <input type="text" style={s.input} value={formData.business || ''} onChange={e => setFormData({...formData, business: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Email</label>
                  <input type="email" style={s.input} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Phone</label>
                  <input type="text" style={s.input} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-full">
                  <label style={s.label}>Address</label>
                  <input type="text" style={s.input} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                {/* Corregido: Unificado en un solo campo según tu interfaz */}
                <div className="col-span-full">
                  <label style={s.label}>City / State / Zip</label>
                  <input 
                    type="text" 
                    style={s.input} 
                    placeholder="e.g. Maracaibo, Zulia 4001" 
                    value={formData.cityStateZip || ''} 
                    onChange={e => setFormData({...formData, cityStateZip: e.target.value})} 
                  />
                </div>

                <div className="col-span-full">
                  <label style={s.label}>Note</label>
                  <textarea style={{...s.input, height: '80px', resize: 'vertical'}} value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                </div>
              </div>
            </div>

            <footer style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 12px 12px' }}>
              <button onClick={handleCloseForm} disabled={isSaving} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                {isSaving ? 'Saving...' : 'Save Customer'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}