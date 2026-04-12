import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, User, DollarSign, CheckCircle } from 'lucide-react';
import { payrollService } from '../services/payrollService';
import { propertiesService } from '../services/propertiesService';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PayrollRecord, Property, SystemUser } from '../types/index';

interface PayrollViewProps {
  onOpenMenu: () => void;
}

export default function PayrollView({ onOpenMenu }: PayrollViewProps) {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [payrollData, propsData, usersSnap] = await Promise.all([
          payrollService.getAll(),
          propertiesService.getAll(),
          getDocs(collection(db, 'system_users'))
        ]);
        
        setRecords(payrollData);
        setProperties(propsData);
        setEmployees(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as SystemUser)));
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lógica de Filtros
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (selectedEmployee && record.employeeId !== selectedEmployee) return false;
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      return true;
    });
  }, [records, startDate, endDate, selectedEmployee]);

  // Cálculos
  const totalPaid = filteredRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPending = filteredRecords.filter(r => r.status !== 'Paid').reduce((sum, r) => sum + r.totalAmount, 0);

  const pendingRecords = filteredRecords.filter(r => r.status !== 'Paid');

  const handleMarkAsPaid = async (id: string) => {
    if (!window.confirm("Mark this record as Paid?")) return;
    try {
      await payrollService.update(id, { status: 'Paid' });
      setRecords(records.map(r => r.id === id ? { ...r, status: 'Paid' } : r));
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status.");
    }
  };

  const s = {
    input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, marginBottom: '6px' },
    th: { padding: '12px 20px', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#111827' },
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button className="mobile-menu-btn" onClick={onOpenMenu} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
          <Search size={20} color="#64748b" />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 700 }}>Payroll & Payments</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Manage employee payments and debts</p>
        </div>
      </header>

      {/* FILTROS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={s.label}>Start Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="date" style={{...s.input, paddingLeft: '36px'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={s.label}>End Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="date" style={{...s.input, paddingLeft: '36px'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div style={{ flex: '1 1 250px' }}>
          <label style={s.label}>Employee</label>
          <div style={{ position: 'relative' }}>
            <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <select style={{...s.input, paddingLeft: '36px', cursor: 'pointer'}} value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
              <option value="">All Employees...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* RESUMEN FINANCIERO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={24} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Total Paid</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46' }}>${totalPaid.toFixed(2)}</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ffedd5', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={24} /></div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>Total Pending (Debt)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400e' }}>${totalPending.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* REGISTROS PENDIENTES */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Pending Records</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={s.th}>Date</th>
              <th style={s.th}>Employee</th>
              <th style={s.th}>Property / Client</th>
              <th style={s.th}>Calculations</th>
              <th style={s.th}>Total</th>
              <th style={{...s.th, textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading payroll data...</td></tr> : 
             pendingRecords.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No pending payments for this filter.</td></tr> :
             pendingRecords.map(record => {
               const emp = employees.find(e => e.id === record.employeeId);
               const prop = properties.find(p => p.id === record.propertyId);
               return (
                 <tr key={record.id}>
                   <td style={s.td}>{record.date}</td>
                   <td style={{...s.td, fontWeight: 600}}>{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}</td>
                   <td style={s.td}>{prop ? prop.client : 'Unknown Property'}</td>
                   <td style={{...s.td, fontSize: '0.8rem', color: '#64748b'}}>
                     Base: ${record.baseAmount} <br/>
                     Extra: ${record.extraAmount} <br/>
                     Discount: -${record.discountAmount}
                   </td>
                   <td style={{...s.td, fontWeight: 700, color: '#f59e0b'}}>${record.totalAmount.toFixed(2)}</td>
                   <td style={{...s.td, textAlign: 'right'}}>
                     <button onClick={() => handleMarkAsPaid(record.id as string)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Mark Paid</button>
                   </td>
                 </tr>
               )
             })
            }
          </tbody>
        </table>
      </div>

    </div>
  );
}