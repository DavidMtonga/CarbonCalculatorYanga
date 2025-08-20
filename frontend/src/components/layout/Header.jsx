import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { Link } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Carbon Calculator
        </Link>
        {user && (
          <div className="flex items-center space-x-4">
            {user.role === "ADMIN" && (
              <Link to="/admin" className="hover:underline">
                Admin
              </Link>
            )}
            <span>{user.email}</span>
            <Button onClick={logout} className="bg-green-400 border text-green-600">
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
