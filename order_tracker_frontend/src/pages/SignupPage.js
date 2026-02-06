import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RetroLayout } from "../components/RetroLayout";
import { Button, InlineAlert, LoadingBar, TextField } from "../components/Ui";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function SignupPage() {
  /** Signup screen (uses backend when available, demo fallback otherwise). */
  const { signup, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
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
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    if (password !== password2) {
      setLocalError("Passwords do not match");
      return;
    }

    const ok = await signup(trimmedEmail, password);
    if (ok) navigate("/", { replace: true });
  }

  return (
    <RetroLayout title="Signup" subtitle="Create a new account to track orders and receive notifications.">
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
          autoComplete="new-password"
        />
        <TextField
          label="Confirm Password"
          value={password2}
          onChange={setPassword2}
          placeholder="••••••••"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
        />

        {loading ? <LoadingBar label="Creating account..." /> : null}
        {localError ? <InlineAlert tone="error" title="Validation error" message={localError} /> : null}
        {error ? <InlineAlert tone="error" title="Signup failed" message={error} /> : null}

        <div className="rt-row">
          <Button type="submit" disabled={loading}>
            Signup
          </Button>
          <Link to="/login" className="rt-btn rt-btnGhost">
            Back to login
          </Link>
        </div>
      </form>
    </RetroLayout>
  );
}
