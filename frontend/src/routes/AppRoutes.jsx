import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import Assistant from "../pages/Assistant";
import Chat from "../pages/Chat";
import Knowledge from "../pages/Knowledge";
import Documents from "../pages/Documents";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ==================== PUBLIC ==================== */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* ==================== PROTECTED ==================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 🤖 GENERAL AI ASSISTANT */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <Assistant />
          </ProtectedRoute>
        }
      />

      {/* 📚 DOCUMENT KNOWLEDGE / RAG */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* 📚 KNOWLEDGE SEARCH */}
      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <Knowledge />
          </ProtectedRoute>
        }
      />

      {/* 📄 DOCUMENT MANAGEMENT */}
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />

      {/* ⚙️ SETTINGS */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ==================== ROOT ==================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* ==================== 404 ==================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;