import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useNotification } from '../components/NotificationProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Furniture() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const { showSuccess, showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState(null);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageSearchMode, setIsImageSearchMode] = useState(false);
  const [_imageSearchAvailable, setImageSearchAvailable] = useState(true);
  const [cameraMode, setCameraMode] = useState('upload'); // 'upload' or 'camera'
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Logout is handled by the Header component

  const handleAddToCart = (product) => {
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
    
    (async () => {
      try {
        await api.post('/cart', { productId: product._id, quantity: 1 });
        showSuccess('Added to cart');
        // Refresh cart count in header
        refreshCartCount();
      } catch (err) {
        console.error('Add to cart failed', err);
        const msg = err?.response?.data?.message || 'Failed to add to cart';
        showError(msg);
      }
    })();
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      // Store the product that user wants to buy
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product._id,
        productName: product.name,
        quantity: 1,
        timestamp: Date.now()
      }));
      // Store the redirect destination as checkout
      localStorage.setItem('loginRedirect', '/checkout');
      navigate("/login");
      return;
    }
    
    (async () => {
      try {
        await api.post('/cart', { productId: product._id, quantity: 1 });
        // Refresh cart count in header
        refreshCartCount();
        // Immediately redirect to checkout
        navigate('/checkout');
      } catch (err) {
        console.error('Buy now failed', err);
        const msg = err?.response?.data?.message || 'Failed to process order';
        showError(msg);
      }
    })();
  };

  const handleImageSearchClick = () => {
    // Always allow opening the modal - let the actual search handle errors
    setShowImageSearchModal(true);
    setCameraMode('upload');
    setSelectedImage(null);
    setCameraError(null);
  };

  // Start camera when switching to camera mode
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions or use file upload instead.');
      setCameraMode('upload');
    }
  };

  // Stop camera when switching away or closing modal
  const stopCamera = () => {
    setStream((currentStream) => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        stopCamera();
        setCameraMode('upload');
      }
    }, 'image/jpeg', 0.95);
  };

  // Handle mode switch
  const handleModeSwitch = (mode) => {
    if (mode === 'camera') {
      setCameraMode('camera');
      setSelectedImage(null);
      startCamera();
    } else {
      stopCamera();
      setCameraMode('upload');
      setSelectedImage(null);
    }
  };

  // Cleanup camera on unmount or modal close
  useEffect(() => {
    if (!showImageSearchModal) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showImageSearchModal]);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      handleImageSearch(file);
    }
  };

  const handleImageSearch = async (imageFile) => {
    try {
      setImageSearchLoading(true);
      setShowImageSearchModal(false);
      setIsImageSearchMode(true);
      setImageSearchResults(null);

      // Validate image file
      if (!imageFile) {
        showError('Please select an image file');
        setImageSearchLoading(false);
        return;
      }

      // Check file size (5MB limit)
      if (imageFile.size > 5 * 1024 * 1024) {
        showError('Image file is too large. Maximum size is 5MB.');
        setImageSearchLoading(false);
        return;
      }

      // Check file type
      if (!imageFile.type.startsWith('image/')) {
        showError('Please select a valid image file');
        setImageSearchLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('top_k', '15'); // Get more results for better filtering

      console.log('Sending image search request:', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        topK: 15
      });

      const response = await api.post('/ml/image-search/by-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for image processing
      });

      console.log('Image search response received:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasResults: !!response.data.data?.results,
        resultsCount: response.data.data?.results?.length || 0,
        responseStructure: {
          success: response.data.success,
          data: response.data.data ? {
            query_image: response.data.data.query_image,
            total_results: response.data.data.total_results,
            top_k: response.data.data.top_k,
            resultsLength: response.data.data.results?.length
          } : null
        }
      });

      if (!response.data.success) {
        showError(response.data.message || 'Image search failed');
        setIsImageSearchMode(false);
        setImageSearchResults(null);
        setImageSearchLoading(false);
        return;
      }

      if (!response.data.data) {
        showError('Invalid response from image search service');
        setIsImageSearchMode(false);
        setImageSearchResults(null);
        setImageSearchLoading(false);
        return;
      }

      if (!response.data.data.results || response.data.data.results.length === 0) {
        showError('No similar products found. Try a different image or check if similar products exist in the catalog.');
        setIsImageSearchMode(false);
        setImageSearchResults(null);
        setImageSearchLoading(false);
        return;
      }

      const results = response.data.data.results;
      setImageSearchResults(results);
        
      console.log('Image search results received:', {
        totalResults: results.length,
        results: results.map(r => ({
          id: r.id,
          product_id: r.product_id,
          product_name: r.product_name,
          filename: r.filename,
          score: r.score?.toFixed(3)
        }))
      });
      
      // Filter results by minimum similarity score (only high-confidence matches)
      // Higher threshold ensures only truly similar products are shown
      const MIN_SIMILARITY_SCORE = 0.70; // 70% similarity required for accurate matches
      const highConfidenceResults = results.filter(r => r.score >= MIN_SIMILARITY_SCORE);
      
      console.log('High confidence results:', highConfidenceResults.length, 'out of', results.length);
      
      // Create a map of products by ID for fast lookup (handle both string and ObjectId formats)
      const productsById = {};
      const productsByName = {};
      products.forEach(product => {
        const productId = product._id?.toString() || product._id;
        productsById[productId] = product;
        productsById[productId.toLowerCase()] = product; // Also store lowercase version
        productsByName[product.name.toLowerCase()] = product;
      });
      
      console.log('Product lookup maps created:', {
        totalProducts: products.length,
        productsByIdKeys: Object.keys(productsById).length,
        productsByNameKeys: Object.keys(productsByName).length,
        sampleProductIds: products.slice(0, 3).map(p => p._id?.toString())
      });
      
      // Try to match results with actual products
      const matchedProducts = [];
      const usedProductIds = new Set(); // Avoid duplicates
      
      // Sort results by similarity score (highest first)
      const sortedResults = [...highConfidenceResults].sort((a, b) => b.score - a.score);
      
      console.log('Attempting to match', sortedResults.length, 'results with products...');
      
      for (const result of sortedResults) {
        let matched = null;
        
        // Strategy 1: Direct product_id match (most reliable)
        if (result.product_id) {
          const productIdStr = String(result.product_id).trim();
          // Try exact match
          matched = productsById[productIdStr] || productsById[productIdStr.toLowerCase()];
          
          if (matched && !usedProductIds.has(matched._id?.toString())) {
            usedProductIds.add(matched._id?.toString());
            matchedProducts.push({
              ...matched,
              similarityScore: result.score,
              searchResult: { ...result, matchMethod: 'product_id' }
            });
            console.log(`✅ Matched by product_id: ${productIdStr} -> ${matched.name} (score: ${result.score.toFixed(3)})`);
            continue;
          } else if (result.product_id) {
            console.log(`⚠️ Product ID not found in database: ${productIdStr}`);
          }
        }
        
        // Strategy 2: Product name match from metadata
        if (result.product_name && !matched) {
          const productNameLower = result.product_name.toLowerCase().trim();
          matched = productsByName[productNameLower];
          
          if (matched && !usedProductIds.has(matched._id?.toString())) {
            usedProductIds.add(matched._id?.toString());
            matchedProducts.push({
              ...matched,
              similarityScore: result.score,
              searchResult: { ...result, matchMethod: 'product_name' }
            });
            console.log(`✅ Matched by product_name: "${result.product_name}" -> ${matched.name} (score: ${result.score.toFixed(3)})`);
            continue;
          } else if (result.product_name) {
            console.log(`⚠️ Product name not found: "${result.product_name}"`);
          }
        }
        
        // Strategy 3: Match by filename/keywords (fallback)
        if (!matched) {
          const filename = result.filename || '';
          const filenameLower = filename.toLowerCase();
          
          // Extract keywords from filename
          const keywords = filenameLower
            .replace(/\.[^/.]+$/, '') // Remove extension
            .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
            .split(/\s+/) // Split by spaces
            .filter(k => k.length > 2); // Filter out very short words
          
          // Try to find matching product
          for (const product of products) {
            if (usedProductIds.has(product._id)) continue;
            
            const productNameLower = product.name.toLowerCase();
            
            // Check if any keyword from filename appears in product name
            const keywordMatch = keywords.some(keyword => 
              productNameLower.includes(keyword) || keyword.includes(productNameLower.split(' ')[0])
            );
            
            // Check for common furniture type matches
            const furnitureTypes = {
              'bed': ['bed', 'mattress', 'bunk'],
              'chair': ['chair', 'seat', 'stool'],
              'table': ['table', 'desk'],
              'sofa': ['sofa', 'couch', 'settee'],
              'wardrobe': ['wardrobe', 'closet', 'cabinet'],
              'bookshelf': ['bookshelf', 'shelf', 'bookcase'],
              'dining': ['dining', 'dinner'],
              'study': ['study', 'office', 'work']
            };
            
            let typeMatch = false;
            for (const [, variations] of Object.entries(furnitureTypes)) {
              if (keywords.some(k => variations.includes(k)) && 
                  variations.some(v => productNameLower.includes(v))) {
                typeMatch = true;
                break;
              }
            }
            
            if (keywordMatch || typeMatch) {
              matched = product;
              break;
            }
          }
          
          if (matched && !usedProductIds.has(matched._id?.toString())) {
            usedProductIds.add(matched._id?.toString());
            matchedProducts.push({
              ...matched,
              similarityScore: result.score,
              searchResult: { ...result, matchMethod: 'filename' }
            });
            console.log(`✅ Matched by filename: "${result.filename}" -> ${matched.name} (score: ${result.score.toFixed(3)})`);
          }
        }
      }
      
      // Sort matched products by similarity score (highest first)
      matchedProducts.sort((a, b) => b.similarityScore - a.similarityScore);

      console.log('=== MATCHING SUMMARY ===');
      console.log('Total results from Pinecone:', results.length);
      console.log('High confidence results (>=70%):', highConfidenceResults.length);
      console.log('Successfully matched products:', matchedProducts.length);
      console.log('Matched products:', matchedProducts.map(p => ({
        id: p._id,
        name: p.name,
        score: p.similarityScore?.toFixed(3),
        matchMethod: p.searchResult?.matchMethod || 'filename'
      })));
      
      if (matchedProducts.length === 0 && highConfidenceResults.length > 0) {
        console.warn('⚠️ No products matched despite having search results!');
        console.warn('Sample results that failed to match:', sortedResults.slice(0, 5).map(r => ({
          product_id: r.product_id,
          product_name: r.product_name,
          filename: r.filename,
          score: r.score?.toFixed(3)
        })));
      }

      if (matchedProducts.length > 0) {
        // Only show if we have truly similar products (70%+ similarity)
        const topScore = matchedProducts[0].similarityScore;
        if (topScore >= 0.70) {
          setFilteredProducts(matchedProducts);
          showSuccess(`Found ${matchedProducts.length} similar product${matchedProducts.length > 1 ? 's' : ''}! (Similarity: ${(topScore * 100).toFixed(0)}%+)`);
        } else {
          // Results are not similar enough
          showError(`No truly similar products found. The uploaded image doesn't match any products in our catalog with sufficient similarity (minimum 70% required).`);
          setIsImageSearchMode(false);
          setImageSearchResults(null);
        }
      } else {
        // If no matches but we have results, show more helpful message
        if (highConfidenceResults.length > 0) {
          showError(`Found ${highConfidenceResults.length} similar images, but couldn't match them to products in the catalog. The products may need to be re-indexed.`);
        } else if (results.length > 0) {
          // We have results but they're below the similarity threshold
          const maxScore = Math.max(...results.map(r => r.score || 0));
          showError(`No similar products found. The best match had only ${(maxScore * 100).toFixed(0)}% similarity, which is below the required 70% threshold for accurate matches.`);
        } else {
          showError(`No similar products found. The uploaded image doesn't match any products in our catalog. Try uploading a different image or check if similar products exist.`);
        }
        setIsImageSearchMode(false);
        setImageSearchResults(null);
      }
    } catch (err) {
      console.error('Image search error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        config: {
          url: err?.config?.url,
          method: err?.config?.method,
          timeout: err?.config?.timeout
        }
      });
      
      // Handle different error types
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        showError('Image search timed out. The image might be too large or the service is slow. Please try again with a smaller image.');
      } else if (err?.response?.status === 503 || err?.code === 'ERR_NETWORK' || err?.code === 'ECONNREFUSED') {
        setImageSearchAvailable(false);
        console.warn(
          '⚠️ Image Search Service Not Available\n' +
          'The image search feature requires the FastAPI service to be running.\n' +
          'To enable image search:\n\n' +
          'QUICK START (Windows):\n' +
          '1. Open a new terminal/command prompt\n' +
          '2. Navigate to: ml\\image_matching\\api\n' +
          '3. Run: start_api_improved.bat\n' +
          '   (or manually: python -m uvicorn main:app --host 0.0.0.0 --port 8000)\n\n' +
          'MANUAL SETUP:\n' +
          '1. Navigate to: ml/image_matching/api\n' +
          '2. Install dependencies: pip install -r requirements.txt\n' +
          '3. Start the service: uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n' +
          '4. Ensure your .env file has PINECONE_API_KEY configured\n\n' +
          'The service will be available at http://localhost:8000\n' +
          'API docs: http://localhost:8000/docs\n\n' +
          'See ml/image_matching/api/README.md for detailed setup instructions.'
        );
        showError('Image search service is unavailable. Please start the FastAPI service (see console for instructions).');
      } else if (err?.response?.status === 400) {
        const errorMsg = err?.response?.data?.message || 'Invalid image file. Please try a different image.';
        showError(errorMsg);
      } else if (err?.response?.status === 413) {
        showError('Image file is too large. Maximum size is 5MB.');
      } else if (err?.response?.status === 500) {
        const errorMsg = err?.response?.data?.message || 
                        err?.response?.data?.error || 
                        err?.response?.data?.detail ||
                        'Server error during image search. Please try again.';
        showError(errorMsg);
        console.error('Server error details:', {
          message: err?.response?.data?.message,
          error: err?.response?.data?.error,
          detail: err?.response?.data?.detail,
          code: err?.response?.data?.code,
          fullResponse: err?.response?.data
        });
      } else {
        // For other errors, show a user-friendly message
        const errorMsg = err?.response?.data?.message || 
                        err?.response?.data?.error || 
                        err?.message ||
                        'Image search failed. Please try again.';
        showError(errorMsg);
        console.warn('Image search error:', errorMsg);
      }
      
      setIsImageSearchMode(false);
      setImageSearchResults(null);
    } finally {
      setImageSearchLoading(false);
    }
  };

  const handleClearImageSearch = () => {
    setIsImageSearchMode(false);
    setImageSearchResults(null);
    setSelectedImage(null);
    setFilteredProducts(products);
    setSearchTerm('');
  };

  // Check if image search service is available (silently, don't block UI)
  useEffect(() => {
    const checkImageSearchService = async () => {
      try {
        const response = await api.get('/ml/image-search/health', {
          timeout: 3000 // 3 second timeout
        });
        if (response.data.success && response.data.status?.status === 'healthy') {
          setImageSearchAvailable(true);
        } else {
          setImageSearchAvailable(false);
        }
      } catch {
        // Silently fail - don't show error, just assume service is not available
        // User can still try to use it, and will get a proper error message if it fails
        setImageSearchAvailable(false);
      }
    };

    // Check after a short delay to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      checkImageSearchService();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Fetch furniture products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products?limit=100');
        const allProducts = response.data.products || [];
        // Filter only furniture products
        const furnitureProducts = allProducts.filter(product => product.category === 'furniture');
        setProducts(furnitureProducts);
        setFilteredProducts(furnitureProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load furniture products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    // Don't apply text search filter if in image search mode
    if (isImageSearchMode) {
      return; // filteredProducts is set by handleImageSearch
    }

    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'material':
          aValue = a.material?.toLowerCase() || '';
          bValue = b.material?.toLowerCase() || '';
          break;
        case 'brand':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, sortOrder, isImageSearchMode]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
      <p className="text-red-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-cream to-light-cream py-2 lg:py-3 rounded-2xl mb-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-red rounded-full opacity-10"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-dark-brown rounded-full opacity-5"></div>
          
          <div className="text-center relative z-10">
            <h1 className="text-xl lg:text-3xl font-heading text-dark-brown leading-tight mb-2">
              Handcrafted Furniture
            </h1>
            <p className="text-sm text-gray-700 font-paragraph leading-relaxed max-w-xl mx-auto mb-3">
              Discover our curated collection of handcrafted furniture pieces. 
              Each piece is made from the finest materials with attention to detail and craftsmanship.
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        {!loading && !error && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative flex items-center">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder={isImageSearchMode ? "Image search active - Click camera icon to search again" : "Search furniture products..."}
                    value={searchTerm}
                    onChange={(e) => {
                      if (!isImageSearchMode) {
                        setSearchTerm(e.target.value);
                      }
                    }}
                    disabled={isImageSearchMode}
                    className={`w-full pl-9 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200 text-sm ${
                      isImageSearchMode ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleImageSearchClick}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-200 group hover:bg-gray-100"
                    title="Search by image"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500 transition-colors group-hover:text-accent-red"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  {isImageSearchMode && (
                    <button
                      type="button"
                      onClick={handleClearImageSearch}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      title="Clear image search"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500 hover:text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="material">Sort by Material</option>
                  <option value="brand">Sort by Brand</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 text-sm"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {isImageSearchMode ? (
                  <>
                    Showing {filteredProducts.length} similar products from image search
                    {imageSearchResults && (
                      <span className="ml-2 text-accent-red">
                        ({imageSearchResults.length} matches found)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing {filteredProducts.length} of {products.length} products
                    {searchTerm && (
                      <span className="ml-2">
                        for "<span className="font-medium text-dark-brown">{searchTerm}</span>"
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mt-2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="aspect-square w-full bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-full"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {/* Image Search Loading */}
        {imageSearchLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mb-4"></div>
              <p className="text-gray-600 font-medium">Searching for similar products...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          </div>
        )}

        {/* Image Search Modal */}
        {showImageSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search by Image</h3>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowImageSearchModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => handleModeSwitch('upload')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    cameraMode === 'upload'
                      ? 'text-accent-red border-b-2 border-accent-red'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => handleModeSwitch('camera')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    cameraMode === 'camera'
                      ? 'text-accent-red border-b-2 border-accent-red'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Camera
                </button>
              </div>
              
              {/* Upload Mode */}
              {cameraMode === 'upload' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload an image to find similar furniture
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-accent-red transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-accent-red hover:text-accent-red/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-red">
                          <span>Upload an image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                  {selectedImage && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Selected image:</p>
                      <div className="relative inline-block">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Selected"
                          className="h-32 w-auto rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Camera Mode */}
              {cameraMode === 'camera' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Take a photo to find similar furniture
                  </label>
                  {cameraError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{cameraError}</p>
                  </div>
                  )}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center text-white">
                          <svg
                            className="mx-auto h-12 w-12 mb-2 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <p className="text-sm">Starting camera...</p>
                        </div>
                      </div>
                    )}
                    {/* Hidden canvas for capturing */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  {stream && (
                    <button
                      onClick={capturePhoto}
                      className="mt-4 w-full py-3 px-4 bg-accent-red text-white rounded-lg hover:bg-accent-red/90 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Capture Photo
                    </button>
                  )}
                  {selectedImage && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Captured image:</p>
                      <div className="relative inline-block">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Captured"
                          className="h-32 w-auto rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    stopCamera();
                    setShowImageSearchModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {selectedImage && (
                  <button
                    onClick={() => {
                      stopCamera();
                      handleImageSearch(selectedImage);
                    }}
                    className="flex-1 px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-accent-red/90 transition-colors"
                  >
                    Search
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="space-y-8">
                {/* Products Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Our Furniture Collection</h2>
                    <p className="text-gray-600 mt-1">Discover {filteredProducts.length} handcrafted furniture pieces</p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  ))}
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">No furniture products match your search criteria. Try adjusting your search terms or filters.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center gap-2 bg-dark-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-red transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Furniture Available</h3>
                  <p className="text-gray-500 mb-6">We're working on adding new furniture pieces. Check back soon!</p>
                  <button
                    onClick={() => navigate('/customer-home')}
                    className="inline-flex items-center gap-2 bg-dark-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-red transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}
