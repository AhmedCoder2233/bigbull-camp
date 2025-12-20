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
  const [loading, setLoading] = useState(false); // 👈 NEW

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); // 👈 start loading

    try {
      const res = await signUp(email, password, name);

      if (res === "VERIFY_EMAIL") {
        setSuccess(
          "Account created successfully 🎉 Please check your email to verify your account before signing in."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // 👈 stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow w-80 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">
          Create Account
        </h2>

        {/* SUCCESS */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
            {error}
          </div>
        )}

        <input
          className="w-full border p-2 rounded"
          placeholder="Full Name"
          disabled={loading}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Password"
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className={`w-full py-2 rounded text-white
            ${loading ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"}`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {/* SIGN IN LINK */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
