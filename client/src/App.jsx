import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVendors from "./pages/AdminVendors";
import AdminStock from "./pages/AdminStock";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminOrderDetail from "./pages/AdminOrderDetail";
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
import ServicePage from "./pages/ServicePage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/OrderHistory";
import AdminOrders from "./pages/AdminOrders";
import MyReviews from "./pages/MyReviews";
import AdminReviews from "./pages/AdminReviews";
import TimberCalculator from "./pages/TimberCalculator";
import Marketplace from "./pages/Marketplace";
import MarketplaceProfile from "./pages/MarketplaceProfile";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import ListingDetail from "./pages/ListingDetail";
import MarketplaceInbox from "./pages/MarketplaceInbox";
import SavedItems from "./pages/SavedItems";
import RecentlyViewed from "./pages/RecentlyViewed";
import MarketplaceFollowing from "./pages/MarketplaceFollowing";
import LocationSettings from "./pages/LocationSettings";
import EnableSellerDashboard from "./pages/EnableSellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import SellerInbox from "./pages/SellerInbox";
import SellerFollowers from "./pages/SellerFollowers";
import SellerLocation from "./pages/SellerLocation";
import { NotificationProvider } from "./components/NotificationProvider";
import { CartProvider } from "./contexts/CartContext";
import AdminWoodQuality from "./pages/AdminWoodQuality";
import AdminServiceSchedule from "./pages/AdminServiceSchedule";
import AdminServiceEnquiries from "./pages/AdminServiceEnquiries";
import AdminTimberCuttingEnquiry from "./pages/AdminTimberCuttingEnquiry";
import AdminMachineryMonitoring from "./pages/AdminMachineryMonitoring";
import AdminAfterSaleRequests from "./pages/AdminAfterSaleRequests";
import AdminAfterSaleRequestDetail from "./pages/AdminAfterSaleRequestDetail";
import AfterSaleRequestPage from "./pages/AfterSaleRequestPage";
import MyAfterSaleRequests from "./pages/MyAfterSaleRequests";
import AfterSaleRequestDetail from "./pages/AfterSaleRequestDetail";
import ServiceEnquiry from "./pages/ServiceEnquiry";
import MyServiceEnquiries from "./pages/MyServiceEnquiries";
import TimberProcessingForm from "./pages/TimberProcessingForm";
import AdminEnquiries from "./pages/AdminEnquiries";
import MyFurnitureEnquiries from "./pages/MyFurnitureEnquiries";
import RequestQuote from "./pages/RequestQuote";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminContentManagement from "./pages/AdminContentManagement";
import WoodpeckerChatbot from "./components/WoodpeckerChatbot";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

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
          <Route path="/service" element={<ServicePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/about-us" element={<AboutUs />} />
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
            path="/admin/users/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminUserDetail />
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
            path="/admin/orders/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminOrderDetail />
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
          <Route
            path="/admin/timber-calculator"
            element={
              <ProtectedRoute role="admin">
                <TimberCalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wood-quality"
            element={
              <ProtectedRoute role="admin">
                <AdminWoodQuality />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/machinery-monitoring"
            element={
              <ProtectedRoute role="admin">
                <AdminMachineryMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/service-schedule"
            element={
              <ProtectedRoute role="admin">
                <AdminServiceSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/service-enquiries"
            element={
              <ProtectedRoute role="admin">
                <AdminServiceEnquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/after-sale"
            element={
              <ProtectedRoute role="admin">
                <AdminAfterSaleRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/after-sale/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminAfterSaleRequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute role="admin">
                <AdminEnquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute role="admin">
                <AdminContentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timber-cutting-enquiry"
            element={
              <ProtectedRoute role="admin">
                <AdminTimberCuttingEnquiry />
              </ProtectedRoute>
            }
          />
          {/* Convenience redirect for singular path */}
          <Route path="/admin/product" element={<Navigate to="/admin/products" replace />} />

          {/* Public Product Category Routes */}
          <Route path="/timber-products" element={<TimberProducts />} />
          <Route path="/furniture" element={<Furniture />} />
          <Route path="/construction-materials" element={<ConstructionMaterials />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/listing/:id" element={<ListingDetail />} />
          <Route path="/marketplace/profile" element={<MarketplaceProfile />} />
          <Route
            path="/marketplace/inbox"
            element={
              <ProtectedRoute role="customer">
                <MarketplaceInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/saved-items"
            element={
              <ProtectedRoute role="customer">
                <SavedItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/recently-viewed"
            element={
              <ProtectedRoute role="customer">
                <RecentlyViewed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/following"
            element={
              <ProtectedRoute role="customer">
                <MarketplaceFollowing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/location"
            element={
              <ProtectedRoute role="customer">
                <LocationSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/enable-seller"
            element={
              <ProtectedRoute role="customer">
                <EnableSellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/seller-profile"
            element={
              <ProtectedRoute role="customer">
                <SellerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/seller-inbox"
            element={
              <ProtectedRoute role="customer">
                <SellerInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/seller-followers"
            element={
              <ProtectedRoute role="customer">
                <SellerFollowers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/seller-location"
            element={
              <ProtectedRoute role="customer">
                <SellerLocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/create-listing"
            element={
              <ProtectedRoute role="customer">
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/my-listings"
            element={
              <ProtectedRoute role="customer">
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/edit-listing/:id"
            element={
              <ProtectedRoute role="customer">
                <EditListing />
              </ProtectedRoute>
            }
          />

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
            path="/services/enquiry"
            element={
              <ProtectedRoute role="customer">
                <ServiceEnquiry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/timber-processing"
            element={
              <ProtectedRoute role="customer">
                <TimberProcessingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/my-enquiries"
            element={
              <ProtectedRoute role="customer">
                <MyServiceEnquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/after-sale/new"
            element={
              <ProtectedRoute role="customer">
                <AfterSaleRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-after-sale-requests"
            element={
              <ProtectedRoute role="customer">
                <MyAfterSaleRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/after-sale/:id"
            element={
              <ProtectedRoute role="customer">
                <AfterSaleRequestDetail />
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
          <Route
            path="/my-enquiries"
            element={
              <ProtectedRoute role="customer">
                <MyFurnitureEnquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/furniture/request-quote"
            element={
              <ProtectedRoute role="customer">
                <RequestQuote />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Global Chatbot Component (hidden on admin routes) */}
        {!isAdminRoute && <WoodpeckerChatbot />}
      </CartProvider>
    </NotificationProvider>
  );
}
