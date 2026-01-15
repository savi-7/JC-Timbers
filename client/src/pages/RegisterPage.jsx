// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import chrisLee70L1Tdai6RmUnsplash1 from "../assets/chris-lee-70l1tdai6rm-unsplash-1.png";
import { useNotification } from "../components/NotificationProvider";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fieldStates, setFieldStates] = useState({});

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Filter input for specific fields
    let filteredValue = value;
    if (name === "phone") {
      // Only allow digits
      filteredValue = value.replace(/\D/g, "");
    } else {
      // For other fields, use the original value
      filteredValue = value;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : filteredValue,
    }));
    // Mark checkboxes as touched immediately so validation messages can show
    if (type === "checkbox") {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
    
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
      case "firstName":
        if (!value.trim()) {
          newErrors.firstName = "First name is required";
        } else if (value !== value.trim()) {
          newErrors.firstName = "First name cannot have leading or trailing spaces";
        } else if (value.includes(" ")) {
          newErrors.firstName = "First name cannot contain spaces";
        } else if (value.length < 2) {
          newErrors.firstName = "First name must be at least 2 characters";
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          newErrors.firstName = "First name should only contain letters";
        } else {
          delete newErrors.firstName;
        }
        break;
        
      case "lastName":
        if (!value.trim()) {
          newErrors.lastName = "Last name is required";
        } else if (value !== value.trim()) {
          newErrors.lastName = "Last name cannot have leading or trailing spaces";
        } else if (value.includes(" ")) {
          newErrors.lastName = "Last name cannot contain spaces";
        } else if (value.length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters";
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          newErrors.lastName = "Last name should only contain letters";
        } else {
          delete newErrors.lastName;
        }
        break;
        
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.com$/i.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;
        
      case "phone": {
        const phoneDigits = value.replace(/\D/g, "");
        if (!value.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (phoneDigits.length !== 10) {
          newErrors.phone = "Phone number must be exactly 10 digits";
        } else if (!/^[6-9]/.test(phoneDigits)) {
          newErrors.phone = "Phone number not in proper format";
        } else {
          delete newErrors.phone;
        }
        break;
      }
        
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
        
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    const phoneRegex = /^[6-9][0-9]{9}$/; // 10 digits starting with 6,7,8,9 (India standard)

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName !== formData.firstName.trim()) {
      newErrors.firstName = "First name cannot have leading or trailing spaces";
    } else if (formData.firstName.includes(" ")) {
      newErrors.firstName = "First name cannot contain spaces";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name should only contain letters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName !== formData.lastName.trim()) {
      newErrors.lastName = "Last name cannot have leading or trailing spaces";
    } else if (formData.lastName.includes(" ")) {
      newErrors.lastName = "Last name cannot contain spaces";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name should only contain letters";
    }

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) newErrors.phone = "Phone number not in proper format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])/.test(formData.password)) newErrors.password = "Password must contain at least one lowercase letter";
    else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = "Password must contain at least one uppercase letter";
    else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = "Password must contain at least one number";
    else if (!/(?=.*[@$!%*?&])/.test(formData.password)) newErrors.password = "Password must contain at least one special character (@$!%*?&)";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms & policy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Force all fields as touched so users immediately see any validation issues
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    });
    if (!validate()) return;
    try {
      await axios.post("http://localhost:5001/api/auth/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      showSuccess("Registration successful!");
      navigate("/login");
    } catch (err) {
      showError(err.response?.data?.message || "Registration failed");
    }
  };


  

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row relative overflow-hidden">
      {/* Timber pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232E0F13' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
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
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-dark-brown to-accent-red rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl border-4 border-accent-red/20">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-brown mb-2 sm:mb-3">
              Get Started Now
            </h1>
            <p className="text-dark-brown/70 text-sm sm:text-base lg:text-lg font-paragraph font-medium px-2 sm:px-0">
              Create your JC Timbers account
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-dark-brown/20/50 relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite'
              }}></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-dark-brown font-paragraph">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${
                      errors.firstName && touched.firstName 
                        ? "text-red-500" 
                        : fieldStates.firstName === "focused" 
                          ? "text-accent-red" 
                          : "text-dark-brown/60"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                      errors.firstName && touched.firstName
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                        : fieldStates.firstName === "focused"
                          ? "border-accent-red focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-light-cream"
                          : "border-dark-brown/20 focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-white/80 hover:border-dark-brown/30"
                    }`}
                  />
                  {errors.firstName && touched.firstName && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-dark-brown font-paragraph">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${
                      errors.lastName && touched.lastName 
                        ? "text-red-500" 
                        : fieldStates.lastName === "focused" 
                          ? "text-accent-red" 
                          : "text-dark-brown/60"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                      errors.lastName && touched.lastName
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                        : fieldStates.lastName === "focused"
                          ? "border-accent-red focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-light-cream"
                          : "border-dark-brown/20 focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-white/80 hover:border-dark-brown/30"
                    }`}
                  />
                  {errors.lastName && touched.lastName && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-dark-brown font-paragraph">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${
                      errors.email && touched.email 
                        ? "text-red-500" 
                        : fieldStates.email === "focused" 
                          ? "text-accent-red" 
                          : "text-dark-brown/60"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                      errors.email && touched.email
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                        : fieldStates.email === "focused"
                          ? "border-accent-red focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-light-cream"
                          : "border-dark-brown/20 focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-white/80 hover:border-dark-brown/30"
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

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-dark-brown font-paragraph">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${
                      errors.phone && touched.phone 
                        ? "text-red-500" 
                        : fieldStates.phone === "focused" 
                          ? "text-accent-red" 
                          : "text-dark-brown/60"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                      errors.phone && touched.phone
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                        : fieldStates.phone === "focused"
                          ? "border-accent-red focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-light-cream"
                          : "border-dark-brown/20 focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-white/80 hover:border-dark-brown/30"
                    }`}
                  />
                  {errors.phone && touched.phone && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-dark-brown font-paragraph">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${
                      errors.password && touched.password 
                        ? "text-red-500" 
                        : fieldStates.password === "focused" 
                          ? "text-accent-red" 
                          : "text-dark-brown/60"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm6 0H6a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2z" />
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
                          ? "border-accent-red focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-light-cream"
                          : "border-dark-brown/20 focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-white/80 hover:border-dark-brown/30"
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
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-dark-brown/70 font-paragraph font-medium">Password Requirements:</p>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-dark-brown/50'}`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-dark-brown/50'}`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One lowercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-dark-brown/50'}`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One uppercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-dark-brown/50'}`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One number
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-600' : 'text-dark-brown/50'}`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One special character (@$!%*?&)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-dark-brown font-paragraph">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${
                      errors.confirmPassword && touched.confirmPassword 
                        ? "text-red-500" 
                        : fieldStates.confirmPassword === "focused" 
                          ? "text-accent-red" 
                          : "text-dark-brown/60"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 border rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50"
                        : fieldStates.confirmPassword === "focused"
                          ? "border-accent-red focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-light-cream"
                          : "border-dark-brown/20 focus:ring-4 focus:ring-accent-red/30 focus:border-accent-red bg-white/80 hover:border-dark-brown/30"
                    }`}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start sm:items-center gap-2 sm:gap-3 group cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-dark-brown/70 font-paragraph border-dark-brown/30 rounded-lg focus:ring-4 focus:ring-accent-red/30 focus:ring-offset-0 transition-all duration-300 transform hover:scale-110 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-dark-brown font-paragraph group-hover:text-dark-brown transition-colors duration-200 leading-relaxed">
                  I agree to the{" "}
                  <span className="underline cursor-pointer hover:text-dark-brown/60 transition-colors duration-200 font-medium">
                    terms & policy
                  </span>
                </span>
              </label>
              {errors.agreeToTerms && touched.agreeToTerms && (
                <div className="mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                </div>
              )}

              {/* Terms and Conditions Collapsible Section */}
              <details className="bg-gray-50/50 rounded-lg sm:rounded-xl border border-dark-brown/20 overflow-hidden">
                <summary className="px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-gray-100/50 transition-colors duration-200 font-medium text-dark-brown font-paragraph flex items-center justify-between text-sm sm:text-base">
                  <span>📋 Terms and Conditions</span>
                  <svg className="w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-dark-brown/60">
                  <div className="pt-2 border-t border-green-200">
                    <h4 className="font-semibold text-dark-brown font-paragraph mb-2">1. Account Registration</h4>
                    <p className="text-dark-brown/60 leading-relaxed">
                      By creating an account, you agree to provide accurate, current, and complete information. 
                      You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark-brown font-paragraph mb-2">2. Privacy Policy</h4>
                    <p className="text-dark-brown/60 leading-relaxed">
                      We collect and process your personal data in accordance with our Privacy Policy. 
                      Your information is used to provide our services and improve user experience.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark-brown font-paragraph mb-2">3. Service Usage</h4>
                    <p className="text-dark-brown/60 leading-relaxed">
                      Our timber services are provided "as is" and we reserve the right to modify or 
                      discontinue services at any time. You agree to use our services responsibly.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark-brown font-paragraph mb-2">4. Payment Terms</h4>
                    <p className="text-dark-brown/60 leading-relaxed">
                      All payments must be made in advance. Prices are subject to change without notice. 
                      Refunds are processed according to our refund policy.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark-brown font-paragraph mb-2">5. Limitation of Liability</h4>
                    <p className="text-dark-brown/60 leading-relaxed">
                      JC Timber shall not be liable for any indirect, incidental, or consequential damages 
                      arising from the use of our services or products.
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-xs text-dark-brown/70 font-paragraph italic">
                      By checking the box above, you acknowledge that you have read, understood, and agree to 
                      these Terms and Conditions and our Privacy Policy.
                    </p>
                  </div>
                </div>
              </details>

              {/* Signup Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-red to-dark-brown text-white font-semibold py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl hover:from-dark-brown hover:to-accent-red transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-500/20 text-sm sm:text-base"
              >
                Sign Up
              </button>


              {/* Sign in Link */}
              <div className="text-center pt-3 sm:pt-4">
                <span className="text-dark-brown/60 text-sm sm:text-base">Have an account? </span>
                <button
                  onClick={() => navigate("/login")}
                  className="text-dark-brown font-paragraph hover:text-dark-brown font-semibold hover:underline transition-colors duration-200 text-sm sm:text-base"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Custom CSS for pattern animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
