import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVendors from "./pages/AdminVendors";
import AdminStock from "./pages/AdminStock";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminSupport from "./pages/AdminSupport";
import TimberProducts from "./pages/TimberProducts";
import Furniture from "./pages/Furniture";
import ConstructionMaterials from "./pages/ConstructionMaterials";
import ProductDetail from "./pages/ProductDetail";
import CustomerHomePage from "./pages/CustomerHomePage";
import CustomerProfile from "./pages/CustomerProfile";
import LoginSecurity from "./pages/LoginSecurity";
import AddressManagement from "./pages/AddressManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import { NotificationProvider } from "./components/NotificationProvider";

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Root path: shows HomePage */}
        <Route
          path="/"
          element={<HomePage />}
        />

        {/* Homepage route */}
        <Route
          path="/home"
          element={<HomePage />}
        />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/vendors" 
          element={
            <ProtectedRoute role="admin">
              <AdminVendors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/stock" 
          element={
            <ProtectedRoute role="admin">
              <AdminStock />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute role="admin">
              <AdminProducts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/support" 
          element={
            <ProtectedRoute role="admin">
              <AdminSupport />
            </ProtectedRoute>
          } 
        />
        {/* Convenience redirect for singular path */}
        <Route path="/admin/product" element={<Navigate to="/admin/products" replace />} />

        {/* Public Product Category Routes */}
        <Route path="/timber-products" element={<TimberProducts />} />
        <Route path="/furniture" element={<Furniture />} />
        <Route path="/construction-materials" element={<ConstructionMaterials />} />
        
        {/* Product Detail Route */}
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Public Cart Route */}
        <Route path="/cart" element={<Cart />} />

        {/* Protected Customer Routes */}
        <Route 
          path="/customer-home" 
          element={
            <ProtectedRoute role="customer">
              <CustomerHomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute role="customer">
              <Wishlist />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer-profile" 
          element={<CustomerProfile />}
        />
        <Route 
          path="/login-security" 
          element={<LoginSecurity />}
        />
        <Route 
          path="/addresses" 
          element={<AddressManagement />}
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
}
