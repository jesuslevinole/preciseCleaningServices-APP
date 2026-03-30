import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, X, Camera, MapPin, Search, CalendarDays, Activity, FileText, User // <-- CORRECCIÓN: Importamos el ícono User aquí
} from 'lucide-react';
import type { Property } from '../types';

// Interfaces Locales para el Quality Check
interface QCTask {
  id: string;
  name: string;
}

interface QCPlace {
  id: string;
  name: string;
  tasks: QCTask[];
}

interface QCRecord {
  id: string;
  houseId: string;
  date: string;
  address: string;
  client: string;
  status: 'Finished' | 'Pending';
}

// --- Mocks para sustituir el Excel ---
const mockPlaces: QCPlace[] = [
  { 
    id: 'p1', name: 'Kitchen', 
    tasks: [{id: 't1', name: 'Clean countertops'}, {id: 't2', name: 'Empty trash'}, {id: 't3', name: 'Clean inside microwave'}] 
  },
  { 
    id: 'p2', name: 'Master Bathroom', 
    tasks: [{id: 't4', name: 'Clean mirrors'}, {id: 't5', name: 'Scrub tub/shower'}, {id: 't6', name: 'Mop floors'}] 
  }
];

// Simulamos que ya hay reportes creados previamente
const mockPastQCs: QCRecord[] = [
  { id: 'qc-1', houseId: '1', date: '2026-03-20', address: '1405 Fairbanks St, Copperas Cove', client: 'Janina A.', status: 'Finished' },
  { id: 'qc-2', houseId: '3', date: '2026-03-22', address: '3402 S W S Young Dr, Killeen', client: 'Linnemann', status: 'Pending' }
];

interface QualityCheckViewProps {
  onOpenMenu: () => void;
  properties: Property[];
  houseToInspect: Property | null;
  clearHouseToInspect: () => void;
}

export default function QualityCheckView({ onOpenMenu, properties, houseToInspect, clearHouseToInspect }: QualityCheckViewProps) {
  const [qcList, setQcList] = useState<QCRecord[]>(mockPastQCs);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);

  // Estructura de estado complejo para replicar tu HTML de AppScript
  // { placeId: { tasks: { taskId: 'Yes'|'No' }, corrections: 'Yes'|'No', score: 1|2|3, notes: '', damage: '', photos: [] } }
  const [qcData, setQcData] = useState<Record<string, any>>({});

  // Efecto para abrir el modal si venimos de darle al botón "Check" en HousesView
  useEffect(() => {
    if (houseToInspect) {
      handleOpenForm(houseToInspect);
      clearHouseToInspect(); // Limpiamos para que no se re-abra si cerramos el modal
    }
  }, [houseToInspect]);

  const handleOpenForm = (house: Property) => {
    setSelectedHouse(house);
    
    // Inicializamos el estado del formulario vacío
    const initialData: any = {};
    mockPlaces.forEach(p => {
      initialData[p.id] = { tasks: {}, corrections: '', score: null, notes: '', damage: '', photos: [] };
    });
    setQcData(initialData);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setSelectedHouse(null);
  };

  const handleSaveQC = () => {
    if (!selectedHouse) return;
    
    // Evaluamos si quedó alguna tarea sin contestar para determinar si es Pending o Finished
    let isPending = false;
    mockPlaces.forEach(p => {
      p.tasks.forEach(t => {
        if (!qcData[p.id]?.tasks[t.id]) isPending = true;
      });
    });

    const newRecord: QCRecord = {
      id: `qc-${Date.now()}`,
      houseId: selectedHouse.id,
      date: new Date().toISOString().split('T')[0],
      address: selectedHouse.address,
      client: selectedHouse.client,
      status: isPending ? 'Pending' : 'Finished'
    };

    setQcList([newRecord, ...qcList]);
    alert("✅ Quality Check Saved Successfully!");
    handleCloseForm();
  };

  // --- Funciones para manejar el estado replicando las de tu AppScript ---
  const setTaskValue = (placeId: string, taskId: string, value: 'Yes' | 'No') => {
    setQcData(prev => ({
      ...prev, [placeId]: { ...prev[placeId], tasks: { ...prev[placeId].tasks, [taskId]: value } }
    }));
  };

  const setCorrectionValue = (placeId: string, value: 'Yes' | 'No') => {
    setQcData(prev => ({ ...prev, [placeId]: { ...prev[placeId], corrections: value } }));
  };

  const setScoreValue = (placeId: string, value: number) => {
    setQcData(prev => ({ ...prev, [placeId]: { ...prev[placeId], score: value } }));
  };

  const handleTextChange = (placeId: string, field: 'notes' | 'damage', value: string) => {
    setQcData(prev => ({ ...prev, [placeId]: { ...prev[placeId], [field]: value } }));
  };

  // Estilos Blindados para la Tabla y los Modales
  const s = {
    th: { backgroundColor: '#f9fafb', padding: '12px 16px', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', textAlign: 'left' as const },
    td: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '0.95rem' },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto', boxSizing: 'border-box' } as React.CSSProperties,
    modalWide: { backgroundColor: '#eaeff2', width: '100%', maxWidth: '900px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    headerQC: { backgroundColor: '#3b82f6', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0', flexShrink: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
    cardQC: { backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e1e4e8', padding: '20px', marginBottom: '20px' } as React.CSSProperties,
    cardTitle: { color: '#3b82f6', fontSize: '1.1rem', borderBottom: '2px solid #3b82f6', paddingBottom: '8px', marginTop: 0, fontWeight: 600 },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    btnYes: (active: boolean) => ({ padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const, border: active ? '1px solid #22c55e' : '1px solid #e1e4e8', backgroundColor: active ? '#22c55e' : 'white', color: active ? 'white' : '#111827', transition: 'all 0.2s' }),
    btnNo: (active: boolean) => ({ padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const, border: active ? '1px solid #ef4444' : '1px solid #e1e4e8', backgroundColor: active ? '#ef4444' : 'white', color: active ? 'white' : '#111827', transition: 'all 0.2s' }),
    btnScore: (active: boolean) => ({ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const, border: active ? '1px solid #3b82f6' : '1px solid #e1e4e8', backgroundColor: active ? '#3b82f6' : 'white', color: active ? 'white' : '#111827', transition: 'all 0.2s' }),
    extraFields: { marginTop: '15px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc' },
    labelQC: { display: 'block', fontWeight: 'bold' as const, fontSize: '11px', margin: '10px 0 5px', color: '#555', textTransform: 'uppercase' as const },
    textareaQC: { width: '100%', height: '60px', border: '1px solid #e1e4e8', borderRadius: '4px', padding: '8px', boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit' },
    uploadBox: { border: '2px dashed #bbb', borderRadius: '8px', padding: '15px', cursor: 'pointer', textAlign: 'center' as const, backgroundColor: '#fff', margin: '10px 0', color: '#555', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px' },
    saveBar: { padding: '15px', textAlign: 'center' as const, borderTop: '3px solid #22c55e', backgroundColor: 'white', borderRadius: '0 0 12px 12px', flexShrink: 0 },
    btnSaveQC: { backgroundColor: '#22c55e', color: 'white', padding: '15px 60px', border: 'none', borderRadius: '30px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      
      {/* CABECERA DE LA VISTA (TABLA) */}
      <header className="main-header" style={{ marginBottom: '24px' }}>
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 style={{ margin: 0, color: '#111827', fontSize: '2rem' }}>Quality Check Reports</h1>
          </div>
          <p style={{ marginTop: '4px', color: '#6b7280' }}>History and status of house inspections</p>
        </div>
      </header>

      {/* TABLA BLINDADA CON LOS REPORTES */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{...s.th, width: '120px'}}><CalendarDays size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Date</th>
                <th style={s.th}><User size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Client</th>
                <th style={s.th}><MapPin size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Address</th>
                <th style={s.th}><Activity size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Status</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qcList.map((qc) => (
                <tr key={qc.id} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid #f1f5f9' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={s.td}>{qc.date}</td>
                  <td style={{...s.td, fontWeight: 600}}>{qc.client}</td>
                  <td style={{...s.td, color: '#6b7280'}}>{qc.address}</td>
                  <td style={s.td}>
                    <span style={{ 
                      backgroundColor: qc.status === 'Finished' ? '#dcfce7' : '#fef3c7', 
                      color: qc.status === 'Finished' ? '#166534' : '#b45309', 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 
                    }}>
                      {qc.status}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={16}/> View Report
                    </button>
                  </td>
                </tr>
              ))}
              {qcList.length === 0 && (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '30px' }}>No Quality Checks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EL MODAL PREMIUM TRADUCIDO DEL APPSCRIPT --- */}
      {isFormModalOpen && selectedHouse && (
        <div style={s.overlay}>
          <div style={s.modalWide}>
            
            {/* Header Estilo AppScript pero Moderno */}
            <div style={s.headerQC}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardCheck size={22}/> Quality Check Inspection
                </h1>
                <p style={{ margin: '5px 0 0', fontSize: '0.95rem', opacity: 0.9 }}>
                  ID House: <strong style={{backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px'}}>{selectedHouse.id}</strong>
                </p>
              </div>
              <button style={s.closeBtn} onClick={handleCloseForm}><X size={24} /></button>
            </div>
            
            {/* Body desplazable */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              
              {mockPlaces.map(place => {
                const placeData = qcData[place.id] || { tasks: {} };

                return (
                  <div key={place.id} style={s.cardQC}>
                    <h2 style={s.cardTitle}>{place.name}</h2>
                    
                    <div style={{ marginBottom: '16px' }}>
                      {place.tasks.map(task => (
                        <div key={task.id} style={s.taskItem}>
                          <span style={{ fontSize: '0.95rem', color: '#374151' }}>{task.name}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setTaskValue(place.id, task.id, 'Yes')} style={s.btnYes(placeData.tasks[task.id] === 'Yes')}>Yes</button>
                            <button onClick={() => setTaskValue(place.id, task.id, 'No')} style={s.btnNo(placeData.tasks[task.id] === 'No')}>No</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={s.extraFields}>
                      <label style={s.labelQC}>¿Correcciones del Manager?</label>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                        <button onClick={() => setCorrectionValue(place.id, 'Yes')} style={s.btnYes(placeData.corrections === 'Yes')}>Yes</button>
                        <button onClick={() => setCorrectionValue(place.id, 'No')} style={s.btnNo(placeData.corrections === 'No')}>No</button>
                      </div>

                      <label style={s.labelQC}>Score (1-3)</label>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                        {[1, 2, 3].map(num => (
                          <button key={num} onClick={() => setScoreValue(place.id, num)} style={s.btnScore(placeData.score === num)}>{num}</button>
                        ))}
                      </div>
                      
                      <div style={s.uploadBox}>
                        <Camera size={24} color="#9ca3af"/>
                        <span>Click to upload photos (Max 10)</span>
                        <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>*Mock integration*</span>
                      </div>

                      <label style={s.labelQC}>Notas</label>
                      <textarea 
                        style={{...s.textareaQC, marginBottom: '12px'}} 
                        value={placeData.notes || ''} 
                        onChange={(e) => handleTextChange(place.id, 'notes', e.target.value)}
                      />

                      <label style={s.labelQC}>Daños</label>
                      <textarea 
                        style={s.textareaQC} 
                        value={placeData.damage || ''} 
                        onChange={(e) => handleTextChange(place.id, 'damage', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}

            </div>
            
            {/* Pie con el Botón Verde de Guardado */}
            <div style={s.saveBar}>
              <button style={s.btnSaveQC} onClick={handleSaveQC}>GUARDAR TODO</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}