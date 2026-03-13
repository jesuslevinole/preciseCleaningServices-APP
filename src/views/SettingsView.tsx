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
}

export default function SettingsView({ currentSettingView, setCurrentSettingView }: SettingsViewProps) {
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
    <div className="settings-wrapper fade-in">
      {currentSettingView === 'menu' && (
        <>
          <header className="settings-header"><h2>Settings</h2><p>Manage your system parameters and lists</p></header>
          <div className="settings-grid">
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.id} className="setting-card" onClick={() => setCurrentSettingView(option.id)}>
                  <div className="setting-card-icon"><Icon size={24} /></div><span className="setting-card-title">{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {currentSettingView !== 'menu' && activeSettingOption && (
        <div className="table-view-container fade-in">
          <header className="table-view-header">
            <div className="table-view-title-group">
              <button className="btn-back" onClick={() => setCurrentSettingView('menu')}>&lt;&lt; Back</button>
              <div className="title-with-icon"><activeSettingOption.icon size={28} className="title-icon" /><h2>{activeSettingOption.label}</h2></div>
            </div>
            {currentSettingView !== 'tax' && (
              <button className="btn-primary" onClick={() => handleOpenForm()}><Plus size={18} /> Add New</button>
            )}
          </header>

          <div className="table-container">
            <table className="data-table interactive-table">
              <thead>
                <tr>
                  {currentSettingView === 'status' && <th>Order</th>}
                  {currentSettingView === 'task' && <th>Place</th>}
                  
                  {currentSettingView === 'task' ? <th>Task</th> : 
                   currentSettingView === 'tax' ? <th>Tax %</th> : 
                   currentSettingView === 'business' ? <th>Business</th> : 
                   currentSettingView === 'payment' ? <th>Payment Method</th> :
                   <th>Name</th>}
                  
                  {currentSettingView === 'product' && <th>Price</th>}
                  {currentSettingView === 'service' && <th>Estimated time</th>}
                  
                  {(currentSettingView === 'team' || currentSettingView === 'priority' || currentSettingView === 'status' || currentSettingView === 'service') && <th>Business</th>}
                  {(currentSettingView === 'team' || currentSettingView === 'responsable' || currentSettingView === 'priority' || currentSettingView === 'status') && <th>Color</th>}
                  
                  <th className="action-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSettingView === 'category' && categories.map((cat) => (
                  <tr key={cat.id} onClick={() => handleOpenDetail(cat)}>
                    <td>{cat.name}</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(cat); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'team' && teams.map((team) => (
                  <tr key={team.id} onClick={() => handleOpenDetail(team)}>
                    <td>{team.name}</td><td className="text-secondary">{team.business || '-'}</td><td><span className="color-dot" style={{ backgroundColor: team.color }}></span></td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(team); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(team.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'responsable' && responsables.map((resp) => (
                  <tr key={resp.id} onClick={() => handleOpenDetail(resp)}>
                    <td>{resp.name}</td><td><span className="color-dot" style={{ backgroundColor: resp.color }}></span></td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(resp); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(resp.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'priority' && priorities.map((priority) => (
                  <tr key={priority.id} onClick={() => handleOpenDetail(priority)}>
                    <td>{priority.name}</td><td className="text-secondary">{priority.business || '-'}</td><td><span className="color-dot" style={{ backgroundColor: priority.color }}></span></td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(priority); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(priority.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'status' && statuses.map((status) => (
                  <tr key={status.id} onClick={() => handleOpenDetail(status)}>
                    <td>{status.order}</td><td>{status.name}</td><td className="text-secondary">{status.business || '-'}</td><td><span className="color-dot" style={{ backgroundColor: status.color }}></span></td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(status); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(status.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'place' && places.map((place) => (
                  <tr key={place.id} onClick={() => handleOpenDetail(place)}>
                    <td>{place.name}</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(place); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(place.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'task' && sortedTasks.map((task) => {
                  const placeName = places.find(p => p.id === task.placeId)?.name || 'Unknown Place';
                  return (
                    <tr key={task.id} onClick={() => handleOpenDetail(task)}>
                      <td className="text-secondary">{placeName}</td><td style={{ fontWeight: '500' }}>{task.name}</td>
                      <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(task); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(task.id); }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  )
                })}

                {currentSettingView === 'product' && products.map((product) => (
                  <tr key={product.id} onClick={() => handleOpenDetail(product)}>
                    <td>{product.name}</td><td className="text-secondary">{product.price ? `$${Number(product.price).toFixed(2)}` : '-'}</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(product); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(product.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'business' && businesses.map((bus) => (
                  <tr key={bus.id} onClick={() => handleOpenDetail(bus)}>
                    <td>{bus.name}</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(bus); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(bus.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
                
                {currentSettingView === 'service' && services.map((srv) => (
                  <tr key={srv.id} onClick={() => handleOpenDetail(srv)}>
                    <td>{srv.name}</td><td className="text-secondary">{srv.estimatedTime || '-'}</td><td className="text-secondary">{srv.business || '-'}</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(srv); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(srv.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'payment' && paymentMethods.map((payment) => (
                  <tr key={payment.id} onClick={() => handleOpenDetail(payment)}>
                    <td>{payment.name}</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(payment); }}><Edit2 size={16} /></button><button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(payment.id); }}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}

                {currentSettingView === 'tax' && (
                  <tr onClick={() => handleOpenDetail(taxValue)}>
                    <td style={{ fontWeight: '500' }}>{taxValue.percentage}%</td>
                    <td className="action-column"><div className="action-group"><button className="btn-icon edit" onClick={(e) => { e.stopPropagation(); handleOpenForm(taxValue); }}><Edit2 size={16} /></button></div></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL DE FORMULARIO (CREAR / EDITAR) --- */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{selectedItem ? 'Edit' : 'New'} {activeSettingOption?.label}</h3>
              <button className="btn-icon close" onClick={handleCloseForm}><X size={20} /></button>
            </header>
            <div className="modal-body">

              {currentSettingView === 'task' && (
                 <div className="form-group mb-16">
                  <label>Place <span className="required">*</span></label>
                  <select 
                    className="select-input"
                    value={formData.placeId}
                    onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                  >
                    <option value="">Select a Place...</option>
                    {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {currentSettingView === 'tax' ? (
                 <div className="form-group">
                  <label>Tax Percentage (%) <span className="required">*</span></label>
                  <input type="number" step="0.01" autoFocus className="white-input" value={formData.percentage} onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                </div>
              ) : (
                <>
                  {currentSettingView === 'status' && (
                    <div className="form-group mb-16" style={{ marginBottom: '16px' }}>
                      <label>Order <span className="required">*</span></label>
                      <input type="number" autoFocus className="white-input" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                  )}

                  <div className="form-group">
                    <label>
                      {currentSettingView === 'task' ? 'Task Name' : 
                       currentSettingView === 'business' ? 'Business Name' : 
                       currentSettingView === 'payment' ? 'Payment Method' : 'Name'} <span className="required">*</span>
                    </label>
                    <input type="text" autoFocus={currentSettingView !== 'status'} className="white-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                  </div>

                  {currentSettingView === 'product' && (
                    <div className="form-group mt-16">
                      <label>Price ($)</label>
                      <input type="number" step="0.01" className="white-input" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder="0.00" />
                    </div>
                  )}

                  {currentSettingView === 'service' && (
                    <div className="form-group mt-16">
                      <label>Estimated time (min)</label>
                      <input type="number" className="white-input" value={formData.estimatedTime} onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'priority' || currentSettingView === 'status' || currentSettingView === 'service') && (
                    <div className="form-group mt-16">
                      <label>Business</label>
                      <input type="text" className="white-input" value={formData.business} onChange={(e) => setFormData({ ...formData, business: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'responsable' || currentSettingView === 'priority' || currentSettingView === 'status') && (
                    <div className="form-group mt-16">
                      <label>Color Identifier</label>
                      <div className="color-picker-wrapper">
                        <input type="color" className="color-input" value={formData.color.length === 7 ? formData.color : '#000000'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                        <input type="text" className="color-hex-input" value={formData.color.toUpperCase()} onChange={handleColorTextChange} placeholder="#000000" />
                      </div>
                    </div>
                  )}

                  {currentSettingView === 'place' && (
                    <div className="form-group mt-16">
                      <label>Tasks associated with this Place</label>
                      <div className="quick-add-wrapper">
                        <input type="text" className="white-input quick-add-input" placeholder="Add a new task..." value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTempTask(e)} />
                        <button className="btn-outline" onClick={() => handleAddTempTask()}>Add</button>
                      </div>
                      <ul className="task-list">
                        {formData.placeTasks.length === 0 && <li className="empty-cell" style={{padding: '10px'}}>No tasks added yet.</li>}
                        {formData.placeTasks.map((t, idx) => (
                          <li key={idx} className="task-list-item"><span>{t.name}</span><button className="btn-icon delete" onClick={() => setFormData({...formData, placeTasks: formData.placeTasks.filter((_, i) => i !== idx)})}><Trash2 size={16}/></button></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

            </div>
            <footer className="modal-footer">
              <button className="btn-outline" onClick={handleCloseForm}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES --- */}
      {isDetailModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className={`modal-content ${currentSettingView === 'place' ? 'modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{activeSettingOption?.label} Details</h3>
              <button className="btn-icon close" onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            <div className="modal-body detail-body">
              
              {currentSettingView === 'place' ? (
                <>
                  <div className="detail-info-card">
                    <div className="detail-item">
                      <span className="detail-label">PLACE NAME:</span>
                      <span className="detail-value">{selectedItem.name}</span>
                    </div>
                  </div>

                  <div className="section-header">
                    <h4>Associated Tasks</h4>
                    <button className="btn-link" onClick={() => setShowQuickAdd(!showQuickAdd)}>+ Add Task</button>
                  </div>

                  <table className="associated-table">
                    <thead>
                      <tr><th>TASK NAME</th><th style={{ width: '100px', textAlign: 'right' }}>ACTION</th></tr>
                    </thead>
                    <tbody>
                      {tasks.filter(t => t.placeId === selectedItem.id).length === 0 && !showQuickAdd && (
                        <tr><td colSpan={2} className="empty-cell" style={{padding: '20px'}}>No tasks linked.</td></tr>
                      )}
                      
                      {tasks.filter(t => t.placeId === selectedItem.id).map(t => (
                        <tr key={t.id}>
                          <td>{t.name}</td>
                          <td style={{ textAlign: 'right' }}><button className="btn-text-danger" onClick={() => confirmDeleteTask(t.id)}>Remove</button></td>
                        </tr>
                      ))}

                      {showQuickAdd && (
                        <tr>
                          <td><input type="text" className="white-input" style={{ width: '100%', padding: '6px 10px' }} placeholder="Type new task and press Enter..." value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddTask(); } }} autoFocus /></td>
                          <td style={{ textAlign: 'right' }}><button className="btn-link" onClick={handleQuickAddTask}>Save</button></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : currentSettingView === 'tax' ? (
                <div className="detail-item"><span className="detail-label">Current Tax</span><span className="detail-value">{selectedItem.percentage}%</span></div>
              ) : (
                <>
                  {currentSettingView === 'status' && (
                    <div className="detail-item"><span className="detail-label">Order</span><span className="detail-value">{selectedItem.order}</span></div>
                  )}
                  {currentSettingView === 'task' && (
                    <div className="detail-item"><span className="detail-label">Place</span><span className="detail-value">{places.find(p => p.id === selectedItem.placeId)?.name || 'Unknown'}</span></div>
                  )}

                  <div className={`detail-item ${(currentSettingView === 'task' || currentSettingView === 'status') ? 'mt-16' : ''}`}>
                    <span className="detail-label">
                      {currentSettingView === 'task' ? 'Task Name' : currentSettingView === 'business' ? 'Business Name' : currentSettingView === 'payment' ? 'Payment Method' : 'Name'}
                    </span>
                    <span className="detail-value">{selectedItem.name}</span>
                  </div>

                  {currentSettingView === 'product' && (
                    <div className="detail-item mt-16"><span className="detail-label">Price</span><span className="detail-value">{selectedItem.price ? `$${Number(selectedItem.price).toFixed(2)}` : 'N/A'}</span></div>
                  )}

                  {currentSettingView === 'service' && (
                    <div className="detail-item mt-16"><span className="detail-label">Estimated time (min)</span><span className="detail-value">{selectedItem.estimatedTime || 'N/A'}</span></div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'priority' || currentSettingView === 'status' || currentSettingView === 'service') && (
                    <div className="detail-item mt-16"><span className="detail-label">Business</span><span className="detail-value">{selectedItem.business || 'N/A'}</span></div>
                  )}

                  {(currentSettingView === 'team' || currentSettingView === 'responsable' || currentSettingView === 'priority' || currentSettingView === 'status') && (
                    <div className="detail-item mt-16"><span className="detail-label">Color</span><div className="color-picker-wrapper mt-4"><span className="color-dot large" style={{ backgroundColor: selectedItem.color }}></span><span className="detail-value">{selectedItem.color.toUpperCase()}</span></div></div>
                  )}
                </>
              )}

            </div>
            
            <footer className={`modal-footer ${currentSettingView === 'tax' ? 'justify-end' : 'footer-layout-custom'}`}>
              {currentSettingView !== 'tax' && (
                <button className="btn-danger-light" onClick={() => handleDeleteClick(selectedItem.id)}>
                  Delete {activeSettingOption?.label}
                </button>
              )}
              
              <div className="footer-right-group">
                <button className="btn-text" onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button className="btn-primary" onClick={() => handleOpenForm(selectedItem)}>
                  Edit {activeSettingOption?.label}
                </button>
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
            <div className="modal-body"><p className="text-secondary">Are you sure you want to delete this record? This action cannot be undone.</p></div>
            <footer className="modal-footer"><button className="btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button><button className="btn-primary danger-bg" onClick={confirmDelete}>Delete</button></footer>
          </div>
        </div>
      )}

    </div>
  );
}