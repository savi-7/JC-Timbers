// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { signInWithGoogle, resetPassword } from "../firebase";
import { API_BASE } from "../config";
import { useNotification } from "../components/NotificationProvider";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import backgroundImage from "../assets/furnitureshowcase.png";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [touched, setTouched] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();

  // Mouse Parallax Effect for the Hero Image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax tracking
  const springConfig = { damping: 50, stiffness: 200, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Map mouse position to image movement (-25px to 25px)
  const x = useTransform(smoothMouseX, [0, window.innerWidth || 1000], [25, -25]);
  const y = useTransform(smoothMouseY, [0, window.innerHeight || 800], [25, -25]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === "email") {
      if (!value) {
        newErrors.email = "Required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = "Invalid format";
      } else {
        delete newErrors.email;
      }
    }
    if (name === "password") {
      if (!value) {
        newErrors.password = "Required";
      } else {
        delete newErrors.password;
      }
    }
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email) tempErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid format";
    if (!formData.password) tempErrors.password = "Required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRoleBasedRedirect = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    if (userRole === "admin") navigate("/admin", { replace: true });
    else navigate("/", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate()) return;
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });
      // Use auth hook to handle login
      login(response.data.token, response.data.user, response.data.user.role);
      handleRoleBasedRedirect(response.data.user.role);
      showSuccess("Welcome back to JC Timbers.");
    } catch (err) {
      showError(err.response?.data?.message || err.message || "Authentication failed. Please check your credentials.");
    }
  };

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

      showSuccess("Secured login via Google.");
      handleRoleBasedRedirect(res.data.user.role);
    } catch (err) {
      showError("Google authentication interrupted.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError("");
    if (!resetEmail) {
      setResetError("Email required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError("Invalid email format");
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      showSuccess("Recovery instructions dispatched to your inbox.");
      setIsForgotPasswordOpen(false);
      setResetEmail("");
    } catch (err) {
      setResetError(err.message || "Failed to dispatch recovery email.");
    } finally {
      setIsResetting(false);
    }
  };

  // Form Animation Variants
  const formVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden font-paragraph selection:bg-dark-brown selection:text-cream">

      {/* Dynamic 3D Parallax Image Section (Left - 60%) */}
      <div className="relative hidden lg:block w-[60%] h-screen bg-dark-brown overflow-hidden shadow-2xl z-10">
        <motion.div
          className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] origin-center"
          style={{ x, y }}
        >
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={backgroundImage}
            alt="Premium Furniture Showcase"
            className="w-full h-full object-cover mix-blend-overlay opacity-90"
          />
        </motion.div>

        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-brown/80 via-dark-brown/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-brown/90 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          className="absolute bottom-20 left-20 right-20 text-cream pointer-events-none"
        >
          <div className="w-12 h-1 bg-accent-red mb-8" />
          <h1 className="font-heading text-5xl xl:text-7xl font-extrabold mb-4 leading-[1.1] tracking-tighter">
            Architectural<br />Excellence.
          </h1>
          <p className="font-medium text-cream/70 text-lg xl:text-xl max-w-lg tracking-wide">
            Access the definitive collection of imported timber and masterful craftsmanship.
          </p>
        </motion.div>
      </div>

      {/* Extreme Minimalist Form Section (Right - 40%) */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-[40%] bg-cream h-screen overflow-y-auto flex flex-col justify-center relative z-20"
      >
        {/* Brand Mark */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-30">
          <Link to="/" className="text-dark-brown font-heading font-black text-xl tracking-tighter hover:text-accent-red transition-colors flex items-center gap-0.5">
            JC<span className="text-accent-red">.</span>TIMBERS
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto px-8 py-16 xs:px-12 sm:px-16 lg:px-12 xl:px-16 2xl:px-24">

          <motion.div variants={formVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants} className="mb-14">
              <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-dark-brown tracking-tighter mb-3">
                Sign In
              </h2>
              <p className="text-dark-brown/50 font-bold uppercase tracking-[0.2em] text-xs">
                Welcome back to JC Timbers
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Animated Underline Input: Email */}
              <motion.div variants={itemVariants} className="relative group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="name@company.com"
                  className="peer w-full bg-transparent border-0 border-b-2 border-dark-brown/20 text-dark-brown text-lg py-3 px-0 focus:ring-0 focus:border-dark-brown focus:outline-none transition-colors placeholder:text-dark-brown/20 font-medium"
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 -top-6 text-xs font-bold uppercase tracking-widest text-dark-brown/70 transition-all peer-placeholder-shown:text-dark-brown/40 peer-focus:text-dark-brown/70"
                >
                  Email Address
                </label>
                {/* Custom animated underline on focus */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-dark-brown w-0 peer-focus:w-full transition-all duration-500 ease-out" />
                <AnimatePresence>
                  {errors.email && touched.email && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-accent-red text-xs font-bold tracking-wider uppercase mt-2 absolute">
                      * {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Animated Underline Input: Password */}
              <motion.div variants={itemVariants} className="relative group pt-4">
                <div className="absolute right-0 -top-2 z-10">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-accent-red hover:text-dark-brown transition-colors focus:outline-none"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="••••••••••••"
                  className="peer w-full bg-transparent border-0 border-b-2 border-dark-brown/20 text-dark-brown text-lg py-3 px-0 focus:ring-0 focus:border-dark-brown focus:outline-none transition-colors placeholder:text-dark-brown/20 font-medium tracking-widest"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 -top-6 text-xs font-bold uppercase tracking-widest text-dark-brown/70 transition-all peer-placeholder-shown:text-dark-brown/40 peer-focus:text-dark-brown/70"
                >
                  Password
                </label>
                <div className="absolute bottom-0 left-0 h-0.5 bg-dark-brown w-0 peer-focus:w-full transition-all duration-500 ease-out" />
                <AnimatePresence>
                  {errors.password && touched.password && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-accent-red text-xs font-bold tracking-wider uppercase mt-2 absolute">
                      * {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Primary Action Button */}
              <motion.div variants={itemVariants} className="pt-8">
                <button
                  type="submit"
                  className="group relative w-full h-14 bg-dark-brown text-cream font-bold uppercase tracking-[0.2em] text-sm overflow-hidden"
                >
                  <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block">
                    Login
                  </span>
                  <div className="absolute inset-0 bg-accent-red transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative flex items-center pt-2">
                <div className="flex-grow border-t border-dark-brown/10" />
                <span className="flex-shrink-0 mx-4 text-dark-brown/30 text-[10px] font-bold uppercase tracking-[0.2em]">Partner Login</span>
                <div className="flex-grow border-t border-dark-brown/10" />
              </motion.div>

              {/* Google Button */}
              <motion.div variants={itemVariants}>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-14 flex justify-center items-center gap-4 bg-transparent border border-dark-brown/20 text-dark-brown font-bold uppercase tracking-widest text-xs hover:bg-dark-brown hover:text-cream transition-all duration-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                  </svg>
                  Sign In With Google
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-16">
              <p className="text-dark-brown/50 text-[11px] font-bold uppercase tracking-widest">
                Already a partner?
                <Link to="/register" className="block mt-2 text-dark-brown hover:text-accent-red transition-colors w-fit relative group">
                  Register here
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent-red transition-all duration-300 group-hover:w-full" />
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Extreme Minimalist Forgot Password Overlay */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForgotPasswordOpen(false)}
              className="fixed inset-0 bg-cream/90 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 lg:left-auto lg:top-0 lg:w-[40%] bg-dark-brown text-cream p-12 sm:p-16 lg:px-16 lg:py-24 z-50 h-fit lg:h-full lg:min-h-screen shadow-2xl overflow-y-auto"
            >
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="absolute top-8 right-8 text-cream/50 hover:text-accent-red transition-colors focus:outline-none"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                <h2 className="text-4xl font-heading font-extrabold mb-4 tracking-tighter">Account<br />Recovery.</h2>
                <p className="text-cream/60 mb-12 text-sm font-medium leading-relaxed">
                  Provide your registered email address to receive secure password rotation instructions.
                </p>

                <form onSubmit={handlePasswordReset} className="space-y-10">
                  <div className="relative group">
                    <input
                      type="email"
                      id="resetEmail"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="peer w-full bg-transparent border-0 border-b-2 border-cream/20 text-cream text-lg py-3 px-0 focus:ring-0 focus:border-cream focus:outline-none transition-colors placeholder:text-cream/20 font-medium"
                      required
                    />
                    <label
                      htmlFor="resetEmail"
                      className="absolute left-0 -top-6 text-xs font-bold uppercase tracking-widest text-cream/50 transition-all peer-placeholder-shown:text-cream/30 peer-focus:text-cream/70"
                    >
                      Email Address
                    </label>
                    <div className="absolute bottom-0 left-0 h-0.5 bg-cream w-0 peer-focus:w-full transition-all duration-500 ease-out" />
                    {resetError && <p className="text-accent-red text-xs font-bold tracking-wider uppercase mt-2 absolute">* {resetError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="group relative w-full h-14 bg-cream text-dark-brown font-bold uppercase tracking-[0.2em] text-sm overflow-hidden disabled:opacity-50"
                  >
                    <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block">
                      {isResetting ? "Authorizing..." : "Dispatch Email"}
                    </span>
                    <div className="absolute inset-0 bg-accent-red transform scale-x-0 origin-left transition-transform duration-500 ease-out flex group-hover:scale-x-100" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}