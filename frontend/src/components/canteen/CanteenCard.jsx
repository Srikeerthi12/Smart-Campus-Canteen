import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock } from 'react-icons/fi';
import { getCanteenStatus } from '../../utils/canteenUtils';
import { formatTime } from '../../utils/formatters';
import { MdRestaurant } from 'react-icons/md';

const CANTEEN_COLORS = [
  { bg: 'linear-gradient(135deg, #FF7A00, #FFB703)', light: 'rgba(255,122,0,0.08)' },
  { bg: 'linear-gradient(135deg, #4CAF50, #81C784)', light: 'rgba(76,175,80,0.08)' },
  { bg: 'linear-gradient(135deg, #2196F3, #64B5F6)', light: 'rgba(33,150,243,0.08)' },
  { bg: 'linear-gradient(135deg, #9C27B0, #CE93D8)', light: 'rgba(156,39,176,0.08)' },
  { bg: 'linear-gradient(135deg, #F44336, #EF9A9A)', light: 'rgba(244,67,54,0.08)' },
];

const CanteenCard = ({ canteen, index = 0 }) => {
  const { isOpen, label, className } = getCanteenStatus(canteen.openTime, canteen.closeTime);
  const colorScheme = CANTEEN_COLORS[index % CANTEEN_COLORS.length];

  return (
    <Link to={`/canteens/${canteen._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="clay-card"
        style={{ overflow: 'hidden', opacity: isOpen ? 1 : 0.85 }}
      >
        {/* Header band */}
        <div style={{
          background: canteen.imageUrl ? `url(${canteen.imageUrl}) center/cover no-repeat` : colorScheme.bg,
          height: '120px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {!canteen.imageUrl && <MdRestaurant size={52} color="rgba(255,255,255,0.6)" />}
          {/* Open/Closed badge */}
          <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
            <span className={`badge ${className}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: isOpen ? '#22C55E' : '#EF4444',
                display: 'inline-block',
                boxShadow: isOpen ? '0 0 0 3px rgba(34,197,94,0.3)' : 'none',
                animation: isOpen ? 'pulse-orange 2s infinite' : 'none',
              }} />
              {label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.15rem', fontWeight: 700,
            color: '#2D3436', marginBottom: '12px',
          }}>
            {canteen.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636e72', fontSize: '0.85rem' }}>
              <FiMapPin size={14} color="#FF7A00" />
              <span>{canteen.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636e72', fontSize: '0.85rem' }}>
              <FiClock size={14} color="#FF7A00" />
              <span>{formatTime(canteen.openTime)} – {formatTime(canteen.closeTime)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636e72', fontSize: '0.85rem' }}>
              <FiPhone size={14} color="#FF7A00" />
              <span>{canteen.contactPhone}</span>
            </div>
          </div>

          <div style={{
            padding: '10px 16px',
            background: colorScheme.light,
            borderRadius: '12px',
            fontSize: '0.82rem',
            color: '#636e72',
            textAlign: 'center',
            fontWeight: 500,
          }}>
            Tap to view menu →
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CanteenCard;
