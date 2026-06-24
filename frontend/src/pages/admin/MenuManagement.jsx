import { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import { canteenService } from '../../services/canteenService';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

const EMPTY_FORM = { name: '', description: '', price: '', imageUrl: '', canteen: '', isAvailable: true };

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('all');
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

  const fetchData = async () => {
    try {
      const [m, c] = await Promise.all([menuService.getAll(), canteenService.getAll()]);
      setItems(m);
      setCanteens(c);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description,
      price: item.price, imageUrl: item.imageUrl,
      canteen: item.canteen?._id || item.canteen || '',
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.imageUrl || !form.canteen) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editItem) {
        await menuService.update(editItem._id, payload);
        toast.success('Item updated successfully!');
      } else {
        await menuService.create(payload);
        toast.success('Menu item created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await menuService.delete(id);
      toast.success('Item deleted');
      fetchData();
    } catch { toast.error('Failed to delete item'); }
  };

  const handleToggle = async (item) => {
    try {
      await menuService.toggleAvailability(item._id, !item.isAvailable);
      toast.success(`Item marked as ${!item.isAvailable ? 'available' : 'unavailable'}`);
      fetchData();
    } catch { toast.error('Failed to toggle availability'); }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCanteen = canteenFilter === 'all' || (item.canteen?._id || item.canteen) === canteenFilter;
    return matchSearch && matchCanteen;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#2D3436', marginBottom: '4px' }}>Menu Management</h1>
          <p style={{ color: '#636e72', fontSize: '0.875rem' }}>{items.length} items · {items.filter(i => i.isAvailable).length} available</p>
        </div>
        <button id="add-menu-item-btn" onClick={openAdd} className="btn-primary">
          <FiPlus size={18} /> Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
        background: 'white', padding: '14px', borderRadius: '16px',
        boxShadow: 'var(--clay-shadow-sm)',
      }}>
        <input
          id="menu-admin-search"
          type="text" className="input-field"
          style={{ flex: 1, minWidth: '200px' }}
          placeholder="Search menu items..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select
          id="canteen-filter-select"
          className="input-field"
          style={{ width: '200px' }}
          value={canteenFilter}
          onChange={e => setCanteenFilter(e.target.value)}
        >
          <option value="all">All Canteens</option>
          {canteens.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="clay-card" style={{ overflow: 'hidden' }}>
        {loading ? <SkeletonList /> : filtered.length === 0 ? (
          <EmptyState icon="🍽️" title="No menu items" message="Add your first menu item to get started." action={<button className="btn-primary" onClick={openAdd}><FiPlus /> Add Item</button>} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Canteen</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,122,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : <span>🍽️</span>}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#2D3436' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#636e72', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#636e72', fontSize: '0.875rem' }}>
                      {canteens.find(c => c._id === (item.canteen?._id || item.canteen))?.name || '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#FF7A00' }}>{formatCurrency(item.price)}</td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={() => handleToggle(item)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button id={`edit-item-${item._id}`} className="btn-icon" onClick={() => openEdit(item)} title="Edit">
                          <FiEdit2 size={15} />
                        </button>
                        <button id={`delete-item-${item._id}`} className="btn-icon" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }} onClick={() => handleDelete(item._id)} title="Delete">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#2D3436' }}>
                {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input id="item-name" type="text" className="input-field" placeholder="e.g., Masala Dosa" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="input-field" style={{ minHeight: '80px' }} placeholder="Describe the dish..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input id="item-price" type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Canteen *</label>
                  <select id="item-canteen" className="input-field" value={form.canteen} onChange={e => setForm({ ...form, canteen: e.target.value })} required>
                    <option value="">Select canteen</option>
                    {canteens.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Item Photo *</label>
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
                        ✓ Photo attached
                      </span>
                    )}
                  </div>
                  <input 
                    id="item-image-url" 
                    type="url" 
                    className="input-field" 
                    placeholder="Or paste image URL (e.g. https://example.com/image.jpg)" 
                    value={form.imageUrl} 
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                    required 
                  />
                  <p style={{ fontSize: '0.72rem', color: '#636e72', marginTop: '2px', lineHeight: '1.4' }}>
                    💡 Tip: If pasting a link, it must be a direct link ending in .jpg, .png, .webp (not a website page).
                  </p>
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontWeight: 500, color: '#2D3436' }}>Available for ordering</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-item-btn" type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? 'Saving...' : <><FiCheck size={16} /> {editItem ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
