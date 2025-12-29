import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/LandingPage";
import SignIn from "./SignIn";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import "./App.css";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ActiveWorkspaceProvider } from "./context/ActiveWorkspaceContext";
import Workspaces from "./Workspaces";
import WorkspaceDetails from "./components/WorkspaceDetails";
import Invites from "./Invites";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ResetPassword from "./ResetPassword";
import AboutUs from "./About";
import Pricing from "./Pricing";

/* ================= PRIVATE ROUTE ================= */
function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/auth" />;
}

// Floating Particle Component
const FloatingParticle = ({ index, isMobile }) => {
  const size = Math.random() * (isMobile ? 3 : 4) + 1;
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 2;
  
  return (
    <motion.div
      initial={{ 
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        opacity: 0,
        scale: 0
      }}
      animate={{ 
        y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
        x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'radial-gradient(circle, #ef4444, #dc2626)',
        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
      }}
    />
  );
};

// Orbiting Ring Component
const OrbitRing = ({ radius, duration, delay, isMobile }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{ 
        scale: 1, 
        opacity: [0, 0.4, 0.4, 0],
        rotate: 360
      }}
      transition={{
        scale: { duration: 0.8, delay },
        opacity: { duration: 2, delay, times: [0, 0.2, 0.8, 1] },
        rotate: { duration, delay: delay + 0.5, repeat: Infinity, ease: "linear" }
      }}
      className="absolute"
      style={{
        width: `${radius}px`,
        height: `${radius}px`,
        borderRadius: '50%',
        border: `${isMobile ? 1 : 2}px solid`,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderStyle: 'dashed'
      }}
    />
  );
};

// Energy Wave Component
const EnergyWave = ({ delay, isMobile }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 3, 4],
        opacity: [0.6, 0.3, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
      className="absolute inset-0 rounded-full"
      style={{
        border: `${isMobile ? 2 : 3}px solid rgba(239, 68, 68, 0.5)`,
        filter: 'blur(2px)'
      }}
    />
  );
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('initializing');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        
        // Update phases
        if (next > 30 && currentPhase === 'initializing') setCurrentPhase('loading');
        if (next > 70 && currentPhase === 'loading') setCurrentPhase('finalizing');
        
        return next;
      });
    }, 30);

    const animationTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    
    return () => {
      clearTimeout(animationTimer);
      clearInterval(progressTimer);
    };
  }, [currentPhase]);

  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ActiveWorkspaceProvider>
          <BrowserRouter>
            <ToastContainer />

            {/* Advanced Opening Animation */}
            <AnimatePresence>
              {showIntro && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
                >
                  {/* Radial Gradient Background */}
                  <div className="absolute inset-0">
                    <motion.div
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 70%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)',
                          'radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)'
                        ]
                      }}
                      transition={{ duration: 8, repeat: Infinity }}
                      className="absolute inset-0"
                    />
                  </div>

                  {/* Floating Particles */}
                  <div className="absolute inset-0">
                    {[...Array(isMobile ? 30 : 50)].map((_, i) => (
                      <FloatingParticle key={i} index={i} isMobile={isMobile} />
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="relative h-full w-full flex flex-col items-center justify-center p-4">
                    
                    {/* Logo with Minimal Effects */}
                    <div className={`relative ${isMobile ? 'w-56 h-56 mb-12' : 'w-72 h-72 mb-16'} flex items-center justify-center`}>
                      
                      {/* Subtle Orbiting Ring */}
                      <OrbitRing radius={isMobile ? 140 : 180} duration={12} delay={0.3} isMobile={isMobile} />

                      {/* Subtle Central Glow */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2), transparent 70%)',
                          filter: 'blur(30px)'
                        }}
                      />

                      {/* Logo Container - Bigger and Stable */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1
                        }}
                        transition={{
                          scale: { duration: 0.8, type: "spring", stiffness: 150 },
                          opacity: { duration: 0.6 }
                        }}
                        className={`relative ${isMobile ? 'w-48 h-48' : 'w-56 h-56'} bg-gradient-to-br  rounded-3xl shadow-2xl flex items-center justify-center`}
                        style={{
                          boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        {/* Subtle Inner Glow */}
                        <div className="absolute inset-3 rounded-2xl bg-gradient-to-br from-red-400/10 to-transparent" />
                        
                        {/* Logo Image - Bigger */}
                        <motion.img
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          src="/logo.png"
                          alt="BigBull CAMP"
                          className={`${isMobile ? 'w-32 h-32' : 'w-40 h-40'} object-contain z-10`}
                        />
                      </motion.div>
                    </div>

                    {/* Title with Smooth Reveal */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="text-center mb-8"
                    >
                      <motion.h1
                        className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-black mb-2`}
                      >
                        {['BIG', 'BULL', 'CAMP'].map((word, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1 + i * 0.2 }}
                            className="inline-block bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mr-3"
                            style={{ 
                              textShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, letterSpacing: '0.5em' }}
                        animate={{ 
                          opacity: [0, 1],
                          letterSpacing: ['0.5em', '0.2em']
                        }}
                        transition={{ duration: 1, delay: 1.6 }}
                        className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 font-light tracking-widest`}
                      >
                        ENTERPRISE PROJECT MANAGEMENT
                      </motion.p>
                    </motion.div>

                    {/* Sleek Progress System */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className={`${isMobile ? 'w-80' : 'w-96'} space-y-4`}
                    >
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                          <motion.span 
                            key={currentPhase}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-400 font-semibold uppercase`}
                          >
                            {currentPhase === 'initializing' && 'Initializing System'}
                            {currentPhase === 'loading' && 'Loading Modules'}
                            {currentPhase === 'finalizing' && 'Finalizing Setup'}
                          </motion.span>
                          <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-red-500`}>
                            {loadingProgress}%
                          </span>
                        </div>

                        <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${loadingProgress}%` }}
                            className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 relative"
                          >
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: 'Workspace', progress: loadingProgress > 25 },
                          { name: 'Real-time', progress: loadingProgress > 50 },
                          { name: 'Analytics', progress: loadingProgress > 75 },
                          { name: 'Security', progress: loadingProgress > 90 }
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2 + i * 0.1 }}
                            className={`px-3 py-2 rounded-lg backdrop-blur-sm transition-all ${
                              item.progress 
                                ? 'bg-red-500/10 border border-red-500/30' 
                                : 'bg-gray-800/30 border border-gray-700/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} ${
                                item.progress ? 'text-red-400' : 'text-gray-500'
                              }`}>
                                {item.name}
                              </span>
                              <motion.div
                                animate={item.progress ? {
                                  scale: [1, 1.3, 1],
                                  opacity: [0.5, 1, 0.5]
                                } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-2 h-2 rounded-full ${
                                  item.progress ? 'bg-red-500' : 'bg-gray-600'
                                }`}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: 2.5 }}
                      className="absolute bottom-8 text-center"
                    >
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-light`}>
                        © {new Date().getFullYear()} Big Bull Camp • Enterprise Edition
                      </p>
                    </motion.div>
                  </div>

                  {/* Scan Line Effect */}
                  <motion.div
                    animate={{ y: ['0%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, rgba(239, 68, 68, 0.03), transparent)',
                      height: '100px'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main App Content - Your Original Components */}
            <AnimatePresence>
              {!showIntro && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <Header />
                  
                  <Routes>

                    <Route path="/reset-password" element={<ResetPassword />} />
                    {/* PUBLIC ROUTES */}
                    <Route path="/auth" element={<SignIn />} />
                    
                    {/* PRIVATE ROUTES */}
                    <Route
                      path="/workspaces"
                      element={
                        <PrivateRoute>
                          <Workspaces />
                        </PrivateRoute>
                      }
                    />
                    
                    <Route
                      path="/invites"
                      element={
                        <PrivateRoute>
                          <Invites />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/pricing"
                      element={
                        <PrivateRoute>
                          <Pricing />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/about"
                      element={
                        <PrivateRoute>
                          <AboutUs />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/workspace/:id"
                      element={
                        <PrivateRoute>
                          <WorkspaceDetails />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/*"
                      element={
                          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
                            <Sidebar />
                          </div>
                      }
                    />
                  </Routes>
                </motion.div>
              )}
            </AnimatePresence>
          </BrowserRouter>
        </ActiveWorkspaceProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
