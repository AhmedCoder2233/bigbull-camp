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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50 p-4 overflow-hidden relative">
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
        className="w-full max-w-md relative z-10"
      >
        {/* Card with refined design */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          {/* Header section with red accent */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
            <motion.div
              className="inline-block relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <motion.svg
                  className="w-8 h-8 text-red-600"
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
            
            <motion.h1
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            
            <p className="text-red-100">Sign in to continue to your account</p>
          </div>

          {/* Form section */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <AnimatedEye />
                </div>
              </div>

              {/* Sign In Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]
                    ${loading 
                      ? "bg-red-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:from-red-800 shadow-lg hover:shadow-xl"}`}
                >
                  <div className="flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </div>
                </button>
              </motion.div>

              {/* Sign Up Link */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-red-600 font-semibold hover:text-red-800 hover:underline transition-colors"
                  >
                    Sign up now
                  </Link>
                </p>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="bg-red-50 px-8 py-4 border-t border-red-100">
            <p className="text-xs text-gray-600 text-center">
              Having trouble signing in? <a href="#" className="text-red-600 font-medium hover:underline">Get help</a>
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-red-300 rounded-full"></div>
            <div className="w-2 h-2 bg-red-100 rounded-full"></div>
          </div>
        </div>
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
