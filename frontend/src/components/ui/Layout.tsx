import type React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isAuthPage && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
                </Link>
                {isAuthenticated && (
                  <div className="ml-6 flex space-x-8">
                    <Link
                      to="/posts"
                      className="text-gray-900 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      News Monitor
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {isAuthenticated && (
                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="ml-4 px-4 py-2 text-sm"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
