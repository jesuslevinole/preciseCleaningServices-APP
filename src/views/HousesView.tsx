import { useState, useEffect } from 'react';
import { 
  Search, MapPin, Plus, X, Edit2, Trash2, 
  Activity, FileText, CalendarDays, Clock, User, Wrench, Hash, Flag, Users, StickyNote, PenTool, Home, ChevronDown, ClipboardCheck,
  Bell, Briefcase, ShieldCheck, AlertTriangle
} from 'lucide-react';
import type { Property, Status, Team, Priority, Service } from '../types';

// IMPORTAMOS NUESTRO SERVICIO DE FIREBASE (El que acabamos de corregir en el Paso 1)
import { propertiesService } from '../services/propertiesService';

const mockStatuses: Status[] = [
  { id: '1', order: 1, name: 'PENDING ASSESSMENT', business: 'Regular', color: '#3b82f6' }, 
  { id: '2', order: 2, name: 'NEEDS TO BE SCHEDULE', business: 'Regular', color: '#8b5cf6' }, 
  { id: '3', order: 3, name: 'SCHEDULE PENDING', business: 'Regular', color: '#ef4444' }, 
  { id: '4', order: 4, name: 'IN PROGRESS', business: 'Regular , Cavalry', color: '#f59e0b' } 
].sort((a, b) => Number(a.order) - Number(b.order));

const mockTeams: Team[] = [
  { id: '1', name: 'Equipo A', business: '', color: '#10b981' },
  { id: '2', name: 'Equipo B', business: '', color: '#f59e0b' },
  { id: '3', name: 'Equipo C', business: '', color: '#9ca3af' },
];

const mockPriorities: Priority[] = [
  { id: '1', name: 'HIGH', business: 'a', color: '#ef4444' },
  { id: '2', name: 'MEDIUM', business: '', color: '#eab308' },
  { id: '3', name: 'LOW', business: '', color: '#22c55e' }
];

const mockServices: Service[] = [
  { id: 's1', name: 'Deep Clean', estimatedTime: '', business: '' },
  { id: 's2', name: 'Oficina', estimatedTime: '120', business: '' },
  { id: 's3', name: 'Regular', estimatedTime: '90', business: '' },
  { id: 's4', name: 'Move-Out', estimatedTime: '150', business: '' }
];

// Selector personalizado y responsivo
const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.id === value);

  return (
    <div tabIndex={0} onBlur={() => setIsOpen(false)} style={{ position: 'relative', width: '100%', outline: 'none' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', position: 'relative' }}
      >
        <Icon size={16} style={{ position: 'absolute', left: '14px', color: '#6b7280' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selected?.color && <span style={{ backgroundColor: selected.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
          <span style={{ color: selected ? '#111827' : '#9ca3af' }}>{selected ? selected.name : placeholder}</span>
        </div>
        <ChevronDown size={16} color="#9ca3af" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '220px', overflowY: 'auto', marginTop: '4px' }}>
          <div style={{ padding: '12px 14px', cursor: 'pointer', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }} onMouseDown={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}>
            None / Unassigned
          </div>
          {options.map((o: any) => (
            <div 
              key={o.id} 
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
              onMouseDown={(e) => { e.preventDefault(); onChange(o.id); setIsOpen(false); }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {o.color && <span style={{ backgroundColor: o.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 }}></span>}
              <span style={{ color: '#111827', fontWeight: 500 }}>{o.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface HousesViewProps {
  onOpenMenu: () => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  onCheckHouse: (house: Property) => void;
}

export default function HousesView({ onOpenMenu, properties, setProperties, onCheckHouse }: HousesViewProps) {
  
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);
  
  // Estado para manejar las cargas asíncronas de Firebase
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Property>({
    id: '', statusId: '', invoiceStatus: '', receiveDate: '', scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: ''
  });

  // --- TRAER DATOS DE FIREBASE AL CARGAR LA VISTA ---
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await propertiesService.getAll();
        // Si hay datos en Firebase, sobreescribimos los mocks que venían por prop
        if(data.length > 0) {
          setProperties(data);
        }
      } catch (error) {
        console.error("Error al cargar propiedades desde Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [setProperties]);

  // --- ESTILOS INLINE BLINDADOS ---
  const s = {
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 },
    body: { padding: '30px', overflowY: 'auto' } as React.CSSProperties,
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,
    footerBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', flexShrink: 0, flexWrap: 'wrap' } as React.CSSProperties,

    label: { fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' } as React.CSSProperties,
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' } as React.CSSProperties,
    icon: { position: 'absolute', left: '14px', color: '#6b7280', pointerEvents: 'none' } as React.CSSProperties,
    input: { backgroundColor: '#ffffff', padding: '12px 14px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' } as React.CSSProperties,

    btnPrimary: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: isSaving ? 0.7 : 1 } as React.CSSProperties,
    btnOutline: { backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' } as React.CSSProperties,
    btnDangerLight: { backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '4px' },

    detailBanner: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', backgroundColor: '#eff6ff', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' } as React.CSSProperties,
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' } as React.CSSProperties,
    detailLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
    detailValue: { fontSize: '1.05rem', color: '#111827', fontWeight: 500, marginTop: '4px', whiteSpace: 'pre-wrap' } as React.CSSProperties,
    noteBoxGray: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%' } as React.CSSProperties,
    noteBoxOrange: { backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #ffedd5', width: '100%' } as React.CSSProperties,

    dashGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' },
    kpiCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
    kpiIconBox: (color: string) => ({ backgroundColor: `${color}15`, color: color, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    mainColumns: { display: 'flex', gap: '24px', flexWrap: 'wrap' as const },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '16px' } as React.CSSProperties,
    pillBtn: (active: boolean) => ({ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: active ? '#10b981' : 'transparent', color: active ? 'white' : '#6b7280', transition: 'all 0.2s', whiteSpace: 'nowrap' as const }),

    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' as const },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827', verticalAlign: 'middle' as const },
    statusPill: (statusId: string) => {
      let bg = '#dbeafe', color = '#3b82f6', text = 'Programado';
      if (statusId === '4') { bg = '#fef3c7'; color = '#d97706'; text = 'En Proceso'; }
      if (statusId === '2') { bg = '#ede9fe'; color = '#7c3aed'; text = 'QC'; }
      if (statusId === '3') { bg = '#fee2e2'; color = '#dc2626'; text = 'Recall'; }
      return { bg, color, text };
    }
  };

  const handleOpenForm = (house?: Property) => {
    if (house) {
      setFormData(house);
    } else {
      setFormData({ id: '', statusId: mockStatuses[0]?.id || '', invoiceStatus: 'Pending', receiveDate: new Date().toISOString().split('T')[0], scheduleDate: '', client: '', note: '', address: '', employeeNote: '', serviceId: '', rooms: '1', bathrooms: '1', priorityId: '', teamId: '', timeIn: '', timeOut: '' });
    }
    setSelectedHouse(house || null);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setSelectedHouse(null);
  };

  // --- FUNCIÓN ASÍNCRONA PARA GUARDAR EN FIREBASE ---
  const handleSave = async () => {
    if (!formData.address) return alert("Address is required.");
    if (!formData.statusId) return alert("Status is required.");

    setIsSaving(true);
    try {
      if (selectedHouse && selectedHouse.id) {
        const { id, ...dataToUpdate } = formData; 
        await propertiesService.update(selectedHouse.id, dataToUpdate);
        setProperties(properties.map(p => p.id === selectedHouse.id ? { ...formData } : p));
      } else {
        const { id, ...dataToAdd } = formData; 
        const completeData = {
          ...dataToAdd,
          description: `${formData.client} - ${formData.rooms} rooms`,
          city: 'TBD',
          size: 'TBD'
        };

        const newId = await propertiesService.create(completeData as unknown as Omit<Property, 'id'>);
        setProperties([...properties, { ...formData, id: newId, description: completeData.description, city: completeData.city, size: completeData.size }]);
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al intentar guardar la propiedad en Firebase.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- FUNCIÓN ASÍNCRONA PARA ELIMINAR EN FIREBASE ---
  const handleDelete = async () => {
    if(!selectedHouse) return;
    
    setIsSaving(true);
    try {
      await propertiesService.delete(selectedHouse.id);
      setProperties(properties.filter(p => p.id !== selectedHouse.id));
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al intentar eliminar la propiedad.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDetail = (house: Property) => {
    setSelectedHouse(house);
    setIsDetailModalOpen(true);
  };

  const invoiceOptions = [{ id: 'Needs Invoice', name: 'Needs Invoice' }, { id: 'Pending', name: 'Pending' }, { id: 'Paid', name: 'Paid' }];
  const roomOptions = [1, 2, 3, 4, 5].map(n => ({ id: String(n), name: String(n) }));

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  return (
    <div className="fade-in" style={{ padding: '20px' }}>

      {/* INYECCIÓN DE ESTILOS ESTRATÉGICOS MEJORADA */}
      <style>{`
        /* Overlay Centrado Absoluto: Flexbox centrará el hijo automáticamente en ambas dimensiones */
        .modal-overlay-centered {
          position: fixed;
          inset: 0; 
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          box-sizing: border-box;
        }

        /* Modal Dinámico (70% en PC, ancho total en Móvil) - Sin margin:auto problemático */
        .modal-70 {
          background-color: #ffffff;
          width: 100%;
          max-width: 1000px;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        
        @media (min-width: 769px) {
          .modal-70 { width: 70%; }
        }

        /* Rejilla Perfecta de 3 Columnas */
        .grid-3-cols {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }
        
        /* El elemento ocupa todo el ancho del grid */
        .col-span-full { grid-column: 1 / -1; }

        /* Conversión de Tabla a Tarjetas (Mobile First) */
        @media (max-width: 768px) {
          .grid-3-cols { grid-template-columns: 1fr; gap: 16px; }
          
          /* Esconder cabecera real de tabla */
          .responsive-table thead { display: none; }
          
          /* Convertir fila en tarjeta vertical */
          .responsive-table tr {
            display: flex;
            flex-direction: column;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 16px;
            padding: 16px;
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          /* Convertir celda en renglón flex (label a la izquierda, valor a la derecha) */
          .responsive-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
            text-align: right;
            white-space: normal !important;
          }
          
          .responsive-table td:last-child { border-bottom: none; padding-bottom: 0; }
          
          /* Etiqueta inyectada dinámicamente desde el HTML */
          .responsive-table td::before {
            content: attr(data-label);
            font-weight: 700;
            color: #6b7280;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .mobile-client-cell { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
        }
      `}</style>

      {/* HEADER TIPO DASHBOARD */}
      <header className="main-header dashboard-header-container">
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 style={{ margin: 0, color: '#111827', fontSize: '1.8rem', fontWeight: 700 }}>Dashboard</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Vista general de operaciones</p>
        </div>

        <div className="dashboard-actions-wrapper">
          <div className="search-box-container" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '0 16px', height: '42px', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="#9ca3af" />
            <input type="text" placeholder="Buscar trabajo..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px', fontSize: '0.9rem', width: '100%', color: '#111827' }} />
          </div>
          <button className="bell-btn-mobile" style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
            <Bell size={18} />
          </button>
          <button className="add-btn-mobile" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '0 20px', height: '42px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0 }}>
            <Plus size={16} /> Nuevo Trabajo
          </button>
        </div>
      </header>

      {/* KPI CARDS SUPERIORES */}
      <div className="dash-grid">
        <div style={s.kpiCard}>
          <div style={s.kpiIconBox('#10b981')}><Briefcase size={22} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Trabajos hoy</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>{isLoading ? '...' : properties.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+3 vs ayer</div>
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={s.kpiIconBox('#f59e0b')}><Clock size={22} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>En Proceso</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>{isLoading ? '...' : properties.filter(p => p.statusId === '4').length}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>2 equipos activos</div>
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={s.kpiIconBox('#8b5cf6')}><ShieldCheck size={22} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>QC Pendiente</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>{isLoading ? '...' : properties.filter(p => p.statusId === '2').length}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Esperando revisión</div>
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={s.kpiIconBox('#ef4444')}><AlertTriangle size={22} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Recalls</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>{isLoading ? '...' : properties.filter(p => p.statusId === '3').length}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Esta semana</div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL A 2 COLUMNAS */}
      <div className="main-columns">

        {/* COLUMNA IZQUIERDA: TRABAJOS DEL DÍA */}
        <div className="left-col">
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={s.tableHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: 700 }}>Trabajos del Día</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>{dateCapitalized}</p>
              </div>

              <div className="dashboard-filters">
                <button onClick={() => setActiveFilter('Todos')} style={s.pillBtn(activeFilter === 'Todos')}>Todos</button>
                <button onClick={() => setActiveFilter('Programado')} style={s.pillBtn(activeFilter === 'Programado')}>Programado</button>
                <button onClick={() => setActiveFilter('En Proceso')} style={s.pillBtn(activeFilter === 'En Proceso')}>En Proceso</button>
                <button onClick={() => setActiveFilter('QC')} style={s.pillBtn(activeFilter === 'QC')}>QC</button>
              </div>
            </div>

            {/* TABLA RESPONSIVA */}
            <div style={{ overflowX: 'auto', padding: '10px 20px 20px 20px' }}>
              <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                <thead>
                  <tr>
                    <th style={s.th}>ID</th>
                    <th style={s.th}>Cliente</th>
                    <th style={s.th}>Hora</th>
                    <th style={s.th}>Tipo</th>
                    <th style={s.th}>Equipo</th>
                    <th style={s.th}>Estado</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>Cargando trabajos...</td></tr>
                  ) : properties.map((prop, idx) => {
                    const statusInfo = s.statusPill(prop.statusId);
                    const teamName = mockTeams.find(t => t.id === prop.teamId)?.name || 'Sin Asignar';
                    const serviceName = mockServices.find(srv => srv.id === prop.serviceId)?.name || 'Regular';
                    const mockId = prop.id.length > 5 ? prop.id.substring(0, 6) : `J-104${idx + 2}`;

                    return (
                      <tr
                        key={prop.id}
                        onClick={() => handleOpenDetail(prop)}
                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                      >
                        <td data-label="ID" style={{ ...s.td, color: '#6b7280', fontSize: '0.85rem', fontFamily: 'monospace' }}>{mockId}</td>
                        <td data-label="Cliente" style={s.td}>
                          <div className="mobile-client-cell">
                            <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{prop.client}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {prop.address}
                            </div>
                          </div>
                        </td>
                        <td data-label="Hora" style={{ ...s.td, color: '#6b7280' }}><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {prop.timeIn || '08:00 AM'}</td>
                        <td data-label="Tipo" style={{ ...s.td, fontWeight: 500 }}>{serviceName}</td>
                        <td data-label="Equipo" style={{ ...s.td, color: '#6b7280' }}>{teamName}</td>
                        <td data-label="Estado" style={s.td}>
                          <span style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusInfo.color }}></span>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td data-label="Acción" style={{ ...s.td, textAlign: 'right' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); onCheckHouse(prop); }}
                            style={{ background: 'none', border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#111827', fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                          >
                            <ClipboardCheck size={14} /> Check
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EQUIPOS ACTIVOS */}
        <div className="right-col">
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#111827', fontWeight: 700 }}>Equipos Activos</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '1px solid #f1f5f9', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Users size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Equipo A</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Garcia Family - QC</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>3 miembros</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '12px' }}>
                  <div style={{ width: '85%', height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                </div>
              </div>

              <div style={{ border: '1px solid #f1f5f9', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Users size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Equipo B</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Downtown Office Co.</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>2 miembros</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '12px' }}>
                  <div style={{ width: '45%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- MODAL DE FORMULARIO (3 COLUMN GRID) --- */}
      {isFormModalOpen && (
        <div className="modal-overlay-centered" onClick={handleCloseForm}>
          <div className="modal-70" onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>{selectedHouse ? 'Edit Property Details' : 'Register New Property'}</h3>
              <button style={s.closeBtn} onClick={handleCloseForm}><X size={24} /></button>
            </header>

            <div style={s.body}>
              <div className="grid-3-cols">

                <div>
                  <label style={s.label}>Client</label>
                  <div style={s.inputWrapper}>
                    <User style={s.icon} size={16} />
                    <input type="text" style={s.input} placeholder="Type client name..." value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Address <span style={{ color: '#3b82f6' }}>*</span></label>
                  <div style={s.inputWrapper}>
                    <MapPin style={s.icon} size={16} />
                    <input type="text" style={s.input} placeholder="Enter full address..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Status <span style={{ color: '#3b82f6' }}>*</span></label>
                  <CustomSelect options={mockStatuses} value={formData.statusId} onChange={(val: string) => setFormData({ ...formData, statusId: val })} placeholder="Select Status..." icon={Activity} />
                </div>

                <div>
                  <label style={s.label}>Invoice Status</label>
                  <CustomSelect options={invoiceOptions} value={formData.invoiceStatus} onChange={(val: any) => setFormData({ ...formData, invoiceStatus: val })} placeholder="Select Invoice Status..." icon={FileText} />
                </div>
                <div>
                  <label style={s.label}>Services</label>
                  <CustomSelect options={mockServices} value={formData.serviceId} onChange={(val: string) => setFormData({ ...formData, serviceId: val })} placeholder="Select Service..." icon={Wrench} />
                </div>
                <div>
                  <label style={s.label}>Priority</label>
                  <CustomSelect options={mockPriorities} value={formData.priorityId} onChange={(val: string) => setFormData({ ...formData, priorityId: val })} placeholder="Select Priority..." icon={Flag} />
                </div>

                <div>
                  <label style={s.label}>Receive Date</label>
                  <div style={s.inputWrapper}>
                    <CalendarDays style={s.icon} size={16} />
                    <input type="date" style={s.input} value={formData.receiveDate} onChange={e => setFormData({ ...formData, receiveDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Schedule Date</label>
                  <div style={s.inputWrapper}>
                    <CalendarDays style={s.icon} size={16} />
                    <input type="date" style={s.input} value={formData.scheduleDate} onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Team</label>
                  <CustomSelect options={mockTeams} value={formData.teamId} onChange={(val: string) => setFormData({ ...formData, teamId: val })} placeholder="Assign Team..." icon={Users} />
                </div>

                <div>
                  <label style={s.label}>Time In</label>
                  <div style={s.inputWrapper}>
                    <Clock style={s.icon} size={16} />
                    <input type="time" style={s.input} value={formData.timeIn} onChange={e => setFormData({ ...formData, timeIn: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Time Out</label>
                  <div style={s.inputWrapper}>
                    <Clock style={s.icon} size={16} />
                    <input type="time" style={s.input} value={formData.timeOut} onChange={e => setFormData({ ...formData, timeOut: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Rooms</label>
                  <CustomSelect options={roomOptions} value={formData.rooms} onChange={(val: string) => setFormData({ ...formData, rooms: val })} placeholder="Rooms..." icon={Hash} />
                </div>
                
                <div>
                  <label style={s.label}>Bathrooms</label>
                  <CustomSelect options={roomOptions} value={formData.bathrooms} onChange={(val: string) => setFormData({ ...formData, bathrooms: val })} placeholder="Bathrooms..." icon={Hash} />
                </div>

                <div className="col-span-full">
                  <label style={s.label}>Note</label>
                  <div style={{ ...s.inputWrapper, alignItems: 'flex-start' }}>
                    <StickyNote style={{ ...s.icon, top: '14px' }} size={16} />
                    <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} placeholder="General instructions or notes..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })}></textarea>
                  </div>
                </div>

                <div className="col-span-full">
                  <label style={s.label}>Employee's Note</label>
                  <div style={{ ...s.inputWrapper, alignItems: 'flex-start' }}>
                    <PenTool style={{ ...s.icon, top: '14px' }} size={16} />
                    <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} placeholder="Employee performance notes..." value={formData.employeeNote} onChange={e => setFormData({ ...formData, employeeNote: e.target.value })}></textarea>
                  </div>
                </div>

              </div>
            </div>
            
            <footer style={s.footer}>
              <button style={s.btnOutline} onClick={handleCloseForm} disabled={isSaving}>Cancel</button>
              <button style={s.btnPrimary} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Save Property'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLES (3 COLUMN GRID) --- */}
      {isDetailModalOpen && selectedHouse && (
        <div className="modal-overlay-centered" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-70" onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Property Overview</h3>
              <button style={s.closeBtn} onClick={() => setIsDetailModalOpen(false)}><X size={24} /></button>
            </header>

            <div style={s.body}>
              <div style={s.detailBanner}>
                <div style={s.detailItem}>
                  <span style={{ ...s.detailLabel, color: '#1e40af' }}><Home size={14} /> PROPERTY ADDRESS</span>
                  <span style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 600, marginTop: '4px' }}>{selectedHouse.address}</span>
                </div>
              </div>

              <div className="grid-3-cols">

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Activity size={14} /> STATUS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: mockStatuses.find(st => st.id === selectedHouse.statusId)?.color || '#ccc', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span style={s.detailValue}>{mockStatuses.find(st => st.id === selectedHouse.statusId)?.name || 'UNASSIGNED'}</span>
                  </div>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><FileText size={14} /> INVOICE STATUS</span>
                  <span style={s.detailValue}>{selectedHouse.invoiceStatus || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><User size={14} /> CLIENT</span>
                  <span style={s.detailValue}>{selectedHouse.client || '-'}</span>
                </div>

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><CalendarDays size={14} /> RECEIVE DATE</span>
                  <span style={s.detailValue}>{selectedHouse.receiveDate || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><CalendarDays size={14} /> SCHEDULE DATE</span>
                  <span style={s.detailValue}>{selectedHouse.scheduleDate || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Wrench size={14} /> SERVICE</span>
                  <span style={s.detailValue}>{mockServices.find(srv => srv.id === selectedHouse.serviceId)?.name || '-'}</span>
                </div>

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Clock size={14} /> TIME IN</span>
                  <span style={s.detailValue}>{selectedHouse.timeIn || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Clock size={14} /> TIME OUT</span>
                  <span style={s.detailValue}>{selectedHouse.timeOut || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Flag size={14} /> PRIORITY</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color && <span style={{ backgroundColor: mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{mockPriorities.find(p => p.id === selectedHouse.priorityId)?.name || '-'}</span>
                  </div>
                </div>

                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Hash size={14} /> ROOMS</span>
                  <span style={s.detailValue}>{selectedHouse.rooms || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Hash size={14} /> BATHROOMS</span>
                  <span style={s.detailValue}>{selectedHouse.bathrooms || '-'}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Users size={14} /> TEAM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {mockTeams.find(t => t.id === selectedHouse.teamId)?.color && <span style={{ backgroundColor: mockTeams.find(t => t.id === selectedHouse.teamId)?.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{mockTeams.find(t => t.id === selectedHouse.teamId)?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="col-span-full">
                  <div style={s.noteBoxGray}>
                    <span style={{ ...s.detailLabel, marginBottom: '8px' }}><StickyNote size={14} /> GENERAL NOTE</span>
                    <span style={{ ...s.detailValue, fontSize: '0.95rem' }}>{selectedHouse.note || 'No notes provided.'}</span>
                  </div>
                </div>

                <div className="col-span-full">
                  <div style={s.noteBoxOrange}>
                    <span style={{ ...s.detailLabel, marginBottom: '8px', color: '#c2410c' }}><PenTool size={14} /> EMPLOYEE'S NOTE</span>
                    <span style={{ ...s.detailValue, fontSize: '0.95rem' }}>{selectedHouse.employeeNote || 'No employee notes provided.'}</span>
                  </div>
                </div>

              </div>
            </div>

            <footer style={s.footerBetween}>
              <button style={s.btnDangerLight} onClick={handleDelete} disabled={isSaving}>
                <Trash2 size={16} style={{ marginRight: '6px' }} /> {isSaving ? 'Borrando...' : 'Delete Property'}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={s.btnOutline} onClick={() => setIsDetailModalOpen(false)}>Close</button>
                <button style={s.btnPrimary} onClick={() => handleOpenForm(selectedHouse)}><Edit2 size={16} /> Edit Details</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}