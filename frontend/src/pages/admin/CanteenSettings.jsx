import { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiMapPin, FiPhone, FiClock, FiCamera } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const EMPTY_FORM = { name: '', location: '', openTime: '08:00', closeTime: '20:00', contactPhone: '', imageUrl: '', ownerName: '', ownerEmail: '', ownerPassword: '' };

const CanteenSettings = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCanteen, setEditCanteen] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    const uploadToast = toast.loading('Uploading image...');

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setForm(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
      toast.success('Image uploaded successfully!', { id: uploadToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image', { id: uploadToast });
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchCanteens = async () => {
    try {
      const data = await canteenService.getAll();
      setCanteens(data);
    } catch { toast.error('Failed to load canteens'); }
    setLoading(false);
  };

  useEffect(() => { fetchCanteens(); }, []);

  const openAdd = () => { setEditCanteen(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditCanteen(c);
    setForm({ name: c.name, location: c.location, openTime: c.openTime, closeTime: c.closeTime, contactPhone: c.contactPhone, imageUrl: c.imageUrl || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.openTime || !form.closeTime || !form.contactPhone) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editCanteen) {
        await canteenService.update(editCanteen._id, form);
        toast.success('Canteen updated!');
      } else {
        await canteenService.create(form);
        toast.success('Canteen created!');
      }
      setShowModal(false);
      fetchCanteens();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save canteen');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this canteen? This action cannot be undone.')) return;
    try {
      await canteenService.delete(id);
      toast.success('Canteen deleted');
      fetchCanteens();
    } catch { toast.error('Failed to delete canteen'); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '4px' }}>Canteen Settings</h1>
          <p style={{ color: '#636e72', fontSize: '0.875rem' }}>{canteens.length} canteen{canteens.length !== 1 ? 's' : ''} on campus</p>
        </div>
        <button id="add-canteen-btn" onClick={openAdd} className="btn-primary">
          <FiPlus size={18} /> Add Canteen
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="clay-card" style={{ padding: '0' }}><SkeletonList /></div>
      ) : canteens.length === 0 ? (
        <EmptyState icon="🏪" title="No canteens yet" message="Add your first campus canteen." action={<button className="btn-primary" onClick={openAdd}><FiPlus /> Add Canteen</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {canteens.map(c => (
            <div key={c._id} className="clay-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    style={{
                      width: '52px', height: '52px',
                      objectFit: 'cover',
                      borderRadius: '14px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '52px', height: '52px',
                    background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(255,122,0,0.3)',
                  }}>
                    <MdRestaurant size={26} color="white" />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button id={`edit-canteen-${c._id}`} className="btn-icon" onClick={() => openEdit(c)} title="Edit"><FiEdit2 size={15} /></button>
                  <button id={`delete-canteen-${c._id}`} className="btn-icon" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }} onClick={() => handleDelete(c._id)} title="Delete"><FiTrash2 size={15} /></button>
                </div>
              </div>

              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#2D3436', marginBottom: '14px' }}>{c.name}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiMapPin size={13} color="#FF7A00" />{c.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiClock size={13} color="#FF7A00" />{c.openTime} – {c.closeTime}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiPhone size={13} color="#FF7A00" />{c.contactPhone}
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.75rem', color: '#b2bec3' }}>
                Added {formatDate(c.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#2D3436' }}>
                {editCanteen ? 'Edit Canteen' : 'Add New Canteen'}
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Canteen Name *</label>
                <input id="canteen-name" type="text" className="input-field" placeholder="e.g., Main Block Canteen" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input id="canteen-location" type="text" className="input-field" placeholder="e.g., Ground Floor, Block A" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Opening Time *</label>
                  <input id="canteen-open-time" type="time" className="input-field" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Closing Time *</label>
                  <input id="canteen-close-time" type="time" className="input-field" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input id="canteen-phone" type="tel" className="input-field" placeholder="e.g., +91 98765 43210" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiCamera size={13} style={{ marginRight: '6px' }} />
                  Canteen Image
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                        disabled={uploadingImage}
                      />
                      📁 {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </label>
                    {form.imageUrl && (
                      <span style={{ fontSize: '0.82rem', color: '#22C55E', fontWeight: 600 }}>
                        ✓ Image attached
                      </span>
                    )}
                  </div>
                  <input 
                    id="canteen-image-url" 
                    type="url" 
                    className="input-field" 
                    placeholder="Or paste image URL" 
                    value={form.imageUrl} 
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                  />
                </div>
              </div>

              {!editCanteen && (
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436', marginBottom: '16px' }}>
                    Assign Canteen Owner (Optional)
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input type="text" className="input-field" placeholder="Owner's full name" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Email</label>
                    <input type="email" className="input-field" placeholder="owner@campuseats.com" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Password</label>
                    <input type="password" className="input-field" placeholder="Temporary password" value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-canteen-btn" type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting || uploadingImage}>
                  {submitting ? 'Saving...' : <><FiCheck size={16} /> {editCanteen ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenSettings;
