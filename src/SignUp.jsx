import { useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Link } from "react-router-dom";

export default function SignUp() {
  const { signUp } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    console.log("🚀 Submitting form with:", { email, name }); // Debug log
    
    const res = await signUp(email, password, name);

    console.log("✅ SignUp response:", res); // Debug log

    // Check both string and object response
    if (res === "VERIFY_EMAIL" || res?.status === "VERIFY_EMAIL") {
      setSuccess(
        "Account created successfully 🎉 Please check your email to verify your account before signing in."
      );
      
      // Clear form
      setEmail("");
      setPassword("");
      setName("");
    }
  } catch (err) {
    console.error("❌ Form error:", err); // Debug log
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">Join our community today</p>
            </div>

            {/* SUCCESS */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Create a password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
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
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </div>
            </button>

            {/* SIGN IN LINK */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-red-600 font-semibold hover:text-red-800 hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="bg-red-50 px-8 py-4 border-t border-red-100">
            <p className="text-xs text-gray-600 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
        
        {/* Decorative elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-red-300 rounded-full"></div>
            <div className="w-2 h-2 bg-red-100 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

