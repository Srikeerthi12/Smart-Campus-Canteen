import { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import api from '../../services/api';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { FiPlus, FiUser } from 'react-icons/fi';

const OwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ name: '', email: '', password: '', canteenId: '' });

  const fetchData = async () => {
    try {
      const [oRes, c] = await Promise.all([
        api.get('/admin/owners'),
        canteenService.getAll()
      ]);
      setOwners(oRes.data.owners);
      setCanteens(c);
    } catch {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.canteenId) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/owners', form);
      toast.success('Owner created successfully');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', canteenId: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create owner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '4px' }}>Canteen Owners</h1>
          <p style={{ color: '#636e72', fontSize: '0.875rem' }}>Manage owner accounts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus size={18} /> Add Owner
        </button>
      </div>

      <div className="clay-card" style={{ overflow: 'hidden' }}>
        {loading ? <SkeletonList /> : owners.length === 0 ? (
          <EmptyState icon="👨‍💼" title="No owners yet" message="Create an owner to manage a canteen." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Assigned Canteen</th>
                </tr>
              </thead>
              <tbody>
                {owners.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600, color: '#2D3436' }}>{o.name}</td>
                    <td>{o.email}</td>
                    <td>{o.canteenId?.name || <span style={{color: '#EF4444'}}>Unassigned</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Owner Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="clay-card animate-fade-in-up" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', marginBottom: '24px' }}>Add New Owner</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Canteen</label>
                <select className="input-field" value={form.canteenId} onChange={e => setForm({...form, canteenId: e.target.value})} required>
                  <option value="">Select a canteen</option>
                  {canteens.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerManagement;
