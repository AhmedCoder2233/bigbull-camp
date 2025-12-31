import { useState, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiFileText,
  FiUserPlus,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronRight,
  FiUser,
  FiBriefcase,
  FiSettings,
  FiTrendingUp,
  FiZap,
  FiShield
} from "react-icons/fi";

export default function SidebarWorkspace() {
  const { profile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const isAhmedMemon = profile?.email === "ahmedmemon3344@gmail.com";

  const navItems = [
    { 
      path: "/workspaces", 
      label: "Workspaces", 
      icon: FiBriefcase,
      description: "Manage all workspaces",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      path: "/lead-form", 
      label: "Lead Form", 
      icon: FiFileText,
      description: "Create new leads",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      path: "/leads", 
      label: "Leads", 
      icon: FiUserPlus,
      description: "Manage all leads",
      gradient: "from-emerald-500 to-emerald-600"
    },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Floating Menu Button - Fixed position with responsive placement */}
      <motion.button
        onClick={toggleSidebar}
        className={`fixed z-50 p-3 text-red-600 hover:shadow-red-500/50 border-0 transition-all border
          ${sidebarOpen ? '-left-64 lg:-left-48' : 'left-0 lg:left-4'} 
          top-14 md:top-20 lg:top-24 bg-black border-2`}
        aria-label="Toggle menu"
        style={{
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <motion.div
          animate={sidebarOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sidebarOpen ? (
            <></>
          ) : (
            <FiMenu className="w-6 h-6" />
          )}
        </motion.div>
        
        {/* Pulse ring effect when closed */}
        {!sidebarOpen && (
          <motion.span
            className="absolute inset-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
          />
        )}
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:bg-transparent lg:pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -400 }}
        animate={{ x: sidebarOpen ? 0 : -400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 z-50 h-screen w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl flex flex-col"
      >
        {/* Gradient Header */}
        <div className="relative p-6 border-b border-white/20 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 overflow-hidden">
          {/* Animated background shapes */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/40"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <FiBriefcase className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">BigBull CAMP</h2>
                <p className="text-sm text-white/90 font-medium">Workspace Dashboard</p>
              </div>
            </div>
            <motion.button
              onClick={() => setSidebarOpen(false)}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 transition-all shadow-lg"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-6">
          <motion.div 
            className="relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100/50 to-purple-100/50 rounded-full blur-2xl" />
            
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-white font-bold text-xl">
                    {profile?.name?.charAt(0) || profile?.email?.charAt(0)}
                  </span>
                </motion.div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-white rounded-full shadow-md"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-base">
                  {profile?.name || profile?.email}
                </h3>
                <p className="text-sm text-gray-600 truncate">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <motion.span 
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      isAhmedMemon 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isAhmedMemon ? '👑 Admin' : '👤 User'}
                  </motion.span>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = isActivePath(item.path);
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredItem(item.path)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="block"
                  >
                    <motion.div
                      className={`
                        relative group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 overflow-hidden
                        ${isActive 
                          ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-xl' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active indicator line */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/50 rounded-r-full"
                          layoutId="activeIndicator"
                        />
                      )}
                      
                      {/* Icon container */}
                      <motion.div 
                        className={`p-3 rounded-xl ${
                          isActive 
                            ? 'bg-white/20 shadow-lg' 
                            : 'bg-white group-hover:bg-gray-50 shadow-sm'
                        }`}
                        whileHover={{ rotate: 5 }}
                      >
                        <item.icon className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-gray-600'
                        }`} />
                      </motion.div>
                      
                      {/* Text content */}
                      <div className="flex-1">
                        <div className="font-bold text-base">{item.label}</div>
                        <p className={`text-xs mt-0.5 ${
                          isActive ? 'text-white/90' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Arrow indicator */}
                      <motion.div
                        animate={{
                          x: isActive ? 0 : -10,
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </motion.div>
                      
                      {/* Hover glow effect */}
                      {hoveredItem === item.path && !isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                      )}
                    </motion.div>
                  </NavLink>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-4">
              Quick Overview
            </h3>
            <div className="space-y-3">
              <motion.div 
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50 shadow-sm"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-200/50 rounded-xl">
                      <FiShield className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Role Status</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                    isAhmedMemon 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  }`}>
                    {isAhmedMemon ? 'Administrator' : 'Standard User'}
                  </span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/50 shadow-sm"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-200/50 rounded-xl">
                      <FiZap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Access Level</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl shadow-sm">
                    {isAhmedMemon ? 'Full Access' : 'Limited'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
          <div className="space-y-2">
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all shadow-lg"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 rounded-xl bg-white/20">
                <FiLogOut className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">Logout</span>
            </motion.button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 font-medium">
              © 2024 BigBull CAMP • All Rights Reserved
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
