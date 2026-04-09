import { useState } from 'react';
import { Plus, Edit2, Trash2, X, User, Mail, Phone, ShieldCheck, CheckCircle } from 'lucide-react';
import type { SystemUser } from '../../types/index'; 

// Reutilizamos tu CustomSelect para el formulario de usuarios
const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.id === value);

  return (
    <div tabIndex={0} onBlur={() => setIsOpen(false)} style={{ position: 'relative', width: '100%', outline: 'none' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <Icon size={16} color="#6b7280" style={{ position: 'absolute', left: '14px' }} />
        <span style={{ color: selected ? '#111827' : '#9ca3af' }}>{selected ? selected.name : placeholder}</span>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', zIndex: 1000, marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {options.map((o: any) => (
            <div key={o.id} onMouseDown={() => { onChange(o.id); setIsOpen(false); }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              {o.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function UsersView({ onOpenMenu }: { onOpenMenu: () => void }) {
  const mockRoles = [{ id: 'r1', name: 'Administrator' }, { id: 'r2', name: 'Employee' }];
  
  const [users, setUsers] = useState<SystemUser[]>([
    { id: '1', firstName: 'Jesus', lastName: 'Molero', email: 'jesus@precise.com', phone: '+58 412 000 0000', altPhone: '', roleId: 'r1', status: 'Active' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SystemUser>({ id: '', firstName: '', lastName: '', email: '', phone: '', altPhone: '', roleId: '', status: 'Pending Invite' });

  const handleOpenForm = (user?: SystemUser) => {
    setFormData(user || { id: '', firstName: '', lastName: '', email: '', phone: '', altPhone: '', roleId: '', status: 'Pending Invite' });
    setIsModalOpen(true);
  };

  // CORRECCIÓN: Ahora utilizamos setUsers para actualizar la lista visualmente
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (formData.id) {
        // Editamos un usuario existente
        setUsers(users.map(u => u.id === formData.id ? formData : u));
      } else {
        // Agregamos un usuario nuevo (generamos un ID temporal)
        setUsers([...users, { ...formData, id: Date.now().toString() }]);
      }
      
      setIsSaving(false);
      setIsModalOpen(false);
      alert(`User saved. A password setup email has been sent to ${formData.email}`);
    }, 1500);
  };

  // NUEVO: Función para eliminar y usar setUsers
  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // --- STYLES ---
  const s = {
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827' },
    label: { fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' } as React.CSSProperties,
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' } as React.CSSProperties,
    icon: { position: 'absolute', left: '14px', color: '#6b7280', pointerEvents: 'none' } as React.CSSProperties,
    input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' } as React.CSSProperties
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .responsive-table thead { display: none; }
          .responsive-table tr { display: flex; flex-direction: column; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px; padding: 16px; background: #ffffff; }
          .responsive-table td { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; }
          .responsive-table td:last-child { border-bottom: none; }
          .responsive-table td::before { content: attr(data-label); font-weight: 700; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; }
        }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onOpenMenu} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }} className="mobile-menu-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>System Users</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Manage team members and access</p>
          </div>
        </div>
        <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Add User
        </button>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Contact Info</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Status</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user.id}>
                <td data-label="Name" style={{ ...s.td, fontWeight: 600 }}>{user.firstName} {user.lastName}</td>
                <td data-label="Contact" style={s.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.85rem' }}>{user.email}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.phone}</span>
                  </div>
                </td>
                <td data-label="Role" style={s.td}><span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{mockRoles.find(r => r.id === user.roleId)?.name || 'None'}</span></td>
                <td data-label="Status" style={s.td}>
                  <span style={{ color: user.status === 'Active' ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.status === 'Active' ? '#10b981' : '#f59e0b' }}></div> {user.status}
                  </span>
                </td>
                <td data-label="Actions" style={{ ...s.td, textAlign: 'right' }}>
                  <button onClick={() => handleOpenForm(user)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '700px', borderRadius: '12px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <header style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{formData.id ? 'Edit User Profile' : 'Invite New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </header>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {!formData.id && (
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem', color: '#1e40af', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Upon saving, the system will automatically send an email to the provided address with a secure link for the user to set up their password and activate their account.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={s.label}>First Name *</label>
                  <div style={s.inputWrapper}>
                    <User style={s.icon} size={16} />
                    <input type="text" style={s.input} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="John" />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Last Name *</label>
                  <div style={s.inputWrapper}>
                    <User style={s.icon} size={16} />
                    <input type="text" style={s.input} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" />
                  </div>
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>Email Address *</label>
                  <div style={s.inputWrapper}>
                    <Mail style={s.icon} size={16} />
                    <input type="email" style={s.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john.doe@company.com" disabled={!!formData.id} />
                  </div>
                  {formData.id && <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Email cannot be changed after creation.</small>}
                </div>

                <div>
                  <label style={s.label}>Phone Number</label>
                  <div style={s.inputWrapper}>
                    <Phone style={s.icon} size={16} />
                    <input type="tel" style={s.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Alternative Phone</label>
                  <div style={s.inputWrapper}>
                    <Phone style={s.icon} size={16} />
                    <input type="tel" style={s.input} value={formData.altPhone} onChange={e => setFormData({...formData, altPhone: e.target.value})} placeholder="Optional" />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>Assign Role *</label>
                  <CustomSelect options={mockRoles} value={formData.roleId} onChange={(val: string) => setFormData({...formData, roleId: val})} placeholder="Select a role..." icon={ShieldCheck} />
                </div>
              </div>
            </div>

            <footer style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 12px 12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Processing...' : (formData.id ? 'Save Changes' : 'Send Invite')}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}