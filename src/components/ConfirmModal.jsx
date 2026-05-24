import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                    color: '#b91c1c'
                }}>
                    <AlertTriangle size={32} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#1f2937' }}>{title}</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button onClick={onClose} className="btn-secondary" style={{ width: '100px' }}>Cancel</button>
                    <button onClick={onConfirm} className="btn-danger" style={{ width: '100px' }}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
