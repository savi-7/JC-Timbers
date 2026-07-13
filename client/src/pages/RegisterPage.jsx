// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import { useNotification } from "../components/NotificationProvider";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import backgroundImage from "../assets/livingroom.png";

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

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Mouse Parallax Effect for the Hero Image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 200, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Map mouse position to image movement (opposite movement of login for variety)
  const x = useTransform(smoothMouseX, [0, window.innerWidth || 1000], [-25, 25]);
  const y = useTransform(smoothMouseY, [0, window.innerHeight || 800], [-25, 25]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let filteredValue = value;
    if (name === "phone") {
      filteredValue = value.replace(/\D/g, "");
    } else {
      filteredValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : filteredValue,
    }));

    if (type === "checkbox") {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    if (touched[name] || errors[name]) {
      validateField(name, type === "checkbox" ? checked : filteredValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, type === "checkbox" ? checked : value);
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "firstName":
        if (!value.trim()) newErrors.firstName = "Required missing";
        else if (value !== value.trim() || value.includes(" ")) newErrors.firstName = "No spaces";
        else if (value.length < 2) newErrors.firstName = "Min 2 chars";
        else if (!/^[a-zA-Z]+$/.test(value)) newErrors.firstName = "Letters only";
        else delete newErrors.firstName;
        break;

      case "lastName":
        if (!value.trim()) newErrors.lastName = "Required missing";
        else if (value !== value.trim() || value.includes(" ")) newErrors.lastName = "No spaces";
        else if (value.length < 2) newErrors.lastName = "Min 2 chars";
        else if (!/^[a-zA-Z]+$/.test(value)) newErrors.lastName = "Letters only";
        else delete newErrors.lastName;
        break;

      case "email":
        if (!value.trim()) newErrors.email = "Required missing";
        else if (!/^[^\s@]+@[^\s@]+\.com$/i.test(value)) newErrors.email = "Invalid domain";
        else delete newErrors.email;
        break;

      case "phone": {
        const phoneDigits = value.replace(/\D/g, "");
        if (!value.trim()) newErrors.phone = "Required missing";
        else if (phoneDigits.length !== 10) newErrors.phone = "10 digits required";
        else if (!/^[6-9]/.test(phoneDigits)) newErrors.phone = "Invalid region";
        else delete newErrors.phone;
        break;
      }

      case "password":
        if (!value) newErrors.password = "Required missing";
        else if (value.length < 8) newErrors.password = "Min 8 chars";
        else if (!/(?=.*[a-z])/.test(value)) newErrors.password = "Need lowercase";
        else if (!/(?=.*[A-Z])/.test(value)) newErrors.password = "Need uppercase";
        else if (!/(?=.*\d)/.test(value)) newErrors.password = "Need number";
        else if (!/(?=.*[@$!%*?&])/.test(value)) newErrors.password = "Need special char";
        else delete newErrors.password;

        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch";
          else delete newErrors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (!value) newErrors.confirmPassword = "Confirmation needed";
        else if (value !== formData.password) newErrors.confirmPassword = "Mismatch";
        else delete newErrors.confirmPassword;
        break;

      case "agreeToTerms":
        if (!value) newErrors.agreeToTerms = "Consent required";
        else delete newErrors.agreeToTerms;
        break;

      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(formData).forEach(k => allTouched[k] = true);
    setTouched(allTouched);

    const finalErrors = {};
    if (!formData.firstName) finalErrors.firstName = "Required missing";
    if (!formData.lastName) finalErrors.lastName = "Required missing";
    if (!formData.email) finalErrors.email = "Required missing";
    if (!formData.phone) finalErrors.phone = "Required missing";
    if (!formData.password) finalErrors.password = "Required missing";
    if (!formData.confirmPassword) finalErrors.confirmPassword = "Confirmation needed";
    if (formData.password !== formData.confirmPassword) finalErrors.confirmPassword = "Mismatch";
    if (!formData.agreeToTerms) finalErrors.agreeToTerms = "Consent required";

    setErrors(prev => ({ ...prev, ...finalErrors }));
    if (Object.keys(finalErrors).length !== 0) return;

    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      showSuccess("Application successful. Welcome.");
      navigate("/login");
    } catch (err) {
      showError(err.response?.data?.message || "Registration failed");
    }
  };

  // Form Animation Variants
  const formVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Reusable Underlined Input Component
  const MinimalInput = ({ id, label, type, placeholder, value }) => (
    <motion.div variants={itemVariants} className="relative group w-full">
      <input
        type={type} name={id} id={id} value={value}
        onChange={handleInputChange} onBlur={handleBlur} placeholder={placeholder}
        className="peer w-full bg-transparent border-0 border-b-[1.5px] border-dark-brown/20 text-dark-brown py-2 px-0 focus:ring-0 focus:border-dark-brown focus:outline-none transition-colors placeholder:text-dark-brown/30 font-medium text-sm sm:text-base tracking-widest"
      />
      <label
        htmlFor={id}
        className="absolute left-0 -top-5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-dark-brown/70 transition-all peer-placeholder-shown:text-dark-brown/40 peer-focus:text-dark-brown/70"
      >
        {label}
      </label>
      <div className="absolute bottom-0 left-0 h-0.5 bg-dark-brown w-0 peer-focus:w-full transition-all duration-500 ease-out" />
      <AnimatePresence>
        {errors[id] && touched[id] && (
          <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-accent-red text-[10px] font-bold tracking-wider uppercase mt-1.5 absolute">
            * {errors[id]}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden font-paragraph selection:bg-dark-brown selection:text-cream">

      {/* Extreme Minimalist Form Section (Left - 40%) */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-[45%] xl:w-[40%] bg-cream h-screen overflow-y-auto flex flex-col justify-center relative z-20"
      >
        {/* Brand Mark */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-30">
          <Link to="/" className="text-dark-brown font-heading font-black text-xl tracking-tighter hover:text-accent-red transition-colors flex items-center gap-0.5">
            JC<span className="text-accent-red">.</span>TIMBERS
          </Link>
        </div>

        <div className="w-full max-w-lg mx-auto px-8 py-12 xs:px-12 sm:px-16 lg:px-12 xl:px-16 2xl:px-20">

          <motion.div variants={formVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} className="mb-12">
              <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-dark-brown tracking-tighter mb-3">
                Sign Up
              </h2>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-10">

              <div className="flex flex-col sm:flex-row gap-10 sm:gap-6">
                <MinimalInput id="firstName" label="First Name" type="text" placeholder="First Name" value={formData.firstName} />
                <MinimalInput id="lastName" label="Last Name" type="text" placeholder="Last Name" value={formData.lastName} />
              </div>

              <MinimalInput id="email" label="Email Address" type="email" placeholder="Email Address" value={formData.email} />
              <MinimalInput id="phone" label="Phone Number" type="tel" placeholder="Phone Number" value={formData.phone} />

              <div className="flex flex-col sm:flex-row gap-10 sm:gap-6">
                <MinimalInput id="password" label="Password" type="password" placeholder="••••••••" value={formData.password} />
                <MinimalInput id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" value={formData.confirmPassword} />
              </div>

              {/* Password Checklist Minimal */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-x-4 gap-y-1 pt-1 opacity-70 hover:opacity-100 transition-opacity">
                {[
                  { label: "8+ chars", valid: formData.password.length >= 8 },
                  { label: "Lowercase", valid: /(?=.*[a-z])/.test(formData.password) },
                  { label: "Uppercase", valid: /(?=.*[A-Z])/.test(formData.password) },
                  { label: "Number", valid: /(?=.*\d)/.test(formData.password) },
                  { label: "Symbol", valid: /(?=.*[@$!%*?&])/.test(formData.password) }
                ].map((req, i) => (
                  <span key={i} className={`text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-1 transition-colors ${req.valid ? 'text-dark-brown' : 'text-dark-brown/30'}`}>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {req.valid ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="8" strokeWidth="2" />}
                    </svg>
                    {req.label}
                  </span>
                ))}
              </motion.div>

              {/* Minimal Checkbox */}
              <motion.div variants={itemVariants} className="pt-2">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded-none border-[1.5px] border-dark-brown/30 text-dark-brown focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer checked:border-dark-brown"
                    />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-dark-brown/60 font-bold leading-relaxed">
                    I agree to the{" "}
                    <span className="text-dark-brown hover:underline">Terms</span>
                    {" "}and{" "}
                    <span className="text-dark-brown hover:underline">Privacy Policy</span>.
                  </span>
                </label>
                {errors.agreeToTerms && touched.agreeToTerms && (
                  <p className="text-accent-red text-[10px] font-bold tracking-wider uppercase mt-2">* {errors.agreeToTerms}</p>
                )}
              </motion.div>

              {/* Primary Action Button */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  className="group relative w-full h-14 bg-dark-brown text-cream font-bold uppercase tracking-[0.2em] text-sm overflow-hidden"
                >
                  <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block">
                    Register
                  </span>
                  <div className="absolute inset-0 bg-accent-red transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </button>
              </motion.div>

            </form>

            <motion.div variants={itemVariants} className="mt-12 text-center lg:text-left">
              <p className="text-dark-brown/50 text-[11px] font-bold uppercase tracking-widest">
                Already have an account?
                <Link to="/login" className="inline-block lg:block lg:mt-2 ml-2 lg:ml-0 text-dark-brown hover:text-accent-red transition-colors w-fit relative group">
                  Login here
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent-red transition-all duration-300 group-hover:w-full" />
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Dynamic 3D Parallax Image Section (Right - 60%) */}
      <div className="relative hidden lg:block w-[55%] xl:w-[60%] h-screen bg-dark-brown overflow-hidden shadow-2xl z-10">
        <motion.div
          className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] origin-center"
          style={{ x, y }}
        >
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={backgroundImage}
            alt="Living Room Architecture"
            className="w-full h-full object-cover mix-blend-overlay opacity-90"
          />
        </motion.div>

        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-l from-dark-brown/80 via-dark-brown/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/90 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          className="absolute bottom-20 left-20 right-20 text-cream text-right pointer-events-none flex flex-col items-end"
        >
          <div className="w-12 h-1 bg-accent-red mb-8" />
          <h1 className="font-heading text-5xl xl:text-7xl font-extrabold mb-4 leading-[1.1] tracking-tighter">
            Build your<br />Legacy.
          </h1>
          <p className="font-medium text-cream/70 text-lg xl:text-xl max-w-lg tracking-wide">
            Ensure your creations stand the test of time with materials sourced for uncompromising quality.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
