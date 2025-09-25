import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signInWithGoogle, resetPassword } from "../firebase";
import chrisLee70L1Tdai6RmUnsplash1 from "../assets/chris-lee-70l1tdai6rm-unsplash-1.png";
import { API_BASE } from "../config";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../components/NotificationProvider";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fieldStates, setFieldStates] = useState({});
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Handle browser back button and prevent access to protected routes when logged out
  useEffect(() => {
    // If user is already authenticated, redirect them away from login page
    if (isAuthenticated) {
      navigate('/customer-home', { replace: true });
      return;
    }

    // Handle browser back button
    const handlePopState = () => {
      // Replace current history entry to prevent going back to protected routes
      window.history.replaceState(null, '', '/');
    };

    // Add event listener for browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
    
    // Replace current history entry to prevent back navigation to protected routes
    window.history.replaceState(null, '', '/login');
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, isAuthenticated]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Update field state
    setFieldStates((prev) => ({ ...prev, [name]: "typing" }));
  };

  // Handle focus
  const handleFocus = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldStates((prev) => ({ ...prev, [name]: "focused" }));
  };

  // Handle blur with validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldStates((prev) => ({ ...prev, [name]: "blurred" }));
    
    // Validate field on blur
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.com$/i.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;
        
      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = "Password must contain at least one number";
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          newErrors.password = "Password must contain at least one special character (@$!%*?&)";
        } else {
          delete newErrors.password;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character (@$!%*?&)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to redirect based on role
  const redirectBasedOnRole = (userRole) => {
    // Check if there's a pending cart item and redirect destination
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    const pendingWishlistItem = localStorage.getItem('pendingWishlistItem');
    const loginRedirect = localStorage.getItem('loginRedirect');
    
    if (pendingCartItem && loginRedirect === '/cart' && userRole === 'customer') {
      // Clear the stored items
      localStorage.removeItem('pendingCartItem');
      localStorage.removeItem('loginRedirect');
      navigate("/cart", { replace: true });
      return;
    }
    
    if (pendingWishlistItem && loginRedirect === '/wishlist' && userRole === 'customer') {
      // Clear the stored items
      localStorage.removeItem('pendingWishlistItem');
      localStorage.removeItem('loginRedirect');
      navigate("/wishlist", { replace: true });
      return;
    }
    
    if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (userRole === "customer") {
      navigate("/customer-home", { replace: true });
    } else {
      // Fallback to homepage for unknown roles
      navigate("/", { replace: true });
    }
  };

  // Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // Use auth hook to handle login
      login(response.data.token, response.data.user, response.data.user.role);

      const userRole = response.data.user.role;
      showSuccess(`Login successful! Redirecting to your ${userRole === 'admin' ? 'admin' : userRole} dashboard...`);
      
      // Redirect based on role
      redirectBasedOnRole(userRole);
    } catch (err) {
      showError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      const googleData = {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      };

      const res = await axios.post(`${API_BASE}/auth/google`, googleData);

      // Use auth hook to handle login
      login(res.data.token, res.data.user, res.data.user.role);

      const userRole = res.data.user.role;
      showSuccess(`Google sign-in successful! Redirecting to your ${userRole === 'admin' ? 'admin' : userRole} dashboard...`);
      
      // Redirect based on role
      redirectBasedOnRole(userRole);
    } catch (error) {
      showError("Google sign-in failed. Please try again.");
      console.error(error);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    try {
      if (!formData.email) {
        showError("Please enter your email address first.");
        return;
      }
      await resetPassword(formData.email);
      showSuccess("Password reset email sent — check your inbox!");
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' ... %3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Left Section - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={chrisLee70L1Tdai6RmUnsplash1}
          alt="Timber logs"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8 lg:py-12 min-h-full">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl border-4 border-gray-500/20">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">
              Sign in to your timber account
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg
                          className={`w-5 h-5 transition-colors duration-200 ${
                            errors.email && touched.email 
                              ? "text-red-500" 
                              : fieldStates.email === "focused" 
                                ? "text-blue-500" 
                                : "text-gray-700"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                          errors.email && touched.email
                            ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                            : fieldStates.email === "focused"
                              ? "border-blue-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-blue-50/50"
                              : "border-gray-200 focus:ring-4 focus:ring-gray-500/30 focus:border-gray-500 bg-white/80 hover:border-gray-300"
                        }`}
                      />
                      {errors.email && touched.email && (
                        <div className="mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-600">{errors.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg
                          className={`w-5 h-5 transition-colors duration-200 ${
                            errors.password && touched.password 
                              ? "text-red-500" 
                              : fieldStates.password === "focused" 
                                ? "text-blue-500" 
                                : "text-gray-700"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm6 0H6a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                          errors.password && touched.password
                            ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                            : fieldStates.password === "focused"
                              ? "border-blue-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-blue-50/50"
                              : "border-gray-200 focus:ring-4 focus:ring-gray-500/30 focus:border-gray-500 bg-white/80 hover:border-gray-300"
                        }`}
                      />
                      {errors.password && touched.password && (
                        <div className="mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-600">{errors.password}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-gray-700 hover:text-gray-800 font-medium transition-colors duration-200"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4..."
                      ></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-4 sm:my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="px-3 sm:px-4 text-gray-600 font-medium text-xs sm:text-sm">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white/90 border border-gray-200 text-gray-800 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:border-gray-300 transform hover:scale-[1.02] transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-sm sm:text-base">
                  Sign in with Google
                </span>
              </button>

              {/* Register */}
              <div className="text-center pt-3 sm:pt-4">
                <span className="text-gray-700 text-sm sm:text-base">
                  Don't have an account?{" "}
                </span>
                <button
                  onClick={() => navigate("/register")}
                  className="text-gray-800 hover:text-gray-900 font-semibold hover:underline text-sm sm:text-base"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}