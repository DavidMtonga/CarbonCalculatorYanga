import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registerAdmin } from "../services/adminService";

export default function AdminAuthPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
    adminSecret: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      // Use the admin registration service
      const { token, user } = await registerAdmin(form);
      // Store token and user data
      localStorage.setItem("token", token);
      // The auth context will handle the redirect based on role
      window.location.href = "/admin";
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Registration</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 border rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            className="w-full p-3 border rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="w-full p-3 border rounded"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="w-full p-3 border rounded"
            placeholder="Organization (optional)"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
          />
          <input
            type="password"
            className="w-full p-3 border rounded"
            placeholder="Admin Registration Secret"
            value={form.adminSecret}
            onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
            required
          />
          <button
            disabled={submitting}
            className={`w-full py-3 rounded text-white ${
              submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting ? "Registering..." : "Register as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}






