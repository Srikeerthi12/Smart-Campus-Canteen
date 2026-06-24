import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, OwnerRoute, SuperAdminRoute, PublicRoute } from './ProtectedRoute';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Student pages
import Dashboard from '../pages/student/Dashboard';
import Canteens from '../pages/student/Canteens';
import CanteenDetail from '../pages/student/CanteenDetail';
import Cart from '../pages/student/Cart';
import Orders from '../pages/student/Orders';
import Profile from '../pages/student/Profile';

// Owner + Admin shared pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import MenuManagement from '../pages/admin/MenuManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import CanteenSettings from '../pages/admin/CanteenSettings';
import OwnerManagement from '../pages/admin/OwnerManagement';
import OwnerSettings from '../pages/admin/OwnerSettings';
import AnalyticsDashboard from '../pages/admin/AnalyticsDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student Routes — protected, only accessible to logged-in users */}
      <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canteens" element={<Canteens />} />
        <Route path="/canteens/:id" element={<CanteenDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Canteen Owner Routes */}
      <Route element={<OwnerRoute><AdminLayout role="owner" /></OwnerRoute>}>
        <Route path="/owner" element={<AdminDashboard />} />
        <Route path="/owner/menu" element={<MenuManagement />} />
        <Route path="/owner/orders" element={<OrderManagement />} />
        <Route path="/owner/settings" element={<OwnerSettings />} />
      </Route>

      {/* Super Admin Routes */}
      <Route element={<SuperAdminRoute><AdminLayout role="superAdmin" /></SuperAdminRoute>}>
        <Route path="/superadmin" element={<AdminDashboard />} />
        <Route path="/superadmin/canteens" element={<CanteenSettings />} />
        <Route path="/superadmin/owners" element={<OwnerManagement />} />
        <Route path="/superadmin/analytics" element={<AnalyticsDashboard />} />
      </Route>

      {/* Catch-all — redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
