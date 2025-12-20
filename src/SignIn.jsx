import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export default function SignIn() {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/"); // 👈 redirect to dashboard
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow w-80 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Sign In</h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded text-center">
            {error}
          </div>
        )}

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
          className={`w-full py-2 rounded text-white flex justify-center items-center
            ${loading ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"}`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* SIGN UP LINK */}
        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
