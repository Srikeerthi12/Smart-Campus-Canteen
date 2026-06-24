import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenService } from '../../services/canteenService';
import api from '../../services/api';
import { formatTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { FiSave, FiMapPin, FiPhone, FiClock, FiInfo, FiCamera } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const OwnerSettings = () => {
  const { user } = useAuth();
  const [canteen, setCanteen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    openTime: '',
    closeTime: '',
    contactPhone: '',
    imageUrl: '',
  });

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

  useEffect(() => {
    const load = async () => {
      if (!user?.canteenId) {
        setLoading(false);
        return;
      }
      try {
        const data = await canteenService.getById(user.canteenId);
        setCanteen(data);
        setForm({
          name: data.name || '',
          location: data.location || '',
          openTime: data.openTime || '08:00',
          closeTime: data.closeTime || '20:00',
          contactPhone: data.contactPhone || '',
          imageUrl: data.imageUrl || '',
        });
      } catch {
        toast.error('Failed to load canteen settings');
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.openTime || !form.closeTime || !form.contactPhone) {
      toast.error('All fields are required');
      return;
    }
    setSaving(true);
    try {
      await canteenService.update(user.canteenId, form);
      toast.success('Canteen settings updated successfully!');
      setCanteen(prev => ({ ...prev, ...form }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user?.canteenId) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 24px',
        background: 'white', borderRadius: '24px',
        boxShadow: 'var(--clay-shadow)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#2D3436', marginBottom: '8px' }}>
          No Canteen Assigned
        </h2>
        <p style={{ color: '#636e72' }}>
          Your account is not yet assigned to a canteen. Contact the Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '6px' }}>
          Canteen Settings
        </h1>
        <p style={{ color: '#636e72', fontSize: '0.9rem' }}>
          Manage your canteen's details and operating hours
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px', alignItems: 'start' }}>
        {/* Settings Form */}
        <div className="clay-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'cover',
                    borderRadius: '18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }}
                />
              ) : (
                <div style={{
                  width: '64px', height: '64px',
                  background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                  borderRadius: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(255,122,0,0.3)',
                }}>
                  <MdRestaurant size={32} color="white" />
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#2D3436' }}>
                  {canteen?.name}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#636e72' }}>
                  {canteen?.location}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiInfo size={13} style={{ marginRight: '6px' }} />
                Canteen Name *
              </label>
              <input
                id="owner-canteen-name"
                type="text"
                className="input-field"
                placeholder="e.g., Main Block Canteen"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiMapPin size={13} style={{ marginRight: '6px' }} />
                Location *
              </label>
              <input
                id="owner-canteen-location"
                type="text"
                className="input-field"
                placeholder="e.g., Ground Floor, Block A"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  <FiClock size={13} style={{ marginRight: '6px' }} />
                  Opening Time *
                </label>
                <input
                  id="owner-open-time"
                  type="time"
                  className="input-field"
                  value={form.openTime}
                  onChange={e => setForm({ ...form, openTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FiClock size={13} style={{ marginRight: '6px' }} />
                  Closing Time *
                </label>
                <input
                  id="owner-close-time"
                  type="time"
                  className="input-field"
                  value={form.closeTime}
                  onChange={e => setForm({ ...form, closeTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiPhone size={13} style={{ marginRight: '6px' }} />
                Contact Phone *
              </label>
              <input
                id="owner-contact-phone"
                type="tel"
                className="input-field"
                placeholder="e.g., +91 98765 43210"
                value={form.contactPhone}
                onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                required
              />
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
                  id="owner-image-url" 
                  type="url" 
                  className="input-field" 
                  placeholder="Or paste image URL (e.g. https://example.com/canteen.jpg)" 
                  value={form.imageUrl} 
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                id="save-settings-btn"
                type="submit"
                className="btn-primary"
                disabled={saving || uploadingImage}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
              >
                {saving ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <><FiSave size={18} /> Save Settings</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Live preview */}
          <div className="clay-card" style={{ padding: '0px', overflow: 'hidden' }}>
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Canteen Preview"
                style={{ width: '100%', height: '140px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                height: '140px',
                background: 'linear-gradient(135deg, #FF7A00, #FFB703)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MdRestaurant size={48} color="rgba(255,255,255,0.6)" />
              </div>
            )}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#2D3436', marginBottom: '16px' }}>
                📱 Live Preview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiInfo size={14} color="#FF7A00" />
                  <span style={{ fontWeight: 600, color: '#2D3436' }}>{form.name || 'Canteen Name'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiMapPin size={14} color="#FF7A00" />
                  {form.location || 'Location'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiClock size={14} color="#FF7A00" />
                  {formatTime(form.openTime)} – {formatTime(form.closeTime)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#636e72' }}>
                  <FiPhone size={14} color="#FF7A00" />
                  {form.contactPhone || 'Phone Number'}
                </div>
              </div>
            </div>
          </div>

          {/* Info card */}
          <div style={{
            padding: '16px',
            background: 'rgba(255,122,0,0.06)',
            borderRadius: '16px',
            border: '1px solid rgba(255,122,0,0.12)',
          }}>
            <p style={{ fontSize: '0.82rem', color: '#636e72', lineHeight: 1.6 }}>
              💡 <strong>Tip:</strong> Setting accurate opening times helps students know when your canteen is open without guessing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings;
