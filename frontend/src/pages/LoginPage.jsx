import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError(
        "Please enter username and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        "/users/login/",
        {
          username,
          password,
        }
      );

      localStorage.setItem(
        "accessToken",
        response.data.access
      );

      localStorage.setItem(
        "refreshToken",
        response.data.refresh
      );

      onLoginSuccess();

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error.response?.data?.detail ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://127.0.0.1:8000/accounts/google/login/";
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={handleLogin}
      >
        <h1>DSA Tracker</h1>

        <p>
          Track your DSA preparation
        </p>

        <h2>Login</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        <div className="divider">
          OR
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>

        <p>
          Don't have an account?{" "}
          <a href="/register">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;