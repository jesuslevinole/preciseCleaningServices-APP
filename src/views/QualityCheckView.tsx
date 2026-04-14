import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, X, Camera, MapPin, CalendarDays, Activity, FileText, User, Edit2, Trash2 
} from 'lucide-react';
import type { Property, SystemUser, Place, Task } from '../types/index';
import { settingsService } from '../services/settingsService';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface QCRecord {
  id?: string;
  houseId: string;
  date: string;
  address: string;
  client: string;
  status: 'Finished' | 'Pending';
  inspector?: string;
  qcData?: any; // Para guardar las respuestas de las tareas
}

interface QualityCheckViewProps {
  onOpenMenu: () => void;
  properties: Property[]; 
  houseToInspect: Property | null;
  clearHouseToInspect: () => void;
  currentUser?: SystemUser | null;
}

export default function QualityCheckView({ onOpenMenu, properties, houseToInspect, clearHouseToInspect, currentUser }: QualityCheckViewProps) {
  const [qcList, setQcList] = useState<QCRecord[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);
  const [editingQcId, setEditingQcId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Finished'>('All');

  // Estados para los catálogos dinámicos
  const [places, setPlaces] = useState<Place[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estructura de estado complejo
  const [qcData, setQcData] = useState<Record<string, any>>({});

  // 1. CARGAMOS LOS PLACES, TASKS Y LOS REPORTES DESDE FIREBASE
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingCatalogs(true);
      try {
        const [placesData, tasksData, qcSnap] = await Promise.all([
          settingsService.getAll('settings_places').catch(() => []),
          settingsService.getAll('settings_tasks').catch(() => []),
          getDocs(collection(db, 'quality_checks')).catch(() => ({ docs: [] } as any))
        ]);

        const sortedPlaces = (placesData as Place[]).sort((a, b) => a.name.localeCompare(b.name));
        const sortedTasks = (tasksData as Task[]).sort((a, b) => a.name.localeCompare(b.name));

        setPlaces(sortedPlaces);
        setTasks(sortedTasks);

        const loadedQCs = qcSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as QCRecord));
        loadedQCs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Más recientes primero
        setQcList(loadedQCs);
      } catch (error) {
        console.error("Error loading QC data:", error);
      } finally {
        setIsLoadingCatalogs(false);
      }
    };
    fetchAllData();
  }, []);

  // Efecto para abrir el modal desde el Dashboard o HousesView
  useEffect(() => {
    if (houseToInspect && !isLoadingCatalogs) {
      handleOpenForm(houseToInspect);
      clearHouseToInspect();
    }
  }, [houseToInspect, isLoadingCatalogs]);

  const filteredQcList = qcList.filter(qc => statusFilter === 'All' || qc.status === statusFilter);

  const handleOpenForm = (house: Property) => {
    setSelectedHouse(house);
    setEditingQcId(null);
    
    const initialData: any = {};
    places.forEach(p => {
      initialData[p.id] = { tasks: {}, corrections: '', score: null, notes: '', damage: '', photos: [] };
    });
    setQcData(initialData);
    setIsFormModalOpen(true);
  };

  const handleEditQC = (qc: QCRecord) => {
    const house = properties.find(p => p.id === qc.houseId) || null;
    if (!house) {
      alert("The property associated with this report could not be found.");
      return;
    }
    setSelectedHouse(house);
    setEditingQcId(qc.id as string);
    
    // Cargamos los datos previos o inicializamos vacíos si faltan campos
    const loadedData: any = qc.qcData || {};
    places.forEach(p => {
      if (!loadedData[p.id]) {
        loadedData[p.id] = { tasks: {}, corrections: '', score: null, notes: '', damage: '', photos: [] };
      }
    });
    
    setQcData(loadedData);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setSelectedHouse(null);
    setEditingQcId(null);
  };

  const handleSaveQC = async () => {
    if (!selectedHouse) return;
    setIsSaving(true);
    
    // Evaluamos si quedó alguna tarea sin contestar
    let isPending = false;
    places.forEach(p => {
      const placeTasks = tasks.filter(t => t.placeId === p.id);
      placeTasks.forEach(t => {
        if (!qcData[p.id]?.tasks[t.id]) isPending = true;
      });
    });

    const recordData = {
      houseId: selectedHouse.id,
      date: editingQcId ? (qcList.find(q => q.id === editingQcId)?.date || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      address: selectedHouse.address,
      client: selectedHouse.client,
      status: isPending ? 'Pending' : 'Finished',
      inspector: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
      qcData: qcData
    };

    try {
      if (editingQcId) {
        await updateDoc(doc(db, 'quality_checks', editingQcId), recordData);
        setQcList(prev => prev.map(qc => qc.id === editingQcId ? { id: editingQcId, ...recordData } as QCRecord : qc));
      } else {
        const docRef = await addDoc(collection(db, 'quality_checks'), recordData);
        setQcList([{ id: docRef.id, ...recordData } as QCRecord, ...qcList]);
      }
      alert("✅ Quality Check Saved Successfully!");
      handleCloseForm();
    } catch (error) {
      console.error("Error saving Quality Check:", error);
      alert("Error trying to save the record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQC = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Quality Check report? This cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, 'quality_checks', id));
      setQcList(prev => prev.filter(qc => qc.id !== id));
    } catch (error) {
      console.error("Error deleting Quality Check:", error);
      alert("Error trying to delete the record.");
    }
  };

  // --- Funciones para manejar el estado del formulario ---
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- Estilos Blindados ---
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
    btnSaveQC: { backgroundColor: '#22c55e', color: 'white', padding: '15px 60px', border: 'none', borderRadius: '30px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', opacity: isSaving ? 0.7 : 1 },
    pillBtn: (active: boolean) => ({ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: active ? '#3b82f6' : '#f1f5f9', color: active ? 'white' : '#64748b', transition: 'all 0.2s' })
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      
      {/* CABECERA Y FILTROS */}
      <header className="main-header" style={{ marginBottom: '24px' }}>
        <div className="view-header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="hamburger-btn" onClick={onOpenMenu} aria-label="Open menu" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, color: '#111827', fontSize: '2rem' }}>Quality Check Reports</h1>
            <p style={{ marginTop: '4px', color: '#6b7280' }}>History and status of house inspections</p>
          </div>
        </div>
      </header>

      {/* FILTRO DE ESTATUS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setStatusFilter('All')} style={s.pillBtn(statusFilter === 'All')}>All</button>
        <button onClick={() => setStatusFilter('Pending')} style={s.pillBtn(statusFilter === 'Pending')}>Pending</button>
        <button onClick={() => setStatusFilter('Finished')} style={s.pillBtn(statusFilter === 'Finished')}>Finished</button>
      </div>

      {/* TABLA BLINDADA CON LOS REPORTES */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{...s.th, width: '100px'}}>Actions</th>
                <th style={{...s.th, width: '120px'}}><CalendarDays size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Date</th>
                <th style={s.th}><User size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Client</th>
                <th style={s.th}><MapPin size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Address</th>
                <th style={{...s.th, textAlign: 'right'}}><Activity size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}}/> Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingCatalogs ? (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '30px' }}>Loading records from database...</td></tr>
              ) : filteredQcList.length === 0 ? (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '30px' }}>No Quality Checks found.</td></tr>
              ) : (
                filteredQcList.map((qc) => (
                  <tr key={qc.id} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid #f1f5f9' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditQC(qc)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteQC(qc.id as string)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                    <td style={s.td}>{formatDate(qc.date)}</td>
                    <td style={{...s.td, fontWeight: 600}}>{qc.client}</td>
                    <td style={{...s.td, color: '#6b7280'}}>
                      <div>{qc.address}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Inspected by: {qc.inspector || 'Unknown'}</div>
                    </td>
                    <td style={{...s.td, textAlign: 'right'}}>
                      <span style={{ 
                        backgroundColor: qc.status === 'Finished' ? '#dcfce7' : '#fef3c7', 
                        color: qc.status === 'Finished' ? '#166534' : '#b45309', 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 
                      }}>
                        {qc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EL MODAL PREMIUM DINÁMICO --- */}
      {isFormModalOpen && selectedHouse && (
        <div style={s.overlay}>
          <div style={s.modalWide}>
            
            {/* Header Actualizado */}
            <div style={s.headerQC}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardCheck size={22}/> Quality Check Inspection
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: '0.95rem', opacity: 0.9 }}>
                  Property: <strong style={{backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px'}}>{selectedHouse.client} - {selectedHouse.address}</strong>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> Inspector: {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown User'}
                </p>
              </div>
              <button style={s.closeBtn} onClick={handleCloseForm}><X size={24} /></button>
            </div>
            
            {/* Body desplazable */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              
              {isLoadingCatalogs ? (
                <div style={{ color: '#6b7280', padding: '20px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  Loading Inspection Checklist...
                </div>
              ) : places.length === 0 ? (
                <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center', gridColumn: '1 / -1', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                  Please go to Settings &gt; Places and configure your rooms and tasks first.
                </div>
              ) : (
                places.map(place => {
                  const placeData = qcData[place.id] || { tasks: {} };
                  const placeTasks = tasks.filter(t => t.placeId === place.id);

                  if (placeTasks.length === 0) return null;

                  return (
                    <div key={place.id} style={s.cardQC}>
                      <h2 style={s.cardTitle}>{place.name}</h2>
                      
                      <div style={{ marginBottom: '16px' }}>
                        {placeTasks.map(task => (
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
                          <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>*Integration pending*</span>
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
                })
              )}

            </div>
            
            {/* Pie con el Botón Verde de Guardado */}
            <div style={s.saveBar}>
              <button style={s.btnSaveQC} onClick={handleSaveQC} disabled={isLoadingCatalogs || places.length === 0 || isSaving}>
                {isSaving ? 'GUARDANDO...' : 'GUARDAR TODO'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}