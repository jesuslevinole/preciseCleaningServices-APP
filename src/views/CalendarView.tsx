import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, 
  Home, Activity, FileText, CalendarDays, Clock, User, Wrench, Hash, Flag, Users, StickyNote, PenTool, MapPin
} from 'lucide-react';
import type { Property, Status, Team, Priority, Service } from '../types';

const mockStatuses: Status[] = [
  { id: '1', order: 1, name: 'PENDING ASSESSMENT', business: 'Regular', color: '#4b5563' },
  { id: '2', order: 2, name: 'NEEDS TO BE SCHEDULE', business: 'Regular', color: '#3b82f6' },
  { id: '3', order: 3, name: 'SCHEDULE PENDING', business: 'Regular', color: '#f97316' },
  { id: '4', order: 4, name: 'IN PROGRESS', business: 'Regular , Cavalry', color: '#a855f7' }
];

const mockTeams: Team[] = [
  { id: '1', name: 'Team test', business: '', color: '#f97316' },
  { id: '2', name: 'Team Jesus', business: '', color: '#e5e7eb' },
];

const mockPriorities: Priority[] = [
  { id: '1', name: 'HIGH', business: 'a', color: '#ef4444' },
  { id: '2', name: 'MEDIUM', business: '', color: '#eab308' },
  { id: '3', name: 'LOW', business: '', color: '#22c55e' }
];

const mockServices: Service[] = [
  { id: 's1', name: 'Full', estimatedTime: '', business: '' },
  { id: 's2', name: 'Light', estimatedTime: '120', business: '' }
];

interface CalendarViewProps {
  onOpenMenu: () => void;
  properties: Property[];
}

export default function CalendarView({ onOpenMenu, properties }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<Property | null>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleOpenDetail = (house: Property) => {
    setSelectedHouse(house);
    setIsDetailModalOpen(true);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const blanks = Array.from({ length: firstDay }, (_, i) => `blank-${i}`);
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentYear, currentMonth, currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth, currentDate.getDate() - 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentYear, currentMonth, currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth, currentDate.getDate() + 1));
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const getFormattedDate = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getEventsForDay = (day: number) => {
    const targetDateStr = getFormattedDate(currentYear, currentMonth, day);
    // Usamos el array properties que nos pasa App.tsx
    return properties.filter(p => p.scheduleDate === targetDateStr || (!p.scheduleDate && p.receiveDate === targetDateStr));
  };

  const s = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto', boxSizing: 'border-box' } as React.CSSProperties,
    modalWide: { backgroundColor: '#ffffff', width: '100%', maxWidth: '950px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '1.15rem', fontWeight: 600, color: '#111827', margin: 0 },
    body: { padding: '30px', overflowY: 'auto' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex' },
    flexRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' } as React.CSSProperties,
    detailBanner: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '24px', backgroundColor: '#eff6ff', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' } as React.CSSProperties,
    detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' } as React.CSSProperties,
    detailLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600 } as React.CSSProperties,
    detailValue: { fontSize: '1.05rem', color: '#111827', fontWeight: 500, marginTop: '4px', whiteSpace: 'pre-wrap' } as React.CSSProperties,
    noteBoxGray: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', flex: '1 1 100%' } as React.CSSProperties,
    noteBoxOrange: { backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '1px solid #ffedd5', flex: '1 1 100%' } as React.CSSProperties
  };

  const calStyles = {
    container: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '16px' } as React.CSSProperties,
    monthLabel: { fontSize: '1.25rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' },
    toggleGroup: { display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' },
    toggleBtn: (isActive: boolean) => ({
      padding: '6px 16px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: '6px',
      backgroundColor: isActive ? '#ffffff' : 'transparent', color: isActive ? '#3b82f6' : '#64748b', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s'
    }),
    gridMonth: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', minWidth: '800px' },
    gridWeek: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', minWidth: '800px', minHeight: '600px' },
    gridDay: { display: 'flex', flexDirection: 'column', padding: '20px', minHeight: '600px' } as React.CSSProperties,
    dayHeader: { padding: '12px', textAlign: 'center' as const, fontWeight: 600, color: '#6b7280', fontSize: '0.85rem', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', textTransform: 'uppercase' as const },
    dayCell: { minHeight: '120px', padding: '8px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#fff' } as React.CSSProperties,
    dateNumber: { fontSize: '0.9rem', fontWeight: 500, color: '#111827', marginBottom: '4px', textAlign: 'right' as const },
    eventPill: (statusId: string) => {
      const statusColor = mockStatuses.find(s => s.id === statusId)?.color || '#3b82f6';
      return {
        backgroundColor: `${statusColor}15`, borderLeft: `3px solid ${statusColor}`, color: '#111827', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, gap: '2px', transition: 'background-color 0.2s'
      };
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <header className="main-header" style={{ marginBottom: '24px' }}>
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={onOpenMenu} aria-label="Abrir menú" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 style={{ margin: 0, color: '#111827', fontSize: '2rem' }}>Calendar</h1>
          </div>
          <p style={{ marginTop: '4px', color: '#6b7280' }}>Schedule and dispatch overview</p>
        </div>
      </header>

      <div style={calStyles.container}>
        <div style={calStyles.toolbar}>
          <div style={calStyles.monthLabel}>
            <button onClick={handlePrev} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20}/></button>
            <CalendarIcon size={22} color="#3b82f6" />
            <span style={{ minWidth: '130px', textAlign: 'center' }}>
              {viewMode === 'month' ? `${monthNames[currentMonth]} ${currentYear}` : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
            </span>
            <button onClick={handleNext} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex' }}><ChevronRight size={20}/></button>
            <button onClick={handleToday} style={{ marginLeft: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>Today</button>
          </div>

          <div style={calStyles.toggleGroup}>
            <button style={calStyles.toggleBtn(viewMode === 'day')} onClick={() => setViewMode('day')}>Day</button>
            <button style={calStyles.toggleBtn(viewMode === 'week')} onClick={() => setViewMode('week')}>Week</button>
            <button style={calStyles.toggleBtn(viewMode === 'month')} onClick={() => setViewMode('month')}>Month</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          
          {viewMode === 'month' && (
            <div style={calStyles.gridMonth}>
              {weekDays.map(day => <div key={day} style={calStyles.dayHeader}>{day}</div>)}
              
              {blanks.map(blank => (
                <div key={blank} style={{ ...calStyles.dayCell, backgroundColor: '#f8fafc' }}></div>
              ))}

              {daysArray.map(day => {
                const dayEvents = getEventsForDay(day);
                const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

                return (
                  <div key={`month-day-${day}`} style={{...calStyles.dayCell, backgroundColor: isToday ? '#eff6ff' : '#ffffff'}}>
                    <span style={{...calStyles.dateNumber, color: isToday ? '#3b82f6' : '#111827', fontWeight: isToday ? 700 : 500 }}>{day}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                      {dayEvents.map(event => (
                        <div key={event.id} style={calStyles.eventPill(event.statusId)} onClick={() => handleOpenDetail(event)}>
                          <span style={{ fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.timeIn && `${event.timeIn} - `}{event.client}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.address}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'week' && (
            <div style={calStyles.gridWeek}>
              {weekDays.map((day, idx) => {
                const firstDayOfWeek = new Date(currentDate);
                firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + idx);
                
                const currentWeekDay = firstDayOfWeek.getDate();
                const currentWeekMonth = firstDayOfWeek.getMonth();
                const currentWeekYear = firstDayOfWeek.getFullYear();

                const targetDateStr = getFormattedDate(currentWeekYear, currentWeekMonth, currentWeekDay);
                const dayEvents = properties.filter(p => p.scheduleDate === targetDateStr || (!p.scheduleDate && p.receiveDate === targetDateStr));
                
                const isToday = new Date().toDateString() === firstDayOfWeek.toDateString();

                return (
                  <div key={`week-day-${day}`} style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', backgroundColor: isToday ? '#eff6ff' : '#ffffff' }}>
                    <div style={{...calStyles.dayHeader, backgroundColor: isToday ? '#bfdbfe' : '#f8fafc', color: isToday ? '#1e3a8a' : '#6b7280'}}>
                      {day} <span style={{fontSize: '1.1rem', color: isToday ? '#1e3a8a' : '#111827', marginLeft: '6px'}}>{currentWeekDay}</span>
                    </div>
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                       {dayEvents.map(event => (
                        <div key={`week-evt-${event.id}`} style={{...calStyles.eventPill(event.statusId), padding: '8px'}} onClick={() => handleOpenDetail(event)}>
                          <span style={{ fontWeight: 600 }}>{event.client}</span>
                          {event.timeIn && <span style={{ color: '#3b82f6', fontWeight: 500 }}><Clock size={10} style={{display: 'inline', marginRight: '4px'}}/>{event.timeIn}</span>}
                          <span style={{ color: '#6b7280', fontSize: '0.7rem', lineHeight: '1.2' }}>{event.address}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'day' && (
            <div style={calStyles.gridDay}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getEventsForDay(currentDate.getDate()).length === 0 ? (
                   <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>No events scheduled for this day.</p>
                ) : (
                  getEventsForDay(currentDate.getDate()).map(event => {
                    const statusColor = mockStatuses.find(s => s.id === event.statusId)?.color || '#3b82f6';
                    return (
                      <div key={`day-evt-${event.id}`} onClick={() => handleOpenDetail(event)} style={{ borderLeft: `4px solid ${statusColor}`, backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '20px', alignItems: 'center', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ minWidth: '80px', fontWeight: 600, color: '#3b82f6', fontSize: '1.1rem' }}>
                          {event.timeIn || 'Any Time'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{event.client}</div>
                          <div style={{ display: 'flex', gap: '12px', color: '#6b7280', fontSize: '0.85rem' }}>
                            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={12}/> {event.address}</span>
                            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Wrench size={12}/> {mockServices.find(srv => srv.id === event.serviceId)?.name || 'Service'}</span>
                          </div>
                        </div>
                        <div>
                          <span style={{ backgroundColor: `${statusColor}20`, color: statusColor, padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {mockStatuses.find(s => s.id === event.statusId)?.name}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {isDetailModalOpen && selectedHouse && (
        <div style={s.overlay} onClick={() => setIsDetailModalOpen(false)}>
          <div style={s.modalWide} onClick={e => e.stopPropagation()}>
            <header style={s.header}>
              <h3 style={s.title}>Property Overview</h3>
              <button style={s.closeBtn} onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
            </header>
            
            <div style={s.body}>
              <div style={s.detailBanner}>
                <div style={{...s.detailItem, flex: '1 1 100%'}}>
                  <span style={{...s.detailLabel, color: '#1e40af'}}><Home size={14} /> PROPERTY ADDRESS</span>
                  <span style={{ fontSize: '1.25rem', color: '#1e3a8a', fontWeight: 600, marginTop: '4px' }}>{selectedHouse.address}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Activity size={14} /> STATUS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ backgroundColor: mockStatuses.find(st => st.id === selectedHouse.statusId)?.color || '#ccc', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span style={s.detailValue}>{mockStatuses.find(st => st.id === selectedHouse.statusId)?.name || 'UNASSIGNED'}</span>
                  </div>
                </div>
                <div style={s.detailItem}><span style={s.detailLabel}><FileText size={14} /> INVOICE STATUS</span><span style={s.detailValue}>{selectedHouse.invoiceStatus || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><User size={14} /> CLIENT</span><span style={s.detailValue}>{selectedHouse.client || '-'}</span></div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}><span style={s.detailLabel}><CalendarDays size={14} /> RECEIVE DATE</span><span style={s.detailValue}>{selectedHouse.receiveDate || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><CalendarDays size={14} /> SCHEDULE DATE</span><span style={s.detailValue}>{selectedHouse.scheduleDate || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><Wrench size={14} /> SERVICE</span><span style={s.detailValue}>{mockServices.find(srv => srv.id === selectedHouse.serviceId)?.name || '-'}</span></div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}><span style={s.detailLabel}><Clock size={14} /> TIME IN</span><span style={s.detailValue}>{selectedHouse.timeIn || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><Clock size={14} /> TIME OUT</span><span style={s.detailValue}>{selectedHouse.timeOut || '-'}</span></div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Flag size={14} /> PRIORITY</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color && <span style={{ backgroundColor: mockPriorities.find(p => p.id === selectedHouse.priorityId)?.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{mockPriorities.find(p => p.id === selectedHouse.priorityId)?.name || '-'}</span>
                  </div>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.detailItem}><span style={s.detailLabel}><Hash size={14} /> ROOMS</span><span style={s.detailValue}>{selectedHouse.rooms || '-'}</span></div>
                <div style={s.detailItem}><span style={s.detailLabel}><Hash size={14} /> BATHROOMS</span><span style={s.detailValue}>{selectedHouse.bathrooms || '-'}</span></div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}><Users size={14} /> TEAM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {mockTeams.find(t => t.id === selectedHouse.teamId)?.color && <span style={{ backgroundColor: mockTeams.find(t => t.id === selectedHouse.teamId)?.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>}
                    <span style={s.detailValue}>{mockTeams.find(t => t.id === selectedHouse.teamId)?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
                
              <div style={s.flexRow}>
                <div style={s.noteBoxGray}>
                  <span style={{...s.detailLabel, marginBottom: '8px'}}><StickyNote size={14} /> GENERAL NOTE</span>
                  <span style={{...s.detailValue, fontSize: '0.95rem'}}>{selectedHouse.note || 'No notes provided.'}</span>
                </div>
              </div>

              <div style={s.flexRow}>
                <div style={s.noteBoxOrange}>
                  <span style={{...s.detailLabel, marginBottom: '8px', color: '#c2410c'}}><PenTool size={14} /> EMPLOYEE'S NOTE</span>
                  <span style={{...s.detailValue, fontSize: '0.95rem'}}>{selectedHouse.employeeNote || 'No employee notes provided.'}</span>
                </div>
              </div>

            </div>
            
            <footer style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px' }}>
              <button style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 20px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setIsDetailModalOpen(false)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}