import { useState } from 'react';
import { Plus, Edit2, Trash2, X, ShieldAlert, CheckSquare } from 'lucide-react';
// IMPORTANTE: Importamos las interfaces desde nuestra fuente central de verdad
import type { Role, Permission } from '../../types/index';

const defaultModules = ['Houses', 'Calendar', 'Invoices', 'Customers', 'Settings'];

export default function RolesView({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Administrator', description: 'Full access to all system features.', permissions: [] },
    { id: '2', name: 'Employee', description: 'Limited access, only sees assigned jobs.', permissions: [] }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Role>({ id: '', name: '', description: '', permissions: [] });

  const handleOpenForm = (role?: Role) => {
    if (role) {
      setFormData(role);
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

  // CORRECCIÓN: Lógica para guardar usando setRoles
  const handleSaveRole = () => {
    if (!formData.name) return alert("Role name is required");
    
    if (formData.id) {
      // Editamos un rol existente
      setRoles(roles.map(r => r.id === formData.id ? formData : r));
    } else {
      // Agregamos un rol nuevo (simulando un ID con Date.now)
      setRoles([...roles, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  // NUEVO: Lógica para eliminar usando setRoles
  const handleDeleteRole = (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  // --- STYLES ---
  const s = {
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827' },
    checkbox: { width: '16px', height: '16px', cursor: 'pointer' } as React.CSSProperties,
    select: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' } as React.CSSProperties
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
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>Roles & Permissions</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Manage access levels for the system</p>
          </div>
        </div>
        <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Create Role
        </button>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <td data-label="Role Name" style={{ ...s.td, fontWeight: 600, color: '#2563eb' }}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '6px' }}/> {role.name}</td>
                <td data-label="Description" style={{ ...s.td, color: '#64748b' }}>{role.description}</td>
                <td data-label="Actions" style={{ ...s.td, textAlign: 'right' }}>
                  <button onClick={() => handleOpenForm(role)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteRole(role.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ROLES MODAL WITH PERMISSION MATRIX */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '800px', borderRadius: '12px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <header style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{formData.id ? 'Edit Role' : 'New Role Configuration'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
            </header>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Role Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="e.g. Supervisor" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Brief role description..." />
                </div>
              </div>

              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Permissions Matrix</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={s.th}>Module</th>
                      <th style={{...s.th, textAlign: 'center'}}>View</th>
                      <th style={{...s.th, textAlign: 'center'}}>Add</th>
                      <th style={{...s.th, textAlign: 'center'}}>Edit</th>
                      <th style={{...s.th, textAlign: 'center'}}>Delete</th>
                      <th style={{...s.th, textAlign: 'center'}}>Data Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.permissions.map((perm, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...s.td, fontWeight: 600, color: '#475569' }}>{perm.module}</td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canView} onChange={e => handlePermissionChange(perm.module, 'canView', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canAdd} onChange={e => handlePermissionChange(perm.module, 'canAdd', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canEdit} onChange={e => handlePermissionChange(perm.module, 'canEdit', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}><input type="checkbox" style={s.checkbox} checked={perm.canDelete} onChange={e => handlePermissionChange(perm.module, 'canDelete', e.target.checked)} /></td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <select style={s.select} value={perm.scope} onChange={e => handlePermissionChange(perm.module, 'scope', e.target.value)}>
                            <option value="Own">Own Records Only</option>
                            <option value="All">All Company Records</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 12px 12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveRole} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}><CheckSquare size={16}/> Save Role</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}