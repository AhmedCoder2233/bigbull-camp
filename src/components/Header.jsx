import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLogOut, FiHome, FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getUserDisplayName = () => {
    if (profile?.name) return profile.name;
    return "User";
  };

  const getUserDisplayRole = () => {
    if (profile?.role) return profile.role;
    return "User";
  };

  // Get user initials for avatar
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
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-md border-b border-red-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo and Home */}
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer"
                onClick={() => navigate("/")}
              >
                {/* Logo from path */}
                  <img 
                    src="/logo.png" 
                    alt="BigBull Digital Logo" 
                    className="w-20 h-20 sm:w-32 sm:h-32"
                  />
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                {/* Home Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiHome className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Home</span>
                </motion.button>

                {/* Workspaces Link - Only show if logged in */}
                {user && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/workspaces")}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Workspaces</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/invites")}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Check Invites</span>
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Desktop User Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* Dashboard Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/workspaces")}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow hover:shadow-red-200"
                  >
                    Dashboard
                  </motion.button>

                  {/* User Info - Always show */}
                  <div className="flex items-center gap-3 px-3 sm:px-4 py-2 rounded-xl bg-red-50 cursor-pointer">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {getUserAvatarText()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{getUserDisplayName()} | {getUserDisplayRole()}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Logout Button - Always visible */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Sign In Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/signin")}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 text-gray-700 font-semibold hover:text-red-700 transition-colors"
                  >
                    Sign In
                  </motion.button>

                  {/* Get Started Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow hover:shadow-red-200"
                  >
                    Get Started Free
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6 text-red-700" />
              ) : (
                <FiMenu className="w-6 h-6 text-red-700" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
          >
            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className="p-6 border-b border-red-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <img 
                        src="/logo.png" 
                        alt="BigBull Digital Logo" 
                        className="w-20 h-20 object-contain"
                      />
                    <div>
                      <p className="text-sm text-red-500 font-medium">Menu</p>
                    </div>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <FiX className="w-6 h-6 text-red-700" />
                  </button>
                </div>

                {/* User Info in Mobile Menu */}
                {user && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl mb-4 border border-red-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <span className="font-bold text-white text-sm">
                        {getUserAvatarText()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Content */}
              <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
                {/* Navigation Links */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate("/");
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left"
                >
                  <FiHome className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Home</span>
                </motion.button>

                {user && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/workspaces");
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200 text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <img 
                          src="/logo.png" 
                          alt="Dashboard" 
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <span className="font-bold text-gray-900">Dashboard</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/workspaces");
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left"
                    >
                      <FiArrowRight className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Workspaces</span>
                        <p className="text-sm text-gray-500">Manage your projects</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/invites");
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left"
                    >
                      <FiArrowRight className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">Check Invites</span>
                        <p className="text-sm text-gray-500">View workspace invites</p>
                      </div>
                    </motion.button>
                  </>
                )}

                {/* Auth Buttons */}
                {!user ? (
                  <div className="space-y-3 pt-4 border-t border-red-100">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/signin");
                        closeMobileMenu();
                      }}
                      className="w-full p-4 rounded-xl border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <span className="font-semibold">Sign In</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate("/signup");
                        closeMobileMenu();
                      }}
                      className="w-full p-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-shadow hover:shadow-red-200"
                    >
                      Get Started Free
                    </motion.button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-red-100">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span className="font-semibold">Logout</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
