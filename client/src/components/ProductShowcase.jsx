
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from '../api/axios';
import { useNotification } from './NotificationProvider';
import { useAuth } from '../hooks/useAuth';

const formatINR = (paise) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise||0)/100);

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    
    // Check if it's the old Cloudinary format
    if (firstImage.url) {
      return firstImage.url;
    }
    
    // Check if it's the new MongoDB format with data
    if (firstImage.data) {
      // If data starts with 'data:', it's already a data URL
      if (firstImage.data.startsWith('data:')) {
        return firstImage.data;
      }
      // Otherwise, construct the data URL
      return `data:${firstImage.contentType || 'image/jpeg'};base64,${firstImage.data}`;
    }
  }
  
  // Fallback to old img property or placeholder
  return product.img || 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image';
};

export default function ProductShowcase() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/products?limit=50');
        if (mounted) setProducts(res.data.products || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      // Store the product that user wants to add to cart
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        quantity: 1,
        timestamp: Date.now()
      }));
      // Store the redirect destination
      localStorage.setItem('loginRedirect', '/cart');
      navigate("/login");
      return;
    }
    
    try {
      await api.post('/cart', { productId: product._id, quantity: 1 });
      showSuccess(`${product.name} added to cart!`);
    } catch (err) {
      if (err.response?.status === 401) {
        // Store the product that user wants to add to cart
        localStorage.setItem('pendingCartItem', JSON.stringify({
          productId: product._id,
          productName: product.name,
          quantity: 1,
          timestamp: Date.now()
        }));
        // Store the redirect destination
        localStorage.setItem('loginRedirect', '/cart');
        navigate("/login");
      } else {
        showError(err.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      // Store the product that user wants to add to wishlist
      localStorage.setItem('pendingWishlistItem', JSON.stringify({
        productId: productId,
        timestamp: Date.now()
      }));
      // Store the redirect destination
      localStorage.setItem('loginRedirect', '/wishlist');
      navigate("/login");
      return;
    }
    
    try {
      await api.post(`/wishlist/${productId}`);
      showSuccess('Added to wishlist');
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        showError(err.response?.data?.message || 'Failed to add to wishlist');
      }
    }
  };

  const checkPincode = (e) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(pin)) {
      setPinResult({ ok: false, msg: 'Enter a valid 6-digit pincode' });
      return;
    }
    const serviceable = ['560001', '110001', '400001'];
    const ok = serviceable.includes(pin);
    setPinResult({ ok, msg: ok ? 'Delivery available in your area' : 'Delivery not available yet' });
  };

  // Filter products by category
  const timberProducts = products.filter(product => product.category === 'timber').slice(0, 3);
  const furnitureProducts = products.filter(product => product.category === 'furniture').slice(0, 3);
  const constructionProducts = products.filter(product => product.category === 'construction').slice(0, 3);

  // Product card component
  const ProductCard = ({ product, category }) => {
    const getCategoryRoute = (category) => {
      switch (category) {
        case 'timber':
          return '/timber-products';
        case 'furniture':
          return '/furniture';
        case 'construction':
          return '/construction-materials';
        default:
          return '/timber-products';
      }
    };

    const handleProductClick = () => {
      navigate(getCategoryRoute(category));
    };

    return (
      <div 
        className="product-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="image-container">
          <img 
            src={getProductImage(product)} 
            alt={product.name} 
            className="product-image" 
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTgwSDIwMFYyMjBIMjAwVjE4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4MCAyMDBoNDBWMjIwSDE4MFYyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNzAgMTgwSDIzMFYyMjBIMTcwVjE4MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
            }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="card-content p-6">
          <div className="space-y-3">
            <h3 className="text-lg font-paragraph text-dark-brown font-medium line-clamp-2">{product.name}</h3>
            <p className="text-xl font-heading text-dark-brown font-semibold">
              {product.price ? `₹${product.price}` : formatINR(product.priceInPaise)}
            </p>
          </div>
          <div className="flex gap-2 pt-4 mt-auto">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleAddToCart(product);
              }}
              className="flex-1 bg-accent-red hover:bg-dark-brown text-white px-4 py-3 rounded-lg text-sm font-paragraph transition-colors duration-200 font-medium"
            >
              Add to Cart
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                addToWishlist(product._id || product.id);
              }}
              className="px-4 py-3 rounded-lg text-sm bg-cream text-dark-brown hover:bg-white border border-cream font-paragraph transition-colors duration-200 font-medium"
            >
              ♥ Wishlist
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Category section component
  const CategorySection = ({ title, products, description, category }) => {
    const getCategoryRoute = (category) => {
      switch (category) {
        case 'timber':
          return '/timber-products';
        case 'furniture':
          return '/furniture';
        case 'construction':
          return '/construction-materials';
        default:
          return '/timber-products';
      }
    };

    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-heading text-dark-brown mb-2">{title}</h2>
            <p className="text-dark-brown/80 font-paragraph">{description}</p>
          </div>
          <button
            onClick={() => navigate(getCategoryRoute(category))}
            className="px-6 py-2 bg-accent-red hover:bg-dark-brown text-white rounded-lg font-paragraph text-sm transition-colors duration-200"
          >
            View All {title}
          </button>
        </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="product-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="image-container">
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-t-xl" />
              </div>
              <div className="card-content p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
                <div className="flex gap-2 pt-4 mt-auto">
                  <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} category={category} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {title} Available</h3>
          <p className="text-gray-500">Check back later for new {title.toLowerCase()} products.</p>
        </div>
      )}
    </section>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading text-dark-brown mb-4">Shop by Category</h2>
          <p className="text-lg text-dark-brown/80 font-paragraph max-w-2xl mx-auto">
            Discover our premium collection of timber products, furniture, and construction materials
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-8 text-center">{error}</div>
        )}
        
        {/* Timber Products Section */}
        <CategorySection
          title="Timber Products"
          products={timberProducts}
          description="Premium quality timber for all your woodworking needs"
          category="timber"
        />

        {/* Furniture Section */}
        <CategorySection
          title="Furniture"
          products={furnitureProducts}
          description="Handcrafted furniture pieces made from the finest materials"
          category="furniture"
        />

        {/* Construction Materials Section */}
        <CategorySection
          title="Construction Materials"
          products={constructionProducts}
          description="Durable construction materials for your building projects"
          category="construction"
        />

        {/* Inline Pincode Checker */}
        <div className="mt-16 bg-cream rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-heading text-dark-brown">Check Delivery Availability</h3>
              <p className="text-dark-brown/80 font-paragraph">Enter your pincode to check service in your area.</p>
            </div>
            <form onSubmit={checkPincode} className="flex w-full md:w-auto gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. 560001"
                className="flex-1 md:w-56 border border-cream rounded-lg px-3 py-2 text-dark-brown"
                required
              />
              <button className="bg-accent-red hover:bg-dark-brown text-white px-5 py-2 rounded-lg">Check</button>
            </form>
          </div>
          {pinResult && (
            <div className={`mt-3 px-4 py-3 rounded ${pinResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{pinResult.msg}</div>
          )}
        </div>
      </div>
    </section>
  );
}
