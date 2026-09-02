import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetails from "./pages/AdminUserDetails";
import QuestionManagement from "./pages/QuestionManagement";
import GoogleCallback from "./pages/GoogleCallback";
import ProblemWorkspace from "./pages/ProblemWorkspace";

import apiClient from "./api/client";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CHECK LOGIN
  // ==========================================

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(
          "/users/profile/"
        );

        setUser(response.data);
        setIsLoggedIn(true);

      } catch (error) {
        console.error(
          "Login session expired:",
          error
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setIsLoggedIn(false);
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // ==========================================
  // LOGIN SUCCESS
  // ==========================================

  const handleLoginSuccess = async () => {
    try {
      const response = await apiClient.get(
        "/users/profile/"
      );

      setUser(response.data);
      setIsLoggedIn(true);

    } catch (error) {
      console.error(
        "Unable to get user profile:",
        error
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setIsLoggedIn(false);
    setUser(null);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            LOGIN
        ===================================== */}

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              user?.role === "ADMIN" ? (
                <Navigate
                  to="/admin"
                  replace
                />
              ) : (
                <Navigate
                  to="/dashboard"
                  replace
                />
              )
            ) : (
              <LoginPage
                onLoginSuccess={
                  handleLoginSuccess
                }
              />
            )
          }
        />


        {/* =====================================
            GOOGLE CALLBACK
        ===================================== */}

        <Route
          path="/google-callback"
          element={
            <GoogleCallback
              onLoginSuccess={
                handleLoginSuccess
              }
            />
          }
        />


        {/* =====================================
            STUDENT DASHBOARD
        ===================================== */}

        <Route
          path="/dashboard"
          element={
            !isLoggedIn ? (
              <Navigate
                to="/login"
                replace
              />
            ) : user?.role === "ADMIN" ? (
              <Navigate
                to="/admin"
                replace
              />
            ) : (
              <Dashboard
                onLogout={handleLogout}
              />
            )
          }
        />


        {/* =====================================
            PROBLEM WORKSPACE
        ===================================== */}

        <Route
          path="/problem/:questionId"
          element={
            !isLoggedIn ? (
              <Navigate
                to="/login"
                replace
              />
            ) : user?.role === "ADMIN" ? (
              <Navigate
                to="/admin"
                replace
              />
            ) : (
              <ProblemWorkspace />
            )
          }
        />


        {/* =====================================
            ADMIN DASHBOARD
        ===================================== */}

        <Route
          path="/admin"
          element={
            !isLoggedIn ? (
              <Navigate
                to="/login"
                replace
              />
            ) : user?.role !== "ADMIN" ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <AdminDashboard
                onLogout={handleLogout}
              />
            )
          }
        />


        {/* =====================================
            ADMIN QUESTION MANAGEMENT
        ===================================== */}

        <Route
          path="/admin/questions"
          element={
            !isLoggedIn ? (
              <Navigate
                to="/login"
                replace
              />
            ) : user?.role !== "ADMIN" ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <QuestionManagement />
            )
          }
        />


        {/* =====================================
            ADMIN USER DETAILS
        ===================================== */}

        <Route
          path="/admin/users/:userId"
          element={
            !isLoggedIn ? (
              <Navigate
                to="/login"
                replace
              />
            ) : user?.role !== "ADMIN" ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <AdminUserDetails />
            )
          }
        />


        {/* =====================================
            DEFAULT ROUTE
        ===================================== */}

        <Route
          path="*"
          element={
            !isLoggedIn ? (
              <Navigate
                to="/login"
                replace
              />
            ) : user?.role === "ADMIN" ? (
              <Navigate
                to="/admin"
                replace
              />
            ) : (
              <Navigate
                to="/dashboard"
                replace
              />
            )
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;