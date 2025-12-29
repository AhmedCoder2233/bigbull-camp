import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLogOut, FiHome, FiArrowRight, FiMenu, FiX, FiShield, FiDollarSign, FiInfo, FiMail } from "react-icons/fi";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const { user, logout, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getUserDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.name) return user.name;
    return "User";
  };

  const getUserDisplayRole = () => {
    if (profile?.role) return profile.role;
    return "User";
  };

  const getUserAvatarText = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Home", icon: <FiHome />, alwaysVisible: true },
    { path: "/about", label: "About", icon: <FiInfo />, alwaysVisible: true },
    { path: "/pricing", label: "Pricing", icon: <FiDollarSign />, alwaysVisible: true },
    { 
      path: "/contact", 
      label: "Contact", 
      icon: <FiMail />, 
      alwaysVisible: true,
    },
  ];

  const authNavItems = [
    { 
      path: "/workspaces", 
      label: "Workspaces", 
      icon: <FiArrowRight />, 
      requiresAuth: true,
    },
    { 
      path: "/invites", 
      label: "Invites", 
      icon: <FiArrowRight />, 
      requiresAuth: true,
    },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-red-100/50" 
            : "bg-white/90 backdrop-blur-md border-b border-red-100"
        }`}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
            {/* Logo - Responsive sizing */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer flex-shrink-0"
              onClick={() => navigate("/")}
            >
              <img 
                src="/logo.png" 
                alt="BigBull Digital Logo" 
                className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 object-contain hover:opacity-90 transition-opacity"
              />
            </motion.div>

            {/* Desktop Navigation - Visible on lg and above with better spacing */}
            <nav className="hidden lg:flex items-center ml-4 xl:ml-8 space-x-1 xl:space-x-3">
              {navItems.map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-sm xl:text-base font-medium transition-all whitespace-nowrap ${
                    isActivePath(item.path)
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : "text-gray-700 hover:text-red-700 hover:bg-red-50/50"
                  }`}
                >
                  <span className="text-base xl:text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}

              {user && authNavItems.map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl text-sm xl:text-base font-medium transition-all whitespace-nowrap ${
                    isActivePath(item.path)
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : "text-gray-700 hover:text-red-700 hover:bg-red-50/50"
                  }`}
                >
                  <span className="text-base xl:text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Right Side - Auth Section with responsive sizing */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {user ? (
                <>
                  {/* Dashboard Button - Hidden on smallest screens, visible from sm */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/workspaces")}
                    className="hidden sm:block px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg lg:rounded-xl font-semibold hover:shadow-lg hover:shadow-red-200/50 transition-all whitespace-nowrap"
                  >
                    Dashboard
                  </motion.button>

                  {/* User Info - Visible on lg and above with responsive sizing */}
                  <div className="hidden lg:flex items-center gap-2 xl:gap-3 pl-3 xl:pl-4 pr-2 xl:pr-3 py-1.5 xl:py-2 rounded-lg xl:rounded-xl bg-gradient-to-r from-red-50 to-red-50/30 border border-red-100 cursor-pointer hover:border-red-200 transition-colors">
                    <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                      <span className="font-bold text-white text-xs xl:text-sm">
                        {getUserAvatarText()}
                      </span>
                    </div>
                    <div className="text-left min-w-0 max-w-[120px] xl:max-w-[160px]">
                      <p className="font-semibold text-gray-900 text-xs xl:text-sm truncate">
                        {getUserDisplayName().split(' ')[0]} | {getUserDisplayRole()}
                      </p>
                      <p className="text-[10px] xl:text-xs text-gray-500 truncate">{user.email?.split('@')[0]}</p>
                    </div>
                  </div>

                  {/* Mobile User Avatar - Show below lg with responsive sizing */}
                  <div className="lg:hidden flex items-center">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md cursor-pointer">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {getUserAvatarText()}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button - Visible on lg and above */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="hidden lg:block px-3 xl:px-4 py-2 xl:py-2.5 text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 rounded-lg xl:rounded-xl transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4 xl:w-5 xl:h-5" />
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Sign In Button - Hidden on mobile, visible from md */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/auth")}
                    className="hidden md:block px-3 lg:px-5 py-2 lg:py-2.5 text-sm lg:text-base text-gray-700 hover:text-red-700 font-semibold transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </motion.button>
                  
                  {/* Get Started Button - Visible from sm with responsive sizing */}
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/auth")}
                    className="hidden sm:block px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg lg:rounded-xl font-semibold hover:shadow-xl hover:shadow-red-200/50 transition-all whitespace-nowrap"
                  >
                    Get Started
                  </motion.button>
                </>
              )}

              {/* Mobile Menu Button - Show below lg with responsive sizing */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-red-50 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
                ) : (
                  <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay - Below lg with responsive sizing */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-[85vw] xs:w-[75vw] sm:w-full max-w-[320px] sm:max-w-sm bg-white shadow-2xl lg:hidden"
            >
              {/* Mobile Menu Header with responsive padding */}
              <div className="p-4 sm:p-6 border-b border-red-100 bg-gradient-to-b from-white to-red-50/30">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img 
                      src="/logo.png" 
                      alt="BigBull Digital Logo" 
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm sm:text-base">Menu</h2>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
                  </motion.button>
                </div>

                {/* User Info with responsive sizing */}
                {user && (
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-50/50 rounded-lg sm:rounded-xl border border-red-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {getUserAvatarText()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {getUserDisplayName()} | {getUserDisplayRole()}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Content with responsive sizing */}
              <div className="h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] overflow-y-auto p-3 sm:p-4">
                <div className="space-y-1.5 sm:space-y-2">
                  {[...navItems, ...(user ? authNavItems : [])].map((item) => (
                    <motion.button
                      key={item.path}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all ${
                        isActivePath(item.path)
                          ? "bg-red-50 border border-red-200"
                          : "hover:bg-red-50/50"
                      }`}
                    >
                      <span className={`text-lg sm:text-xl ${
                        isActivePath(item.path) ? "text-red-600" : "text-gray-600"
                      }`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <span className={`font-medium text-sm sm:text-base ${
                          isActivePath(item.path) ? "text-red-700" : "text-gray-900"
                        }`}>
                          {item.label}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Mobile Auth Buttons with responsive sizing */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-red-100">
                  {user ? (
                    <div className="space-y-2.5 sm:space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigate("/workspaces");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-shadow"
                      >
                        Go to Dashboard
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        Logout
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 sm:space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigate("/auth");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base border-2 border-red-200 text-red-600 font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Sign In
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigate("/auth");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg hover:shadow-red-200/50 transition-all"
                      >
                        Get Started
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
