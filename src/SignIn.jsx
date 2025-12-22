import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SignIn() {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Add some particles for background animation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.particles-container');
    
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      container.appendChild(canvas);
      
      const particles = [];
      const particleCount = 30;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          color: `rgba(220, 38, 38, ${Math.random() * 0.3 + 0.1})`
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Add a slight delay for animation
      await new Promise(resolve => setTimeout(resolve, 800));
      await signIn(email, password);
      
      // Animate success before navigation
      if (formRef.current) {
        formRef.current.style.transform = 'translateY(-20px)';
        formRef.current.style.opacity = '0.5';
      }
      
      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (err) {
      setError(err.message || "Invalid email or password");
      
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

  // Custom animated eye component
  const AnimatedEye = () => {
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
      const blinkInterval = setInterval(() => {
        if (!showPassword && Math.random() > 0.7) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 200);
        }
      }, 3000);
      
      return () => clearInterval(blinkInterval);
    }, [showPassword]);

    return (
      <motion.button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
        onClick={() => setShowPassword(!showPassword)}
        disabled={loading}
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
              scale: showPassword ? 0.8 : 1,
              backgroundColor: showPassword ? '#dc2626' : '#4b5563'
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Eyelid */}
          <motion.div
            className="absolute inset-x-0 top-0 h-3 bg-white rounded-t-full"
            animate={{
              y: showPassword ? -8 : 0,
              scaleY: showPassword ? 0 : 1
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Eyelashes */}
          {!showPassword && (
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="particles-container absolute inset-0 pointer-events-none"></div>
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-red-100 to-red-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-red-200 to-red-300 rounded-full opacity-20 animate-float-delayed"></div>
      
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
          {/* Animated Logo */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </motion.svg>
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity 
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
            Welcome Back
          </motion.h1>
          
          <p className="text-gray-600 text-center mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert with animation */}
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
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
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
                  required
                  className="block w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/50"
                  placeholder="you@example.com"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => e.target.parentElement.classList.add('ring-2', 'ring-red-500')}
                  onBlur={(e) => e.target.parentElement.classList.remove('ring-2', 'ring-red-500')}
                />
              </motion.div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/50"
                  placeholder="Enter your password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.parentElement.classList.add('ring-2', 'ring-red-500')}
                  onBlur={(e) => e.target.parentElement.classList.remove('ring-2', 'ring-red-500')}
                />
                <AnimatedEye />
              </motion.div>
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-4 px-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 relative overflow-hidden ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg"
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
                
                {/* Button content */}
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                      <span className="ml-2">Sign In</span>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-gray-600"
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-red-600 hover:text-red-500 transition-colors duration-200 relative group"
              >
                <span>Sign up now</span>
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
              </Link>
            </motion.p>
          </form>
        </div>

        {/* Floating decorative elements */}
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
      </motion.div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-180deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .particles-container canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
