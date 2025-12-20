import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineLightningBolt } from "react-icons/hi";

import Header from "./components/Header";
import Sidebar from "./components/LandingPage";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import "./App.css";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ActiveWorkspaceProvider } from "./context/ActiveWorkspaceContext";
import Workspaces from "./Workspaces";
import WorkspaceDetails from "./components/WorkspaceDetails";
import Invites from "./Invites";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ================= PRIVATE ROUTE ================= */
function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/signin" />;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
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
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    const animationTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    
    return () => {
      clearTimeout(animationTimer);
      clearInterval(progressTimer);
    };
  }, []);

  // Responsive values based on screen size
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ActiveWorkspaceProvider>
          <BrowserRouter>
          <ToastContainer />
            
            {/* VIP Opening Animation - Now Responsive */}
            <AnimatePresence>
              {showIntro && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-950 via-black to-red-950 overflow-hidden"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden'
                  }}
                >
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0">
                    {/* Matrix-like binary rain effect - Responsive count */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(isMobile ? 15 : isTablet ? 20 : 30)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            y: -100,
                            x: `${Math.random() * 100}%`,
                            opacity: 0
                          }}
                          animate={{ 
                            y: "120vh",
                            opacity: [0, 0.8, 0]
                          }}
                          transition={{
                            duration: Math.random() * 2 + 1,
                            delay: Math.random() * 0.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute text-xs font-mono text-red-400"
                          style={{
                            fontSize: `${Math.random() * (isMobile ? 6 : 8) + (isMobile ? 6 : 8)}px`,
                          }}
                        >
                          {Math.random() > 0.5 ? "1" : "0"}
                        </motion.div>
                      ))}
                    </div>

                    {/* Animated Circuit Board Lines - Responsive SVG */}
                    <svg className="absolute inset-0 w-full h-full opacity-10">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        d={isMobile ? 
                          "M0,50 Q100,25 200,50 T400,50" : 
                          isTablet ? 
                          "M0,75 Q150,38 300,75 T600,75" : 
                          "M0,100 Q200,50 400,100 T800,100"
                        }
                        stroke="url(#gradient1)"
                        strokeWidth={isMobile ? "1" : "2"}
                        fill="none"
                      />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 3, delay: 0.3, ease: "easeInOut" }}
                        d={isMobile ?
                          "M50,150 Q150,125 250,150 T450,150" :
                          isTablet ?
                          "M100,200 Q250,175 400,200 T700,200" :
                          "M100,300 Q300,250 500,300 T900,300"
                        }
                        stroke="url(#gradient2)"
                        strokeWidth={isMobile ? "1" : "2"}
                        fill="none"
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#dc2626" />
                          <stop offset="50%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#991b1b" />
                          <stop offset="50%" stopColor="#dc2626" />
                          <stop offset="100%" stopColor="#991b1b" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Glowing orbs - Responsive sizing */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className={`absolute top-1/4 left-1/4 ${
                        isMobile ? 'w-40 h-40' : 
                        isTablet ? 'w-60 h-60' : 
                        'w-80 h-80'
                      } bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-3xl`}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className={`absolute bottom-1/4 right-1/4 ${
                        isMobile ? 'w-48 h-48' : 
                        isTablet ? 'w-64 h-64' : 
                        'w-96 h-96'
                      } bg-gradient-to-r from-red-700 to-red-900 rounded-full blur-3xl`}
                    />
                  </div>

                  {/* Main Content Container - Fully Responsive */}
                  <div 
                    className="relative h-full w-full flex flex-col items-center justify-center px-4 md:px-6 overflow-auto"
                    style={{
                      maxHeight: '100vh',
                      maxWidth: '100vw'
                    }}
                  >
                    {/* Logo Container - Responsive sizing */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                        y: [0, -10, 0]
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.3,
                        y: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                      className={`mb-6 md:mb-10 relative ${
                        isMobile ? 'w-32 h-32' : 
                        isTablet ? 'w-36 h-36' : 
                        'w-40 h-40'
                      }`}
                    >
                      {/* Outer Pulse Ring */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className={`absolute ${
                          isMobile ? '-inset-4' : 
                          isTablet ? '-inset-5' : 
                          '-inset-6'
                        } border-2 border-red-500/30 rounded-3xl`}
                      />
                      
                      {/* Secondary Pulse Ring */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.8, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.5
                        }}
                        className={`absolute ${
                          isMobile ? '-inset-6' : 
                          isTablet ? '-inset-8' : 
                          '-inset-10'
                        } border border-red-400/20 rounded-3xl`}
                      />
                      
                      {/* Main Logo Circle */}
                      <div className={`relative w-full h-full rounded-3xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border-2 border-red-500/40 shadow-2xl shadow-red-500/20 flex items-center justify-center`}>
                        {/* Animated border rings */}
                        <motion.div
                          animate={{
                            rotate: 360
                          }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className={`absolute ${
                            isMobile ? 'inset-2' : 
                            isTablet ? 'inset-3' : 
                            'inset-4'
                          } border border-red-500/20 rounded-2xl`}
                        />
                        
                        {/* Logo Image with Glow */}
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative z-10"
                        >
                          <img 
                            src="/logo.png" 
                            alt="BigBull CAMP Logo" 
                            className={`${
                              isMobile ? 'w-16 h-16' : 
                              isTablet ? 'w-20 h-20' : 
                              'w-24 h-24'
                            } object-contain drop-shadow-lg`}
                          />
                        </motion.div>
                        
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-3 h-3">
                          <motion.div
                            animate={{ 
                              rotate: 360,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              rotate: {
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                              },
                              scale: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            }}
                            className="w-full h-full border-t border-l border-red-500 rounded-tl-lg"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3">
                          <motion.div
                            animate={{ 
                              rotate: -360,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              rotate: {
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                              },
                              scale: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            }}
                            className="w-full h-full border-t border-r border-red-500 rounded-tr-lg"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Title Animation - Responsive typography */}
                    <div className="text-center mb-8 md:mb-12 w-full px-2 overflow-hidden relative">
                      {/* Glitch Effect Layers */}
                      {!isMobile && (
                        <>
                          <motion.div
                            animate={{
                              x: [0, -2, 2, -1, 1, 0],
                              opacity: [1, 0.8, 0.9, 0.8, 0.9, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
                              repeat: 3,
                              repeatDelay: 2
                            }}
                            className="absolute inset-0"
                          >
                            <h1 className={`${
                              isMobile ? 'text-3xl' : 
                              isTablet ? 'text-5xl' : 
                              'text-6xl md:text-8xl'
                            } font-black mb-2 md:mb-4 text-red-500/30 blur-[2px]`}>
                              BIG BULL CAMP
                            </h1>
                          </motion.div>
                          
                          <motion.div
                            animate={{
                              x: [0, 2, -2, 1, -1, 0],
                              opacity: [1, 0.7, 0.8, 0.7, 0.8, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
                              repeat: 3,
                              repeatDelay: 2
                            }}
                            className="absolute inset-0"
                          >
                            <h1 className={`${
                              isMobile ? 'text-3xl' : 
                              isTablet ? 'text-5xl' : 
                              'text-6xl md:text-8xl'
                            } font-black mb-2 md:mb-4 text-cyan-500/20 blur-[1px]`}>
                              BIG BULL CAMP
                            </h1>
                          </motion.div>
                        </>
                      )}
                      
                      {/* Main Title */}
                      <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 1.2,
                          delay: 0.5,
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }}
                        className={`${
                          isMobile ? 'text-3xl sm:text-4xl' : 
                          isTablet ? 'text-5xl' : 
                          'text-6xl md:text-7xl lg:text-8xl'
                        } font-black mb-4 md:mb-6 relative z-10 leading-tight md:leading-normal`}
                      >
                        <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
                          BIG BULL CAMP
                        </span>
                      </motion.h1>
                      
                      {/* Animated Underline */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isMobile ? "200px" : isTablet ? "300px" : "400px" }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                        className={`h-1 md:h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500 mx-auto rounded-full mb-4 md:mb-6 overflow-hidden`}
                      >
                        <motion.div
                          animate={{
                            x: ["-100%", "100%"]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="h-full w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        />
                      </motion.div>
                      
                      {/* Subtitle */}
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.5 }}
                        className="space-y-1 md:space-y-2"
                      >
                        <p className={`${
                          isMobile ? 'text-sm sm:text-base' : 
                          isTablet ? 'text-lg' : 
                          'text-xl md:text-2xl lg:text-3xl'
                        } text-gray-300 font-light tracking-wider`}>
                          ENTERPRISE PROJECT MANAGEMENT
                        </p>
                        <motion.p
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`${
                            isMobile ? 'text-xs sm:text-sm' : 
                            'text-base md:text-lg'
                          } text-red-300/80 font-medium`}
                        >
                          Task Management • Real-time Chat • Workspaces • Analytics
                        </motion.p>
                      </motion.div>
                    </div>

                    {/* Advanced Loading System - Responsive */}
                    <div className={`${
                      isMobile ? 'w-full max-w-xs' : 
                      isTablet ? 'w-80' : 
                      'w-96'
                    } max-w-full mb-8 md:mb-12 px-4`}>
                      <div className="flex justify-between items-center mb-2">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className={`${
                            isMobile ? 'text-xs' : 'text-sm'
                          } text-gray-400 font-medium`}
                        >
                          SYSTEM INITIALIZATION
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className={`${
                            isMobile ? 'text-xs' : 'text-sm'
                          } font-bold text-red-400`}
                        >
                          {loadingProgress}%
                        </motion.span>
                      </div>
                      
                      {/* Main Loading Bar */}
                      <div className="relative h-2 md:h-3 bg-gray-900/50 rounded-full overflow-hidden border border-gray-800">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${loadingProgress}%` }}
                          transition={{ duration: 2.5, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 relative"
                        >
                          {/* Loading bar shine effect */}
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"]
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute inset-y-0 w-16 md:w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                        
                        {/* Loading indicators */}
                        <div className="absolute inset-0 flex justify-between items-center px-1 md:px-2">
                          {[0, 25, 50, 75, 100].map((point) => (
                            <motion.div
                              key={point}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: loadingProgress >= point ? 1 : 0.3,
                                scale: loadingProgress >= point ? 1 : 0.8
                              }}
                              transition={{ duration: 0.3 }}
                              className={`${
                                isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                              } rounded-full ${loadingProgress >= point ? 'bg-red-400' : 'bg-gray-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Loading modules - Responsive grid */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className={`grid ${
                          isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'
                        } mt-3 md:mt-4 ${isMobile ? 'text-xs' : 'text-xs md:text-sm'}`}
                      >
                        {[
                          { name: "Workspace Manager", loaded: loadingProgress > 20 },
                          { name: "Real-time Chat", loaded: loadingProgress > 40 },
                          { name: "Task Engine", loaded: loadingProgress > 60 },
                          { name: "Analytics Dashboard", loaded: loadingProgress > 80 }
                        ].map((module, index) => (
                          <div key={index} className="flex items-center gap-2 truncate">
                            <motion.div
                              animate={{ 
                                scale: module.loaded ? [1, 1.2, 1] : 1,
                                backgroundColor: module.loaded ? "#ef4444" : "#374151"
                              }}
                              transition={{ duration: 0.3 }}
                              className={`${
                                isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                              } rounded-full flex-shrink-0`}
                            />
                            <span className={`${module.loaded ? 'text-red-300' : 'text-gray-500'} truncate`}>
                              {module.name}
                            </span>
                            {module.loaded && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-green-400 text-xs flex-shrink-0"
                              >
                                ✓
                              </motion.span>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Features Grid - Responsive layout */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 2 }}
                      className={`grid ${
                        isMobile ? 'grid-cols-1 gap-4' : 
                        isTablet ? 'grid-cols-2 gap-5' : 
                        'grid-cols-3 gap-6'
                      } w-full max-w-6xl px-4 md:px-6`}
                    >
                      {[
                        { 
                          icon: "⚡", 
                          title: "Lightning Fast",
                          desc: "Real-time collaboration",
                          color: "from-yellow-500 to-red-500"
                        },
                        { 
                          icon: "🔐", 
                          title: "Enterprise Security",
                          desc: "Bank-level encryption",
                          color: "from-red-500 to-red-700"
                        },
                        { 
                          icon: "🚀", 
                          title: "Production Ready",
                          desc: "Scalable architecture",
                          color: "from-red-600 to-orange-500"
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 2.2 + index * 0.2 }}
                          whileHover={{ 
                            scale: isMobile ? 1.02 : 1.05,
                            y: isMobile ? -2 : -5,
                            boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)"
                          }}
                          className={`bg-gradient-to-br ${item.color} p-0.5 rounded-xl md:rounded-2xl w-full`}
                        >
                          <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 h-full">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                              className={`${
                                isMobile ? 'text-2xl' : 'text-3xl'
                              } mb-3 md:mb-4`}
                            >
                              {item.icon}
                            </motion.div>
                            <h3 className={`${
                              isMobile ? 'text-lg' : 'text-xl'
                            } font-bold text-white mb-1 md:mb-2 truncate`}>{item.title}</h3>
                            <p className={`${
                              isMobile ? 'text-xs' : 'text-sm'
                            } text-gray-300 line-clamp-2`}>{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Copyright - Responsive positioning */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ duration: 1, delay: 2.5 }}
                      className="absolute bottom-4 md:bottom-8 text-center w-full px-4"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 3 }}
                        className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent mb-2"
                      />
                      <p className={`${
                        isMobile ? 'text-xs' : 'text-sm'
                      } text-gray-500 font-mono truncate`}>
                        © {new Date().getFullYear()} BIG BULL CAMP v2.0 • ENTERPRISE EDITION
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main App Content */}
            <AnimatePresence>
              {!showIntro && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full overflow-x-hidden"
                >
                  <Header />
                  
                  <Routes>
                    {/* PUBLIC ROUTES */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    
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
                        <PrivateRoute>
                          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
                            <Sidebar />
                          </div>
                        </PrivateRoute>
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