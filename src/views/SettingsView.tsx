import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
  Tags, Users, UserCheck, Flag, Activity, Percent, 
  MapPin, Wrench, CreditCard, ClipboardList, Package, Building, Plus,
  Edit2, Trash2, X
} from 'lucide-react';
import type { SettingOption, CategoryExpense, Team, Responsable, Priority, Status, Tax, Place, Service, PaymentMethod, Task, Product, Business } from '../types';

const settingsOptions: SettingOption[] = [
  { id: 'category', label: 'Category Expenses', icon: Tags },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'responsable', label: 'Responsable', icon: UserCheck },
  { id: 'priority', label: 'Priority', icon: Flag },
  { id: 'status', label: 'Status', icon: Activity },
  { id: 'tax', label: 'Tax %', icon: Percent },
  { id: 'place', label: 'Place', icon: MapPin },
  { id: 'service', label: 'Service', icon: Wrench },
  { id: 'payment', label: 'Payment Method', icon: CreditCard },
  { id: 'task', label: 'Task', icon: ClipboardList },
  { id: 'product', label: 'Product', icon: Package },
  { id: 'business', label: 'Business', icon: Building },
];

const initialCategories: CategoryExpense[] = [
  { id: '1', name: 'Supplies' }, { id: '2', name: 'Payroll' }, { id: '3', name: 'Maintenance' }, { id: '4', name: 'Food' }, { id: '5', name: 'Drip pans/Light Bulbs' }
];
const initialTeams: Team[] = [
  { id: '1', name: 'Team test', business: '', color: '#f97316' }, { id: '2', name: 'Team Jesus', business: '', color: '#e5e7eb' }, { id: '3', name: 'Team 10', business: '', color: '#22c55e' }
];
const initialResponsables: Responsable[] = [
  { id: '1', name: 'Omar Marquez', color: '#e5e7eb' }, { id: '2', name: '43811d33', color: '#e5e7eb' }
];
const initialPriorities: Priority[] = [
  { id: '1', name: 'HIGH', business: 'a', color: '#ef4444' }, { id: '2', name: 'MEDIUM', business: '', color: '#eab308' }, { id: '3', name: 'LOW', business: '', color: '#22c55e' }
];
const initialStatuses: Status[] = [
  { id: '1', order: 1, name: 'PENDING ASSESSMENT', business: 'Regular', color: '#4b5563' }, { id: '2', order: 2, name: 'NEEDS TO BE SCHEDULE', business: 'Regular', color: '#3b82f6' }
];
const initialPlaces: Place[] = [
  { id: 'p1', name: 'Bathroom 1' }, { id: 'p2', name: 'Bathroom 2' }, { id: 'p3', name: 'Room 5' }, { id: 'p4', name: 'Room 4' }
];
const initialTasks: Task[] = [
  { id: 't1', placeId: 'p3', name: 'Remove Cobwebs' }, { id: 't2', placeId: 'p3', name: 'Clean Light Fixture/AC Fans' }, { id: 't3', placeId: 'p3', name: 'Door/knobs/Walls' }, { id: 't4', placeId: 'p4', name: 'Closet' }
];
const initialProducts: Product[] = [
  { id: 'pr1', name: 'Air Filter', price: '12.00' }, { id: 'pr3', name: 'Bulbs', price: '4.00' }
];
const initialBusinesses: Business[] = [
  { id: 'b1', name: 'Regular' }, { id: 'b2', name: 'Cavalry' }
];
const initialServices: Service[] = [
  { id: 's1', name: 'Full', estimatedTime: '', business: '' }, { id: 's2', name: 'Light', estimatedTime: '120', business: '' }
];
const initialPaymentMethods: PaymentMethod[] = [
  { id: 'pm1', name: 'Cash' }, { id: 'pm2', name: 'Credit card' }
];
const initialTax: Tax = { id: 'tax-1', percentage: 8.25 };

interface SettingsViewProps {
  currentSettingView: string;
  setCurrentSettingView: Dispatch<SetStateAction<string>>;
  onOpenMenu: () => void;
}

export default function SettingsView({ currentSettingView, setCurrentSettingView, onOpenMenu }: SettingsViewProps) {
  const [categories, setCategories] = useState<CategoryExpense[]>(initialCategories);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [responsables, setResponsables] = useState<Responsable[]>(initialResponsables);
  const [priorities, setPriorities] = useState<Priority[]>(initialPriorities);
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [taxValue, setTaxValue] = useState<Tax>(initialTax);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    order: '', name: '', business: '', color: '#3b82f6', percentage: 0, estimatedTime: '', placeId: '', price: '',
    placeTasks: [] as {id: string, name: string}[] 
  });
  
  const [newTaskInput, setNewTaskInput] = useState(''); 
  const [showQuickAdd, setShowQuickAdd] = useState(false); 

  const activeSettingOption = settingsOptions.find(opt => opt.id === currentSettingView);

  // --- ESTILOS BLINDADOS (TABLAS Y MODALES) ---
  const thStyle = { backgroundColor: '#f9fafb', padding: '6px 12px', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', textAlign: 'left' as const };
  const tdStyle = { padding: '6px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '0.95rem' };

  const s = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' } as React.CSSProperties,
    modal: { backgroundColor: '#ffffff', width: '100%', maxWidth: '450px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' } as React.CSSProperties,
    modalWide: { maxWidth: '700px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.15rem', fontWeight: 600, color: '#111827', margin: 0 },
    body: { padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' } as React.CSSProperties,
    footer: { display: 'flex', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' } as React.CSSProperties,
    label: { fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 },
    input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', width: '100%', boxSizing: 'border-box', outline: 'none' } as React.CSSProperties,
    btnPrimary: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    btnOutline: { backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
    btnDangerLight: { backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex' },
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' } as React.CSSProperties,
    detailLabel: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
    detailValue: { fontSize: '1.05rem', color: '#111827', fontWeight: 500 }
  };

  const handleOpenForm = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ 
        order: item.order || '', name: item.name || '', business: item.business || '', 
        color: item.color || '#3b82f6', percentage: item.percentage || 0, estimatedTime: item.estimatedTime || '',
        placeId: item.placeId || '', price: item.price || '',
        placeTasks: currentSettingView === 'place' ? tasks.filter(t => t.placeId === item.id).map(t => ({id: t.id, name: t.name})) : []
      });
    } else {
      setSelectedItem(null);
      setFormData({ order: '', name: '', business: '', color: '#3b82f6', percentage: 0, estimatedTime: '', placeId: '', price: '', placeTasks: [] });
    }
    setNewTaskInput('');
    setIsDetailModalOpen(false); 
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setSelectedItem(null);
  };

  const handleColorTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val.replace(/#/g, '');
    if (val.length > 7) val = val.slice(0, 7);
    setFormData({ ...formData, color: val });
  };

  const handleAddTempTask = (e?: React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (newTaskInput.trim() === '') return;
    setFormData({ ...formData, placeTasks: [...formData.placeTasks, { id: '', name: newTaskInput }] });
    setNewTaskInput('');
  };

  const handleQuickAddTask = () => {
    if (newTaskInput.trim() === '') return;
    const newTask: Task = { id: Date.now().toString(), placeId: selectedItem.id, name: newTaskInput };
    setTasks([...tasks, newTask]);
    setNewTaskInput('');
    setShowQuickAdd(false);
  };

  const confirmDeleteTask = (taskId: string) => {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleSave = () => {
    if (currentSettingView === 'tax') {
      setTaxValue({ ...taxValue, percentage: Number(formData.percentage) });
      handleCloseForm(); return;
    }

    if (currentSettingView === 'task' && !formData.placeId) {
      alert("Please select a Place."); return;
    }

    if (formData.name.trim() === '') return;
    
    if (currentSettingView === 'category') {
      if (selectedItem) setCategories(categories.map(c => c.id === selectedItem.id ? { ...c, name: formData.name } : c));
      else setCategories([...categories, { id: Date.now().toString(), name: formData.name }]);
    } 
    else if (currentSettingView === 'place') {
      const placeId = selectedItem ? selectedItem.id : Date.now().toString();
      if (selectedItem) setPlaces(places.map(p => p.id === placeId ? { ...p, name: formData.name } : p));
      else setPlaces([...places, { id: placeId, name: formData.name }]);
      
      const otherTasks = tasks.filter(t => t.placeId !== placeId); 
      const newTasks = formData.placeTasks.map(pt => ({
        id: pt.id || Date.now().toString() + Math.random().toString(), 
        placeId: placeId, name: pt.name
      }));
      setTasks([...otherTasks, ...newTasks]); 
    }
    else if (currentSettingView === 'task') {
      if (selectedItem) setTasks(tasks.map(t => t.id === selectedItem.id ? { ...t, name: formData.name, placeId: formData.placeId } : t));
      else setTasks([...tasks, { id: Date.now().toString(), name: formData.name, placeId: formData.placeId }]);
    }
    else if (currentSettingView === 'team') {
      if (selectedItem) setTeams(teams.map(t => t.id === selectedItem.id ? { ...t, name: formData.name, business: formData.business, color: formData.color } : t));
      else setTeams([...teams, { id: Date.now().toString(), name: formData.name, business: formData.business, color: formData.color }]);
    }
    else if (currentSettingView === 'status') {
      if (selectedItem) setStatuses(statuses.map(s => s.id === selectedItem.id ? { ...s, order: formData.order, name: formData.name, business: formData.business, color: formData.color } : s));
      else setStatuses([...statuses, { id: Date.now().toString(), order: formData.order, name: formData.name, business: formData.business, color: formData.color }]);
    }
    else if (currentSettingView === 'product') {
      if (selectedItem) setProducts(products.map(p => p.id === selectedItem.id ? { ...p, name: formData.name, price: formData.price } : p));
      else setProducts([...products, { id: Date.now().toString(), name: formData.name, price: formData.price }]);
    }
    else if (currentSettingView === 'business') {
      if (selectedItem) setBusinesses(businesses.map(b => b.id === selectedItem.id ? { ...b, name: formData.name } : b));
      else setBusinesses([...businesses, { id: Date.now().toString(), name: formData.name }]);
    }
    else if (currentSettingView === 'responsable') {
      if (selectedItem) setResponsables(responsables.map(r => r.id === selectedItem.id ? { ...r, name: formData.name, color: formData.color } : r));
      else setResponsables([...responsables, { id: Date.now().toString(), name: formData.name, color: formData.color }]);
    }
    else if (currentSettingView === 'priority') {
      if (selectedItem) setPriorities(priorities.map(p => p.id === selectedItem.id ? { ...p, name: formData.name, business: formData.business, color: formData.color } : p));
      else setPriorities([...priorities, { id: Date.now().toString(), name: formData.name, business: formData.business, color: formData.color }]);
    }
    else if (currentSettingView === 'service') {
      if (selectedItem) setServices(services.map(s => s.id === selectedItem.id ? { ...s, name: formData.name, estimatedTime: formData.estimatedTime, business: formData.business } : s));
      else setServices([...services, { id: Date.now().toString(), name: formData.name, estimatedTime: formData.estimatedTime, business: formData.business }]);
    }
    else if (currentSettingView === 'payment') {
      if (selectedItem) setPaymentMethods(paymentMethods.map(p => p.id === selectedItem.id ? { ...p, name: formData.name } : p));
      else setPaymentMethods([...paymentMethods, { id: Date.now().toString(), name: formData.name }]);
    }
    
    handleCloseForm();
  };

  const handleOpenDetail = (item: any) => {
    setSelectedItem(item);
    setNewTaskInput('');
    setShowQuickAdd(false);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (currentSettingView === 'category') setCategories(categories.filter(c => c.id !== itemToDelete));
      else if (currentSettingView === 'place') {
        setPlaces(places.filter(p => p.id !== itemToDelete));
        setTasks(tasks.filter(t => t.placeId !== itemToDelete));
      }
      else if (currentSettingView === 'task') setTasks(tasks.filter(t => t.id !== itemToDelete));
      else if (currentSettingView === 'team') setTeams(teams.filter(t => t.id !== itemToDelete));
      else if (currentSettingView === 'status') setStatuses(statuses.filter(s => s.id !== itemToDelete));
      else if (currentSettingView === 'product') setProducts(products.filter(p => p.id !== itemToDelete));
      else if (currentSettingView === 'business') setBusinesses(businesses.filter(b => b.id !== itemToDelete));
      else if (currentSettingView === 'responsable') setResponsables(responsables.filter(r => r.id !== itemToDelete));
      else if (currentSettingView === 'priority') setPriorities(priorities.filter(p => p.id !== itemToDelete));
      else if (currentSettingView === 'service') setServices(services.filter(s => s.id !== itemToDelete));
      else if (currentSettingView === 'payment') setPaymentMethods(paymentMethods.filter(p => p.id !== itemToDelete));
      
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false); 
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const placeA = places.find(p => p.id === a.placeId)?.name || '';
    const placeB = places.find(p => p.id === b.placeId)?.name || '';
    return placeA.localeCompare(placeB);
  });

  return (
    <div className="settings-wrapper fade-in" style={{ padding: '20px' }}>
      {currentSettingView === 'menu' && (
        <>
          <header className="settings-header">
            <div className="header-titles">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <h2 style={{ margin: 0 }}>Settings</h2>
              </div>
              <p style={{ marginTop: '4px', color: '#6b7280' }}>Manage your system parameters and lists</p>
            </div>
          </header>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button 
                  key={option.id} 
                  onClick={() => setCurrentSettingView(option.id)}
                  style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#111827', transition: 'all 0.2s ease', width: '100%', outline: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 500 }}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {currentSettingView !== 'menu' && activeSettingOption && (
        <div className="table-view-container fade-in">
          <header className="table-view-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div className="table-view-title-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: '#111827' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', fontFamily: 'monospace' }} onClick={() => setCurrentSettingView('menu')}>&lt;&lt; Back</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <activeSettingOption.icon size={28} color="#3b82f6" />
                <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111827' }}>{activeSettingOption.label}</h2>
              </div>
            </div>
            {currentSettingView !== 'tax' && (
              <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 20px', height: '42px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}><Plus size={18} /> Add New</button>
            )}
          </header>

          {/* TABLA DE CONFIGURACIONES BLINDADA */}
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {currentSettingView === 'status' && <th style={thStyle}>Order</th>}
                    {currentSettingView === 'task' && <th style={thStyle}>Place</th>}
                    
                    {currentSettingView === 'task' ? <th style={thStyle}>Task</th> : 
                     currentSettingView === 'tax' ? <th style={thStyle}>Tax %</th> : 
                     currentSettingView === 'business' ? <th style={thStyle}>Business</th> : 
                     currentSettingView === 'payment' ? <th style={thStyle}>Payment Method</th> :
                     <th style={thStyle}>Name</th>}
                    
                    {currentSettingView === 'product' && <th style={thStyle}>Price</th>}
                    {currentSettingView === 'service' && <th style={thStyle}>Estimated time</th>}
                    
                    {(currentSettingView === 'team' || currentSettingView === 'priority' || currentSettingView === 'status' || currentSettingView === 'service') && <th style={thStyle}>Business</th>}
                    {(currentSettingView === 'team' || currentSettingView === 'responsable' || currentSettingView === 'priority' || currentSettingView === 'status') && <th style={thStyle}>Color</th>}
                    
                    <th style={{...thStyle, textAlign: 'right', width: '100px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSettingView === 'category' && categories.map((cat) => (
                    <tr key={cat.id} onClick={() => handleOpenDetail(cat)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{cat.name}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(cat); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'team' && teams.map((team) => (
                    <tr key={team.id} onClick={() => handleOpenDetail(team)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{team.name}</td><td style={{...tdStyle, color: '#6b7280'}}>{team.business || '-'}</td><td style={tdStyle}><span className="color-dot" style={{ backgroundColor: team.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%' }}></span></td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(team); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(team.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'responsable' && responsables.map((resp) => (
                    <tr key={resp.id} onClick={() => handleOpenDetail(resp)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{resp.name}</td><td style={tdStyle}><span className="color-dot" style={{ backgroundColor: resp.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%' }}></span></td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(resp); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(resp.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'priority' && priorities.map((priority) => (
                    <tr key={priority.id} onClick={() => handleOpenDetail(priority)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{priority.name}</td><td style={{...tdStyle, color: '#6b7280'}}>{priority.business || '-'}</td><td style={tdStyle}><span className="color-dot" style={{ backgroundColor: priority.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%' }}></span></td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(priority); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(priority.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'status' && statuses.map((status) => (
                    <tr key={status.id} onClick={() => handleOpenDetail(status)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{status.order}</td><td style={tdStyle}>{status.name}</td><td style={{...tdStyle, color: '#6b7280'}}>{status.business || '-'}</td><td style={tdStyle}><span className="color-dot" style={{ backgroundColor: status.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%' }}></span></td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(status); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(status.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'place' && places.map((place) => (
                    <tr key={place.id} onClick={() => handleOpenDetail(place)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{place.name}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(place); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(place.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'task' && sortedTasks.map((task) => {
                    const placeName = places.find(p => p.id === task.placeId)?.name || 'Unknown Place';
                    return (
                      <tr key={task.id} onClick={() => handleOpenDetail(task)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{...tdStyle, color: '#6b7280'}}>{placeName}</td><td style={{...tdStyle, fontWeight: 500}}>{task.name}</td>
                        <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(task); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(task.id); }}><Trash2 size={16} /></button></div></td>
                      </tr>
                    )
                  })}

                  {currentSettingView === 'product' && products.map((product) => (
                    <tr key={product.id} onClick={() => handleOpenDetail(product)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{product.name}</td><td style={{...tdStyle, color: '#6b7280'}}>{product.price ? `$${Number(product.price).toFixed(2)}` : '-'}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(product); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(product.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'business' && businesses.map((bus) => (
                    <tr key={bus.id} onClick={() => handleOpenDetail(bus)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{bus.name}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(bus); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(bus.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}
                  
                  {currentSettingView === 'service' && services.map((srv) => (
                    <tr key={srv.id} onClick={() => handleOpenDetail(srv)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{srv.name}</td><td style={{...tdStyle, color: '#6b7280'}}>{srv.estimatedTime || '-'}</td><td style={{...tdStyle, color: '#6b7280'}}>{srv.business || '-'}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(srv); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(srv.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'payment' && paymentMethods.map((payment) => (
                    <tr key={payment.id} onClick={() => handleOpenDetail(payment)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={tdStyle}>{payment.name}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(payment); }}><Edit2 size={16} /></button><button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleDeleteClick(payment.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}

                  {currentSettingView === 'tax' && (
                    <tr onClick={() => handleOpenDetail(taxValue)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{...tdStyle, fontWeight: '500'}}>{taxValue.percentage}%</td>
                      <td style={{...tdStyle, textAlign: 'right'}}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}><button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={(e) => { e.stopPropagation(); handleOpenForm(taxValue); }}><Edit2 size={16} /></button></div></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE FORMULARIO (CREAR / EDITAR) BLINDADO --- */}
      {isFormModalOpen && (
        <div style={s.overlay} onClick={handleCloseForm}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>{selectedItem ? 'Edit' : 'New'} {activeSettingOption?.label}</h3>
              <button style={s.closeBtn} onClick={handleCloseForm}><X size={20} /></button>
            </header>
            <div style={s.body}>

              {currentSettingView === 'task' && (
                 <div style={s.formGroup}>
                  <label style={s.label}>Place <span style={{color: '#3b82f6'}}>*</span></label>
                  <select 
                    style={s.input}
                    value={formData.placeId}
                    onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                  >
                    <option value="">Select a Place...</option>
                    {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {currentSettingView === 'tax' ? (
                 <div style={s.formGroup}>
                  <label style={s.label}>Tax Percentage (%) <span style={{color: '#3b82f6'}}>*</span></label>
                  <input type="number" step="0.01" autoFocus style={s.input} value={formData.percentage} onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                </div>
              ) : (
                <>
                  {currentSettingView === 'status' && (
                    <div style={s.formGroup}>
                      <label style={s.label}>Order <span style={{color: '#3b82f6'}}>*</span></label>
                      <input type="number" autoFocus style={s.input} value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                  )}

                  <div style={s.formGroup}>
                    <label style={s.label}>
                      {currentSettingView === 'task' ? 'Task Name' : 
                       currentSettingView === 'business' ? 'Business Name' : 
                       currentSettingView === 'payment' ? 'Payment Method' : 'Name'} <span style={{color: '#3b82f6'}}>*</span>
                    </label>
                    <input type="text" autoFocus={currentSettingView !== 'status'} style={s.input} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                  </div>

                  {currentSettingView === 'product' && (
                    <div style={s.formGroup}>
                      <label style={s.label}>Price ($)</label>
                      <input type="number" step="0.01" style={s.input} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder="0.00" />
                    </div>
                  )}

                  {currentSettingView === 'service' && (
                    <div style={s.formGroup}>
                      <label style={s.label}>Estimated time (min)</label>
                      <input type="number" style={s.input} value={formData.estimatedTime} onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'priority' || currentSettingView === 'status' || currentSettingView === 'service') && (
                    <div style={s.formGroup}>
                      <label style={s.label}>Business</label>
                      <input type="text" style={s.input} value={formData.business} onChange={(e) => setFormData({ ...formData, business: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'responsable' || currentSettingView === 'priority' || currentSettingView === 'status') && (
                    <div style={s.formGroup}>
                      <label style={s.label}>Color Identifier</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="color" style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px', backgroundColor: 'transparent' }} value={formData.color.length === 7 ? formData.color : '#000000'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                        <input type="text" style={{...s.input, width: '120px', fontFamily: 'monospace'}} value={formData.color.toUpperCase()} onChange={handleColorTextChange} placeholder="#000000" />
                      </div>
                    </div>
                  )}

                  {currentSettingView === 'place' && (
                    <div style={{...s.formGroup, marginTop: '8px'}}>
                      <label style={s.label}>Tasks associated with this Place</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" style={{...s.input, flex: 1}} placeholder="Add a new task..." value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTempTask(e)} />
                        <button style={{...s.btnOutline, padding: '6px 12px'}} onClick={() => handleAddTempTask()}>Add</button>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.placeTasks.length === 0 && <li style={{ padding: '12px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '6px' }}>No tasks added yet.</li>}
                        {formData.placeTasks.map((t, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem' }}>
                            <span>{t.name}</span>
                            <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }} onClick={() => setFormData({...formData, placeTasks: formData.placeTasks.filter((_, i) => i !== idx)})}><Trash2 size={16}/></button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

            </div>
            <footer style={{...s.footer, justifyContent: 'flex-end'}}>
              <button style={s.btnOutline} onClick={handleCloseForm}>Cancel</button>
              <button style={s.btnPrimary} onClick={handleSave}>Save</button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES BLINDADO --- */}
      {isDetailModalOpen && selectedItem && (
        <div style={s.overlay} onClick={() => setIsDetailModalOpen(false)}>
          <div style={{...s.modal, ...(currentSettingView === 'place' ? s.modalWide : {})}} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>{activeSettingOption?.label} Details</h3>
              <button style={s.closeBtn} onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            <div style={s.body}>
              
              {currentSettingView === 'place' ? (
                <>
                  <div style={s.detailItem}>
                    <span style={s.detailLabel}>PLACE NAME:</span>
                    <span style={s.detailValue}>{selectedItem.name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>Associated Tasks</h4>
                    <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, cursor: 'pointer' }} onClick={() => setShowQuickAdd(!showQuickAdd)}>+ Add Task</button>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr><th style={thStyle}>TASK NAME</th><th style={{...thStyle, width: '100px', textAlign: 'right'}}>ACTION</th></tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.placeId === selectedItem.id).length === 0 && !showQuickAdd && (
                          <tr><td colSpan={2} style={{ padding: '20px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>No tasks linked.</td></tr>
                        )}
                        
                        {tasks.filter(t => t.placeId === selectedItem.id).map(t => (
                          <tr key={t.id}>
                            <td style={tdStyle}>{t.name}</td>
                            <td style={{...tdStyle, textAlign: 'right'}}><button style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 500, cursor: 'pointer' }} onClick={() => confirmDeleteTask(t.id)}>Remove</button></td>
                          </tr>
                        ))}

                        {showQuickAdd && (
                          <tr>
                            <td style={tdStyle}><input type="text" style={s.input} placeholder="Type new task and press Enter..." value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddTask(); } }} autoFocus /></td>
                            <td style={{...tdStyle, textAlign: 'right'}}><button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, cursor: 'pointer' }} onClick={handleQuickAddTask}>Save</button></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : currentSettingView === 'tax' ? (
                <div style={s.detailItem}><span style={s.detailLabel}>Current Tax</span><span style={s.detailValue}>{selectedItem.percentage}%</span></div>
              ) : (
                <>
                  {currentSettingView === 'status' && (
                    <div style={s.detailItem}><span style={s.detailLabel}>Order</span><span style={s.detailValue}>{selectedItem.order}</span></div>
                  )}
                  {currentSettingView === 'task' && (
                    <div style={s.detailItem}><span style={s.detailLabel}>Place</span><span style={s.detailValue}>{places.find(p => p.id === selectedItem.placeId)?.name || 'Unknown'}</span></div>
                  )}

                  <div style={s.detailItem}>
                    <span style={s.detailLabel}>
                      {currentSettingView === 'task' ? 'Task Name' : currentSettingView === 'business' ? 'Business Name' : currentSettingView === 'payment' ? 'Payment Method' : 'Name'}
                    </span>
                    <span style={s.detailValue}>{selectedItem.name}</span>
                  </div>

                  {currentSettingView === 'product' && (
                    <div style={s.detailItem}><span style={s.detailLabel}>Price</span><span style={s.detailValue}>{selectedItem.price ? `$${Number(selectedItem.price).toFixed(2)}` : 'N/A'}</span></div>
                  )}

                  {currentSettingView === 'service' && (
                    <div style={s.detailItem}><span style={s.detailLabel}>Estimated time (min)</span><span style={s.detailValue}>{selectedItem.estimatedTime || 'N/A'}</span></div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'priority' || currentSettingView === 'status' || currentSettingView === 'service') && (
                    <div style={s.detailItem}><span style={s.detailLabel}>Business</span><span style={s.detailValue}>{selectedItem.business || 'N/A'}</span></div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'responsable' || currentSettingView === 'priority' || currentSettingView === 'status') && (
                    <div style={s.detailItem}>
                      <span style={s.detailLabel}>Color</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <span style={{ backgroundColor: selectedItem.color, width: '24px', height: '24px', borderRadius: '50%', display: 'inline-block' }}></span>
                        <span style={{...s.detailValue, fontFamily: 'monospace'}}>{selectedItem.color.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
            
            <footer style={{...s.footer, justifyContent: currentSettingView === 'tax' ? 'flex-end' : 'space-between'}}>
              {currentSettingView !== 'tax' && (
                <button style={s.btnDangerLight} onClick={() => handleDeleteClick(selectedItem.id)}>
                  <Trash2 size={16}/> Delete {activeSettingOption?.label}
                </button>
              )}
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{...s.btnOutline, border: 'none'}} onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button style={s.btnPrimary} onClick={() => handleOpenForm(selectedItem)}>
                  <Edit2 size={16}/> Edit {activeSettingOption?.label}
                </button>
              </div>
            </footer>

          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN BLINDADO --- */}
      {isDeleteModalOpen && (
        <div style={s.overlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Confirm Deletion</h3>
              <button style={s.closeBtn} onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </header>
            <div style={s.body}>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Are you sure you want to delete this record? This action cannot be undone.</p>
            </div>
            <footer style={{...s.footer, justifyContent: 'flex-end'}}>
              <button style={s.btnOutline} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button style={{...s.btnPrimary, backgroundColor: '#ef4444'}} onClick={confirmDelete}>Delete</button>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}