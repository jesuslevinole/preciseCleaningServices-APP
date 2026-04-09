import { useState } from 'react';
import { Plus, Edit2, Trash2, X, ShieldAlert, CheckSquare } from 'lucide-react';
import type { Role, Permission } from '../../types/index';

// CORRECCIÓN: Definimos que esta vista ahora recibe roles y setRoles desde el padre (App.tsx)
interface RolesViewProps {
  onOpenMenu: () => void;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export default function RolesView({ onOpenMenu, roles, setRoles }: RolesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Role>({ id: '', name: '', description: '', permissions: [] });

  const defaultModules = ['Houses', 'Calendar', 'Invoices', 'Customers', 'Settings'];

  const handleOpenForm = (role?: Role) => {
    if (role) {
      setFormData({...role});
    } else {
      const initialPermissions = defaultModules.map(mod => ({ 
        module: mod, canView: false, canAdd: false, canEdit: false, canDelete: false, scope: 'Own' as const 
      }));
      setFormData({ id: '', name: '', description: '', permissions: initialPermissions });
    }
    setIsModalOpen(true);
  };

  const handlePermissionChange = (moduleName: string, field: keyof Permission, value: any) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => p.module === moduleName ? { ...p, [field]: value } : p)
    }));
  };

  const handleSaveRole = () => {
    if (!formData.name) return alert("Role name is required");
    
    if (formData.id) {
      // Actualizamos el estado global en App.tsx
      setRoles(roles.map(r => r.id === formData.id ? formData : r));
    } else {
      // Creamos un nuevo rol en el estado global
      setRoles([...roles, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  // --- ESTILOS ---
  const s = {
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#0f172a' },
    input: { width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.95rem' } as React.CSSProperties,
    checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' } as React.CSSProperties,
    select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', cursor: 'pointer' } as React.CSSProperties,
    btnCancel: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' } as React.CSSProperties
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onOpenMenu} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }} className="mobile-menu-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>Roles & Permissions</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Configure the access simulation</p>
          </div>
        </div>
        <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> Create New Role
        </button>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={s.th}>Role Name</th>
              <th style={s.th}>Description</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td style={{ ...s.td, fontWeight: 600, color: '#2563eb' }}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '8px' }}/> {role.name}</td>
                <td style={{ ...s.td, color: '#64748b' }}>{role.description}</td>
                <td style={{ ...s.td, textAlign: 'right' }}>
                  <button onClick={() => handleOpenForm(role)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDeleteRole(role.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', marginLeft: '8px' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '850px', borderRadius: '16px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <header style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formData.id ? 'Edit Role' : 'New Role'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </header>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Role Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={s.input} placeholder="e.g. Supervisor" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Role Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={s.input} placeholder="What is this role for?" />
                </div>
              </div>

              <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Permissions Matrix</h4>
              <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={s.th}>Module</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>View</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Add</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Edit</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Delete</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.permissions.map((perm, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{perm.module}</td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canView} onChange={e => handlePermissionChange(perm.module, 'canView', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canAdd} onChange={e => handlePermissionChange(perm.module, 'canAdd', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canEdit} onChange={e => handlePermissionChange(perm.module, 'canEdit', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canDelete} onChange={e => handlePermissionChange(perm.module, 'canDelete', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <select style={s.select} value={perm.scope} onChange={e => handlePermissionChange(perm.module, 'scope', e.target.value)}>
                            <option value="Own">Own</option>
                            <option value="All">All</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 16px 16px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={s.btnCancel}>Cancel</button>
              <button onClick={handleSaveRole} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                <CheckSquare size={18}/> Save Configuration
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}