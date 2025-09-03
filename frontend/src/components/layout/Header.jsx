import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { Link } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center">
        <Link to="/" className="text-xl sm:text-2xl font-bold">
          Carbon Calculator
        </Link>
        {user && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {user.role === "ADMIN" && (
              <Link to="/admin" className="hover:underline text-sm sm:text-base">
                Admin
              </Link>
            )}
            <span className="text-xs sm:text-sm truncate max-w-[12rem] sm:max-w-none">{user.email}</span>
            <Button onClick={logout} className="bg-green-400 border text-green-600 text-sm px-3 py-2">
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
