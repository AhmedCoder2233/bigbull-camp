// ResetPassword.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { motion } from "framer-motion";
import { supabase } from "./lib/supabase"; // IMPORTANT: Import supabase

export default function ResetPassword() {
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user came from valid reset link
  useEffect(() => {
    const checkResetSession = async () => {
      setIsChecking(true);
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Invalid reset link. Please request a new password reset email.");
          setIsValidSession(false);
          return;
        }

        if (session) {
          // Check if this is a recovery session
          const hash = window.location.hash;
          console.log("URL Hash:", hash);
          
          // Supabase adds #access_token=...&refresh_token=...&type=recovery
          if (hash && hash.includes("type=recovery")) {
            console.log("Valid recovery link detected");
            setIsValidSession(true);
            
            // Try to set the session from URL
            const { error: urlError } = await supabase.auth.setSession({
              access_token: new URLSearchParams(hash.substring(1)).get('access_token'),
              refresh_token: new URLSearchParams(hash.substring(1)).get('refresh_token'),
            });
            
            if (urlError) {
              console.error("Set session error:", urlError);
            }
          } else {
            // Check if already authenticated (came back after email click)
            const user = session.user;
            console.log("User from session:", user);
            setIsValidSession(true);
          }
        } else {
          // No session, check URL for recovery tokens
          const hash = window.location.hash;
          if (hash && hash.includes("type=recovery")) {
            console.log("Setting session from URL hash");
            
            // Extract tokens from URL
            const params = new URLSearchParams(hash.substring(1));
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            
            if (access_token && refresh_token) {
              // Set the session from URL
              const { error: setError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              
              if (setError) {
                console.error("Error setting session:", setError);
                setError("Invalid or expired reset link. Please request a new one.");
              } else {
                setIsValidSession(true);
              }
            } else {
              setError("Invalid reset link. Missing authentication tokens.");
            }
          } else {
            setError("No valid reset session found. Please request a new password reset email.");
          }
        }
      } catch (err) {
        console.error("Check session error:", err);
        setError("Unable to verify reset link. Please request a new one.");
      } finally {
        setIsChecking(false);
      }
    };

    checkResetSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) throw updateError;

      setSuccess("✅ Password reset successfully! Redirecting to login...");
      
      // Clear URL hash to prevent re-use
      window.history.replaceState(null, "", window.location.pathname);
      
      // Auto sign out and redirect after 3 seconds
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/auth");
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">{error || "This reset link is invalid or has expired."}</p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate("/auth?mode=forgot")}
              className="w-full mt-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Request New Reset Email
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              className="inline-block w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
            <p className="text-gray-600">Create a new password for your account</p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition disabled:bg-gray-100"
                placeholder="Enter new password (min. 6 characters)"
                disabled={loading}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition disabled:bg-gray-100"
                placeholder="Confirm new password"
                disabled={loading}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/auth")}
              disabled={loading}
              className="w-full text-center text-gray-600 hover:text-gray-800 hover:underline transition-colors disabled:opacity-50"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}