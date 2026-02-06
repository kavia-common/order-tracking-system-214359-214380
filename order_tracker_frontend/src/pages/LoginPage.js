import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RetroLayout } from "../components/RetroLayout";
import { Button, InlineAlert, LoadingBar, TextField } from "../components/Ui";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login screen (uses backend when available, demo fallback otherwise). */
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLocalError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError("Email is required");
      return;
    }
    if (!password) {
      setLocalError("Password is required");
      return;
    }

    const ok = await login(trimmedEmail, password);
    if (ok) navigate("/", { replace: true });
  }

  return (
    <RetroLayout title="Login" subtitle="Authenticate to access your order history and settings.">
      <form className="rt-form" onSubmit={onSubmit}>
        <TextField
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@domain.com"
          name="email"
          type="email"
          autoComplete="email"
        />
        <TextField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          name="password"
          type="password"
          autoComplete="current-password"
        />

        {loading ? <LoadingBar label="Authenticating..." /> : null}
        {localError ? <InlineAlert tone="error" title="Validation error" message={localError} /> : null}
        {error ? <InlineAlert tone="error" title="Login failed" message={error} /> : null}

        <div className="rt-row">
          <Button type="submit" disabled={loading}>
            Login
          </Button>
          <Link to="/signup" className="rt-btn rt-btnGhost">
            Create account
          </Link>
        </div>

        <div className="rt-hint">
          Demo note: emails containing <strong>admin</strong> will be treated as admin until backend roles exist.
        </div>
      </form>
    </RetroLayout>
  );
}
