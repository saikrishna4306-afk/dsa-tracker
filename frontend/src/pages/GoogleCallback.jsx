import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleCallback({ onLoginSuccess }) {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    const params = new URLSearchParams(
      hash.substring(1)
    );

    const accessToken = params.get("access");
    const refreshToken = params.get("refresh");

    if (accessToken && refreshToken) {
      localStorage.setItem(
        "accessToken",
        accessToken
      );

      localStorage.setItem(
        "refreshToken",
        refreshToken
      );

      onLoginSuccess();

      navigate("/dashboard", {
        replace: true,
      });
    } else {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate, onLoginSuccess]);

  return (
    <div className="loading">
      <h2>Signing you in...</h2>
    </div>
  );
}

export default GoogleCallback;