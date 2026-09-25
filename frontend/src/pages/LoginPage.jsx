import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import AeroShards from "../components/AeroShards/AeroShards";

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
  `${import.meta.env.VITE_API_BASE_URL}/accounts/google/login/`;
  };

  return (
  <div className="login-page">

    {/* AeroShards Background */}
    <div className="login-background">
      <AeroShards
        backgroundColor="#120F17"
        shardColor="#896ABD"
        accentColor="#A855F7"
        placement="full"
        flow="stream"
        material="pearl"
        detail="balanced"
        effect="none"
        scale={1}
        spread={1}
        depth={1}
        speed={1}
        spin={1}
        interaction="repel"
        density={1.5}
        shardSize={1.1}
        stretch={1}
        turbulence={1}
        glow={1}
        edgeSoftness={2}
        bloom={0.5}
        grain={0.05}
        chromaticAberration={0.0075}
        transitionDuration={1}
        interactionRadius={1.5}
        interactionStrength={0.5}
        rippleIntensity={1}
        holdToGather={true}
      />
    </div>

    {/* Login Content */}
    <div className="login-content">

      <form
        className="login-form"
        onSubmit={handleLogin}
      >

        {/* Brand */}
        <div className="login-brand">
          <h1>DSA Tracker</h1>

          <p>
            Track your DSA preparation
          </p>
        </div>


        {/* Login Heading */}
        <h2>Login</h2>


        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* Username */}
        <div className="login-input-wrapper">

          <span className="input-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              />
              <path
                d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
              />
            </svg>
          </span>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
          />

        </div>


        {/* Password */}
        <div className="login-input-wrapper">

          <span className="input-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
              />
              <path
                d="M8 10V7a4 4 0 0 1 8 0v3"
              />
            </svg>
          </span>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

        </div>


        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="login-submit"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>


        {/* Divider */}
        <div className="login-divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>


        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-login-button"
        >

          <span className="google-icon">
            G
          </span>

          <span>
            Continue with Google
          </span>

        </button>


        {/* Register */}
        <p className="login-register">
          Don't have an account?{" "}
          <a href="/register">
            Register
          </a>
        </p>

      </form>

    </div>

  </div>
);
}

export default LoginPage;