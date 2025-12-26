import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const { signIn, signUp, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

// Auth.js mein handleSubmit function update karein
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    if (isForgotPassword) {
      // Forgot Password - Now with proper checking
      await forgotPassword(formData.email);
      setSuccess("📧 Password reset link has been sent to your email! Please check your inbox (and spam folder).");
      setFormData({ email: "", password: "", name: "" });
      
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccess("");
      }, 5000);
    } else if (isSignUp) {
      // Sign Up
      const result = await signUp(formData.email, formData.password, formData.name);
      if (result === "VERIFY_EMAIL") {
        setSuccess(
          "🎉 Account created successfully! Please check your email to verify your account before signing in. Ensure you will receive the verification code only 1 time in 1 email."
        );
        setFormData({ email: "", password: "", name: "" });
        
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess("");
        }, 3000);
      }
    } else {
      // Sign In
      await signIn(formData.email, formData.password);
      navigate("/");
    }
  } catch (err) {
    // Show actual error message
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);
    setError("");
    setSuccess("");
    setFormData({ email: "", password: "", name: "" });
  };

 const toggleForgotPassword = () => {
  setIsForgotPassword(!isForgotPassword);
  setError("");
  setSuccess("");
  setFormData({ email: "", password: "", name: "" });
  
  // Also update URL for better tracking
  if (!isForgotPassword) {
    window.history.pushState({}, "", "/auth?mode=forgot");
  } else {
    window.history.pushState({}, "", "/auth");
  }
};

  // Determine current mode for UI
  const getCurrentMode = () => {
    if (isForgotPassword) return "forgotPassword";
    if (isSignUp) return "signUp";
    return "signIn";
  };

  const currentMode = getCurrentMode();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-block w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {currentMode === "signUp" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  ) : currentMode === "forgotPassword" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  )}
                </svg>
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentMode === "signUp" 
                ? "Create Account" 
                : currentMode === "forgotPassword"
                ? "Reset Password"
                : "Welcome Back"}
            </h2>
            <p className="text-gray-600">
              {currentMode === "signUp"
                ? "Sign up to get started"
                : currentMode === "forgotPassword"
                ? "Enter your email to reset password"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Success Alert */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className={`${currentMode === "forgotPassword" ? "bg-blue-50 border-l-4 border-blue-500" : "bg-green-50 border-l-4 border-green-500"} p-4 rounded-lg`}>
                  <p className={`${currentMode === "forgotPassword" ? "text-blue-700" : "text-green-700"} text-sm font-medium`}>
                    {success}
                  </p>
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
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Sign Up Only) */}
            <AnimatePresence mode="wait">
              {currentMode === "signUp" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required={currentMode === "signUp"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100"
                    placeholder="John Doe"
                    disabled={loading}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100"
                placeholder="you@example.com"
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Field (Not for Forgot Password) */}
            <AnimatePresence mode="wait">
              {currentMode !== "forgotPassword" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={currentMode !== "forgotPassword"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100"
                    placeholder={currentMode === "signUp" ? "Create a password" : "Enter your password"}
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {currentMode === "signUp" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password Link (Only for Sign In) */}
            {currentMode === "signIn" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  disabled={loading}
                  className="text-sm text-red-600 hover:text-red-800 hover:underline transition-colors disabled:opacity-50"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {currentMode === "forgotPassword" 
                    ? "Sending reset link..." 
                    : currentMode === "signUp" 
                    ? "Creating account..." 
                    : "Signing in..."}
                </div>
              ) : (
                <>{currentMode === "forgotPassword" 
                    ? "Send Reset Link" 
                    : currentMode === "signUp" 
                    ? "Create Account" 
                    : "Sign In"}</>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              {currentMode === "forgotPassword" ? (
                <>
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    disabled={loading}
                    className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
                  >
                    Back to Sign In
                  </button>
                </>
              ) : currentMode === "signUp" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                    className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                    className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
