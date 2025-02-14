// App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Posts from "../components/ui/Posts";
import { AuthProvider } from "../contexts/AuthContext";
import { PublicRoute, ProtectedRoute, RequireAuth } from "./Routes";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes - redirect to posts if authenticated */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes - redirect to login if not authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/posts" element={<Posts />} />
              {/* Add other protected routes here */}
            </Route>

            {/* Redirect root to posts or login based on auth status */}
            <Route
              path="/"
              element={<RequireAuth redirectTo="/login" path="/posts" />}
            />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;
