import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, createUserAsAdmin, deleteUserAsAdmin, resetUserPassword } from "../../services/adminService";
import { useState } from "react";
import Button from "../ui/Button";
import { ZAMBIA_PROVINCES } from "../../constants/provinces";

export default function AdminUsersTable() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery(["adminUsers"], getAllUsers);
  const [form, setForm] = useState({ name: "", email: "", password: "", organization: "", province: "", role: "USER" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading users...</span>
    </div>
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      await createUserAsAdmin(form);
      setForm({ name: "", email: "", password: "", organization: "", province: "", role: "USER" });
      queryClient.invalidateQueries(["adminUsers"]);
      setMessage({ type: "success", text: "User created successfully!" });
    } catch (e) {
      setMessage({ type: "error", text: e?.response?.data?.error || e.message || "Failed to create user" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserAsAdmin(id);
        queryClient.invalidateQueries(["adminUsers"]);
        setMessage({ type: "success", text: "User deleted successfully!" });
      } catch (e) {
        setMessage({ type: "error", text: e?.response?.data?.error || e.message || "Failed to delete user" });
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (!newPassword.trim()) {
      setMessage({ type: "error", text: "Please enter a new password" });
      return;
    }
    try {
      await resetUserPassword(userId, newPassword);
      setResetPasswordId(null);
      setNewPassword("");
      setMessage({ type: "success", text: "Password reset successfully!" });
    } catch (e) {
      setMessage({ type: "error", text: e?.response?.data?.error || e.message || "Failed to reset password" });
    }
  };

  return (
    <div className="p-6">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === "success" 
            ? "bg-green-100 border border-green-300 text-green-700" 
            : "bg-red-100 border border-red-300 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
        </div>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <input 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Full Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
          />
          <input 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Email Address" 
            type="email" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            required 
          />
          <input 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Password" 
            type="password" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            required 
          />
          <select 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" 
            value={form.province} 
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            required
          >
            <option value="">Select Province</option>
            {ZAMBIA_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          <input 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Organization (Optional)" 
            value={form.organization} 
            onChange={(e) => setForm({ ...form, organization: e.target.value })} 
          />
          <select 
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" 
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="USER">Regular User</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <Button 
            type="submit"
            disabled={submitting} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create User"
            )}
          </Button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Province
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.province || "Not specified"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.organization || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "ADMIN" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setResetPasswordId(user.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetPasswordId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setResetPasswordId(null);
                    setNewPassword("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetPassword(resetPasswordId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
