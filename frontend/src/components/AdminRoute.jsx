import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
