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

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  
  // Estados para Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Estado del Formulario
  const [formData, setFormData] = useState<Customer>({
    id: '', color: '#e5e7eb', type: 'Property manager', name: '', business: 'Regular', note: '', address: '', cityStateZip: '', email: ''
  });

  // --- Funciones Modales ---
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
          <h1>Customers</h1>
          <p>{customers.length} registered customers</p>
        </div>
        <div className="header-actions">
          
          {/* BUSCADOR BLINDADO GRIS CLARO ELEGANTE */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', height: '42px', transition: 'all 0.2s ease' }}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search customers..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.95rem', width: '250px', color: '#1e293b' }} />
          </div>

          <button className="btn-filter"><SlidersHorizontal size={16} /> Filters</button>
          <button className="btn-primary" onClick={() => handleOpenForm()}><Plus size={18} /> Add Customer</button>
        </div>
      </header>

      <div className="table-container fade-in">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table interactive-table" style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>C...</th>
                <th>Type</th>
                <th>Name</th>
                <th>Business</th>
                <th>Note</th>
                <th>Address</th>
                <th>City - State - Zip</th>
                <th>Email</th>
                <th className="action-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} onClick={() => handleOpenDetail(customer)}>
                  <td style={{ textAlign: 'center' }}>
                    <span className="color-dot" style={{ backgroundColor: customer.color }}></span>
                  </td>
                  <td className="text-secondary">{customer.type}</td>
                  <td style={{ fontWeight: '600' }}>{customer.name}</td>
                  <td>{customer.business}</td>
                  <td className="text-secondary" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customer.note || '-'}
                  </td>
                  <td>{customer.address || '-'}</td>
                  <td>{customer.cityStateZip || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td className="action-column">
                    <div className="action-group">
                      <button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(customer); }}><Edit2 size={16} /></button>
                      <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer.id); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={9} className="empty-cell">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE FORMULARIO (3 COLUMNAS PREMIUM) --- */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content modal-extra-wide" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{selectedCustomer ? 'Edit Customer Profile' : 'Register New Customer'}</h3>
              <button className="btn-icon close" onClick={handleCloseForm}><X size={20} /></button>
            </header>
            
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px' }}>
              <div className="form-grid-3">
                
                {/* ROW 1: Name & Address juntos */}
                <div className="form-group">
                  <label>Customer Name <span className="required">*</span></label>
                  <div className="input-icon-wrapper">
                    <User className="input-icon" size={16} />
                    <input type="text" autoFocus className="white-input with-icon" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Type full name..." />
                  </div>
                </div>

                <div className="form-group col-span-2">
                  <label>Address</label>
                  <div className="input-icon-wrapper">
                    <MapPin className="input-icon" size={16} />
                    <input type="text" className="white-input with-icon" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St..." />
                  </div>
                </div>

                {/* ROW 2: Type, Business, Color Identifier */}
                <div className="form-group">
                  <label>Type</label>
                  <div className="input-icon-wrapper">
                    <Briefcase className="input-icon" size={16} />
                    <select className="select-input with-icon" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="Property manager">Property manager</option>
                      <option value="Private customer">Private customer</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Business</label>
                  <div className="input-icon-wrapper">
                    <Building className="input-icon" size={16} />
                    <select className="select-input with-icon" value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})}>
                      <option value="Regular">Regular</option>
                      <option value="Cavalry">Cavalry</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Color Identifier</label>
                  <div className="color-picker-wrapper" style={{ height: '44px' }}>
                    <input type="color" className="color-input" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                    <input type="text" className="color-hex-input" value={formData.color.toUpperCase()} 
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#')) val = '#' + val.replace(/#/g, '');
                        setFormData({ ...formData, color: val.slice(0, 7) });
                      }} 
                    />
                  </div>
                </div>

                {/* ROW 3: Email, CityStateZip */}
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail className="input-icon" size={16} />
                    <input type="email" className="white-input with-icon" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@email.com" />
                  </div>
                </div>

                <div className="form-group col-span-2">
                  <label>City - State - Zip</label>
                  <div className="input-icon-wrapper">
                    <Map className="input-icon" size={16} />
                    <input type="text" className="white-input with-icon" value={formData.cityStateZip} onChange={e => setFormData({...formData, cityStateZip: e.target.value})} placeholder="Killeen, TX 76542" />
                  </div>
                </div>

                {/* ROW 4: Notes (FULL WIDTH) */}
                <div className="form-group col-span-3">
                  <label>Additional Notes</label>
                  <div className="input-icon-wrapper" style={{ alignItems: 'flex-start' }}>
                    <StickyNote className="input-icon" size={16} style={{ top: '14px' }} />
                    <textarea className="white-input with-icon" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Any special instructions or information about this customer..."></textarea>
                  </div>
                </div>

              </div>
            </div>
            
            <footer className="modal-footer" style={{ padding: '20px 30px' }}>
              <button className="btn-outline" onClick={handleCloseForm}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save Customer</button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES PREMIUM (3 COLUMNAS) --- */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content modal-extra-wide" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Customer Overview</h3>
              <button className="btn-icon close" onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            
            <div className="modal-body detail-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px' }}>
              
              {/* Banner Superior */}
              <div className="detail-info-card" style={{ marginBottom: '24px', gridTemplateColumns: '1fr 1fr', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <div className="detail-item">
                  <span className="detail-label-with-icon" style={{ color: '#1e40af' }}><User size={14} /> CUSTOMER NAME</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span className="color-dot large" style={{ backgroundColor: selectedCustomer.color }}></span>
                    <span className="detail-value" style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: '600' }}>{selectedCustomer.name}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label-with-icon" style={{ color: '#1e40af' }}><Briefcase size={14} /> ACCOUNT TYPE</span>
                  <span className="detail-value" style={{ fontSize: '1.1rem', color: '#1e3a8a', marginTop: '4px' }}>{selectedCustomer.type}</span>
                </div>
              </div>

              {/* Grid 3 Columnas */}
              <div className="form-grid-3">
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Palette size={14} /> HEX COLOR</span>
                  <span className="detail-value mt-4">{selectedCustomer.color.toUpperCase()}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Building size={14} /> BUSINESS</span>
                  <span className="detail-value mt-4">{selectedCustomer.business || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Mail size={14} /> EMAIL</span>
                  <span className="detail-value mt-4">{selectedCustomer.email || '-'}</span>
                </div>
                
                <div className="detail-item col-span-2">
                  <span className="detail-label-with-icon"><MapPin size={14} /> ADDRESS</span>
                  <span className="detail-value mt-4">{selectedCustomer.address || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label-with-icon"><Map size={14} /> CITY - STATE - ZIP</span>
                  <span className="detail-value mt-4">{selectedCustomer.cityStateZip || '-'}</span>
                </div>
                
                <div className="detail-item col-span-3 mt-16" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <span className="detail-label-with-icon mb-16"><StickyNote size={14} /> NOTES</span>
                  <span className="detail-value" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{selectedCustomer.note || 'No additional notes provided for this customer.'}</span>
                </div>
              </div>

            </div>
            
            <footer className="modal-footer footer-layout-custom" style={{ padding: '20px 30px' }}>
              <button className="btn-danger-light" onClick={() => handleDeleteClick(selectedCustomer.id)}>
                <Trash2 size={16} style={{ marginRight: '6px' }} /> Delete Customer
              </button>
              <div className="footer-right-group">
                <button className="btn-text" onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button className="btn-primary" onClick={() => handleOpenForm(selectedCustomer)}><Edit2 size={16} /> Edit Details</button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <header className="modal-header"><h3>Confirm Deletion</h3><button className="btn-icon close" onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button></header>
            <div className="modal-body"><p className="text-secondary">Are you sure you want to delete this customer? This action cannot be undone.</p></div>
            <footer className="modal-footer"><button className="btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button><button className="btn-primary danger-bg" onClick={confirmDelete}>Delete</button></footer>
          </div>
        </div>
      )}
    </div>
  );
}