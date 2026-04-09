import { useState, useEffect } from 'react';
import { Plus, Trash2, X, User, Mail, Phone, ShieldCheck, Search } from 'lucide-react'; // Edit2 eliminado
import type { SystemUser, Role } from '../../types/index';
import { usersService } from '../../services/usersService';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.id === value);

  return (
    <div 
      tabIndex={0} 
      onBlur={() => setTimeout(() => setIsOpen(false), 200)} 
      style={{ position: 'relative', width: '100%', outline: 'none' }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#0f172a', minHeight: '45px' }}
      >
        <Icon size={16} color="#64748b" style={{ position: 'absolute', left: '14px' }} />
        <span style={{ color: selected ? '#0f172a' : '#94a3b8' }}>{selected ? selected.name : placeholder}</span>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '105%', left: 0, width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', zIndex: 9999, marginTop: '4px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
          {options.map((o: any) => (
            <div key={o.id} onClick={() => { onChange(o.id); setIsOpen(false); }} style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc', color: '#0f172a', backgroundColor: value === o.id ? '#f1f5f9' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = value === o.id ? '#f1f5f9' : 'transparent'}>
              {o.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface UsersViewProps {
  onOpenMenu: () => void;
  roles: Role[];
}

export default function UsersView({ onOpenMenu, roles }: UsersViewProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SystemUser>({ id: '', firstName: '', lastName: '', email: '', phone: '', altPhone: '', roleId: '', status: 'Pending Invite' });

  // Cargar usuarios de Firebase al iniciar
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'system_users'));
        const usersList: SystemUser[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() } as SystemUser);
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenForm = (user?: SystemUser) => {
    setFormData(user || { id: '', firstName: '', lastName: '', email: '', phone: '', altPhone: '', roleId: '', status: 'Pending Invite' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.email || !formData.roleId) return alert("Please fill in Email and Role.");
    
    setIsSaving(true);
    try {
      if (formData.id) {
        // En una futura mejora: crear lógica de updateUser en usersService
        alert("Editing users directly is restricted. Please delete and re-invite if needed.");
        setIsModalOpen(false);
      } else {
        const newUserId = await usersService.inviteUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone,
          altPhone: formData.altPhone || '',
          roleId: formData.roleId,
          status: 'Pending Invite'
        });
        setUsers(prev => [...prev, { ...formData, id: newUserId, status: 'Pending Invite' }]);
        alert(`✅ Success! Invitation sent to ${formData.email}.`);
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error completo al guardar:", error);
      if (error.code === 'permission-denied') alert("❌ Firebase Error: Access Denied. Check your Firestore Rules.");
      else alert("❌ Error: Could not send invitation. Please check the console.");
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id: string) => {
    if(window.confirm("Are you sure you want to remove this user's access?")) {
      setIsSaving(true);
      try {
        await deleteDoc(doc(db, 'system_users', id));
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("Error al borrar usuario:", error);
        alert("Hubo un problema al borrar el usuario.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const s = {
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#0f172a' },
    label: { fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' } as React.CSSProperties,
    input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#0f172a' } as React.CSSProperties,
    btnCancel: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onOpenMenu} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }} className="mobile-menu-btn">
             <Search size={20} color="#64748b" />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>System Users</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Whitelist of authorized users</p>
          </div>
        </div>
        <button onClick={() => handleOpenForm()} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '20px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          <Plus size={18} /> Invite New User
        </button>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Status</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user.id}>
                <td style={{ ...s.td, fontWeight: 600 }}>{user.firstName} {user.lastName}</td>
                <td style={s.td}>{user.email}</td>
                <td style={s.td}><span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>{roles.find(r => r.id === user.roleId)?.name || 'N/A'}</span></td>
                <td style={s.td}>
                  <span style={{ color: user.status === 'Active' ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>{user.status}</span>
                </td>
                <td style={{ ...s.td, textAlign: 'right' }}>
                  <button onClick={() => handleDeleteUser(user.id)} disabled={isSaving} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', marginLeft: '8px' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '700px', borderRadius: '16px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <header style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formData.id ? 'Edit User' : 'Invite User'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </header>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={s.label}>First Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input type="text" style={s.input} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="John" />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Last Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input type="text" style={s.input} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" />
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input type="email" style={s.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@company.com" disabled={!!formData.id} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input type="tel" style={s.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1..." />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Assign Role *</label>
                  <CustomSelect options={roles} value={formData.roleId} onChange={(val: string) => setFormData({...formData, roleId: val})} placeholder="Select a role..." icon={ShieldCheck} />
                </div>
              </div>
            </div>

            <footer style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 16px 16px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={s.btnCancel}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Processing...' : (formData.id ? 'Update' : 'Invite')}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}