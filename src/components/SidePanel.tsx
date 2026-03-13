import { X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export default function SidePanel({ isOpen, title, onClose, onSave, children }: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose}></div>
      <div className="side-panel fade-in-right">
        <header className="side-panel-header">
          <div className="side-panel-title">
            <button className="btn-icon" onClick={onClose}>
              <X size={20} color="#6b7280" />
            </button>
            <h3>{title}</h3>
          </div>
          <div className="side-panel-actions">
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={onSave}>Save</button>
          </div>
        </header>

        <div className="side-panel-body">
          {children}
        </div>
      </div>
    </>
  );
}