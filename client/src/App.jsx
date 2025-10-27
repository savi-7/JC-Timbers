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
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/OrderHistory";
import AdminOrders from "./pages/AdminOrders";
import MyReviews from "./pages/MyReviews";
import AdminReviews from "./pages/AdminReviews";
import { NotificationProvider } from "./components/NotificationProvider";
import { CartProvider } from "./contexts/CartContext";

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
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
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

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
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reviews" 
          element={
            <ProtectedRoute role="admin">
              <AdminReviews />
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

        {/* Checkout and Order Routes */}
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute role="customer">
              <CheckoutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-success" 
          element={
            <ProtectedRoute role="customer">
              <OrderSuccess />
            </ProtectedRoute>
          } 
        />

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
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute role="customer">
              <OrderHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-reviews" 
          element={
            <ProtectedRoute role="customer">
              <MyReviews />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-history" 
          element={
            <ProtectedRoute role="customer">
              <OrderHistory />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </CartProvider>
    </NotificationProvider>
  );
}
