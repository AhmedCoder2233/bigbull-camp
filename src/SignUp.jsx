import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function SignUp() {
  const { signUp } = useContext(AuthContext);
  const formRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: ""
  });
  
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [step, setStep] = useState(1); // For multi-step animation

  useEffect(() => {
    setIsMounted(true);
    
    // Create floating red particles background
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.signup-particles');
    
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      container.appendChild(canvas);
      
      const particles = [];
      const particleCount = 25;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.3 - 0.15,
          speedY: Math.random() * 0.3 - 0.15,
          color: `rgba(220, 38, 38, ${Math.random() * 0.2 + 0.1})` // Red particles
        });
      }
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        });
        
        requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (container.contains(canvas)) {
          container.removeChild(canvas);
        }
      };
    }
  }, []);

  // Calculate password strength
  useEffect(() => {
    const calculateStrength = () => {
      let strength = 0;
      if (formData.password.length >= 8) strength += 25;
      if (/[A-Z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      setPasswordStrength(strength);
    };
    
    calculateStrength();
  }, [formData.password]);

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters";
        else if (!/[A-Z]/.test(value)) error = "Include at least one uppercase letter";
        else if (!/[0-9]/.test(value)) error = "Include at least one number";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      case "name":
        if (!value.trim()) error = "Name is required";
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleFocus = (e) => {
    e.target.parentElement.classList.add('ring-2', 'ring-red-500', 'ring-opacity-30');
  };

  const handleInputBlur = (e) => {
    e.target.parentElement.classList.remove('ring-2', 'ring-red-500', 'ring-opacity-30');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate all fields
    const isEmailValid = validateField("email", formData.email);
    const isPasswordValid = validateField("password", formData.password);
    const isConfirmValid = validateField("confirmPassword", formData.confirmPassword);
    const isNameValid = validateField("name", formData.name);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmValid || !isNameValid) {
      setError("Please fix the errors above");
      
      // Animate error on form
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = '';
          }
        }, 500);
      }
      return;
    }
    
    setLoading(true);
    
    try {
      // Animate form submission
      setStep(2); // Show loading step
      
      // Simulate API delay for animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const res = await signUp(formData.email, formData.password, formData.name);
      
      setStep(3); // Show success step
      
      if (res === "VERIFY_EMAIL") {
        setSuccess(
          "Account created successfully 🎉 Please check your email to verify your account before signing in."
        );
        
        // Success animation
        if (formRef.current) {
          formRef.current.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.style.transform = 'scale(1)';
            }
          }, 300);
        }
      }
    } catch (err) {
      setStep(1); // Return to form step
      setError(err.message || "Sign up failed");
      
      // Shake animation on error
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = '';
          }
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  // Animated eye component
  const AnimatedEye = ({ show, setShow, disabled }) => {
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
      const blinkInterval = setInterval(() => {
        if (!show && Math.random() > 0.7) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 200);
        }
      }, 3000);
      
      return () => clearInterval(blinkInterval);
    }, [show]);

    return (
      <motion.button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
        onClick={() => setShow(!show)}
        disabled={disabled}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative w-6 h-6">
          {/* Eye outline */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-400"></div>
          
          {/* Pupil */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-600 rounded-full"
            style={{ x: '-50%', y: '-50%' }}
            animate={{
              scale: show ? 0.8 : 1,
              backgroundColor: show ? '#dc2626' : '#4b5563' // Red pupil when visible
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Eyelid */}
          <motion.div
            className="absolute inset-x-0 top-0 h-3 bg-white rounded-t-full"
            animate={{
              y: show ? -8 : 0,
              scaleY: show ? 0 : 1
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Eyelashes */}
          {!show && (
            <>
              <div className="absolute top-0 left-1/4 w-0.5 h-2 bg-gray-400"></div>
              <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-gray-400"></div>
              <div className="absolute top-0 left-3/4 w-0.5 h-2 bg-gray-400"></div>
            </>
          )}
        </div>
      </motion.button>
    );
  };

  // Password strength indicator with red theme
  const PasswordStrength = () => {
    const getColor = () => {
      if (passwordStrength < 50) return "bg-red-400";
      if (passwordStrength < 75) return "bg-orange-400";
      return "bg-red-600";
    };
    
    const getText = () => {
      if (passwordStrength < 50) return "Weak";
      if (passwordStrength < 75) return "Medium";
      return "Strong";
    };

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Password strength:</span>
          <span className={`font-medium ${
            passwordStrength < 50 ? "text-red-400" :
            passwordStrength < 75 ? "text-orange-400" : "text-red-600"
          }`}>
            {getText()}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${passwordStrength}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden relative">
      {/* Animated Red Particles Background */}
      <div className="signup-particles absolute inset-0 pointer-events-none"></div>
      
      {/* Floating red elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-red-100 to-red-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-r from-red-200 to-red-300 rounded-full opacity-20 animate-float-delayed"></div>
      
      <motion.div
        ref={formRef}
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={isMounted ? { scale: 1, opacity: 1, y: 0 } : {}}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.5
        }}
        className="w-full max-w-md relative z-10 px-4"
      >
        {/* Card with glass morphism effect */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Animated Logo - Red Theme */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <motion.svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </motion.svg>
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity 
                }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-400 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
            </motion.div>
          </div>

          <motion.h1
            className="text-3xl font-bold text-center text-gray-900 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Create Account
          </motion.h1>
          
          <p className="text-gray-600 text-center mb-8">Join us today and get started</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Alert */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.8 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.8 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircleIcon className="w-6 h-6 text-red-600" />
                      </motion.div>
                      <p className="text-sm text-red-800 font-medium">{success}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                    <motion.div
                      className="w-3 h-3 bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Steps - Red Theme */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    className={`w-3 h-3 rounded-full ${
                      s === step 
                        ? "bg-red-600" 
                        : s < step 
                          ? "bg-red-400" 
                          : "bg-gray-300"
                    }`}
                    animate={{
                      scale: s === step ? 1.5 : 1,
                      boxShadow: s === step ? "0 0 10px rgba(220, 38, 38, 0.5)" : "none"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>

            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type="text"
                  name="name"
                  required
                  className={`block w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/50 ${
                    formErrors.name 
                      ? "border-red-300 focus:border-red-500" 
                      : "border-gray-200 focus:border-red-500"
                  }`}
                  placeholder="John Doe"
                  disabled={loading}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e);
                    handleInputBlur(e);
                  }}
                  onFocus={handleFocus}
                />
                {formErrors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1 ml-1"
                  >
                    {formErrors.name}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type="email"
                  name="email"
                  required
                  className={`block w-full pl-4 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/50 ${
                    formErrors.email 
                      ? "border-red-300 focus:border-red-500" 
                      : "border-gray-200 focus:border-red-500"
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e);
                    handleInputBlur(e);
                  }}
                  onFocus={handleFocus}
                />
                {formErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1 ml-1"
                  >
                    {formErrors.email}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <span className="text-xs text-gray-500">
                  {formData.password.length}/8+ chars
                </span>
              </div>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className={`block w-full pl-4 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/50 ${
                    formErrors.password 
                      ? "border-red-300 focus:border-red-500" 
                      : "border-gray-200 focus:border-red-500"
                  }`}
                  placeholder="Create a strong password"
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e);
                    handleInputBlur(e);
                  }}
                  onFocus={handleFocus}
                />
                <AnimatedEye 
                  show={showPassword} 
                  setShow={setShowPassword} 
                  disabled={loading}
                />
                {formErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1 ml-1"
                  >
                    {formErrors.password}
                  </motion.p>
                )}
              </motion.div>
              <PasswordStrength />
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  className={`block w-full pl-4 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/50 ${
                    formErrors.confirmPassword 
                      ? "border-red-300 focus:border-red-500" 
                      : "border-gray-200 focus:border-red-500"
                  }`}
                  placeholder="Confirm your password"
                  disabled={loading}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleBlur(e);
                    handleInputBlur(e);
                  }}
                  onFocus={handleFocus}
                />
                <AnimatedEye 
                  show={showConfirmPassword} 
                  setShow={setShowConfirmPassword} 
                  disabled={loading}
                />
                {formErrors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1 ml-1"
                  >
                    {formErrors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="/terms" className="text-red-600 hover:text-red-500 font-medium transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-red-600 hover:text-red-500 font-medium transition-colors">
                  Privacy Policy
                </a>
              </label>
            </motion.div>

            {/* Sign Up Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-4 px-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 relative overflow-hidden ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg hover:shadow-xl"
                }`}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                onHoverStart={() => !loading && setIsHovered(true)}
                onHoverEnd={() => !loading && setIsHovered(false)}
              >
                {/* Button shine effect */}
                {isHovered && !loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                )}
                
                {/* Pulsing background effect */}
                {!loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 0%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                )}
                
                {/* Button content */}
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {step === 2 ? "Creating Account..." : "Almost Done..."}
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <motion.div
                        className="ml-2"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, 0, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        ✨
                      </motion.div>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>

            {/* Sign In Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-sm text-gray-600"
            >
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-red-600 hover:text-red-500 transition-colors duration-200 relative group"
              >
                <span>Sign in here</span>
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
              </Link>
            </motion.p>
          </form>
        </div>

        {/* Floating red decorative elements */}
        <motion.div
          className="absolute -top-4 -left-4 w-8 h-8 bg-red-300 rounded-full blur-sm"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-4 -right-4 w-10 h-10 bg-red-400 rounded-full blur-sm"
          animate={{ 
            y: [0, 10, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-8 w-6 h-6 bg-red-200 rounded-full blur-sm"
          animate={{ 
            y: [0, 15, 0],
            x: [0, 5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            box-shadow: 0 5px 15px rgba(220, 38, 38, 0.1);
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            box-shadow: 0 15px 30px rgba(220, 38, 38, 0.2);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            box-shadow: 0 5px 15px rgba(220, 38, 38, 0.1);
          }
          50% { 
            transform: translateY(20px) rotate(-180deg); 
            box-shadow: 0 15px 30px rgba(220, 38, 38, 0.2);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes pulse-red {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .signup-particles canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        /* Custom focus styles */
        input:focus {
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        
        /* Smooth transitions */
        * {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
