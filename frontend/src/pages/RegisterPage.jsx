import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      await apiClient.post("/users/register/", {
        username,
        email,
        password,
      });

      setSuccess(
        "Registration successful. You can now login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      setError(
        JSON.stringify(
          error.response?.data ||
          "Registration failed."
        )
      );
    }
  };

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={handleRegister}
      >
        <h1>Create Account</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
        />

        <button type="submit">
          Register
        </button>

        <p>
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;