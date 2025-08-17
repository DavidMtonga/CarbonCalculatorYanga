import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(atob(token.split(".")[1]));
      setUser(userData);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const { token, user } = await apiLogin(email, password);
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      navigate("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { token, user } = await apiRegister(userData);
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      navigate("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
