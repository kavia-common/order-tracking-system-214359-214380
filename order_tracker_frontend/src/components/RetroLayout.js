import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function RetroLayout({ title, subtitle, children }) {
  /** App layout with retro header + sidebar navigation. */
  const { isAuthed, role, user, logout } = useAuth();

  return (
    <div className="rt-app">
      <header className="rt-header">
        <div className="rt-brand">
          <Link to="/" className="rt-brandLink">
            OrderTracker<span className="rt-brandAccent">.EXE</span>
          </Link>
          <div className="rt-brandTag">Retro Order Ops Console</div>
        </div>

        <div className="rt-userBar">
          <div className="rt-userMeta">
            <div className="rt-userLabel">USER</div>
            <div className="rt-userValue">{user?.email || (isAuthed ? "signed-in" : "guest")}</div>
          </div>
          <div className="rt-userMeta">
            <div className="rt-userLabel">ROLE</div>
            <div className="rt-userValue">{role}</div>
          </div>
          {isAuthed ? (
            <button type="button" className="rt-btn rt-btnSmall" onClick={logout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="rt-btn rt-btnSmall rt-btnGhost">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="rt-main">
        <nav className="rt-nav" aria-label="Primary navigation">
          <div className="rt-navTitle">NAV</div>
          <NavLink to="/" end className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
            Order History
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
            Notifications
          </NavLink>
          <NavLink to="/lookup" className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
            Lookup
          </NavLink>

          <div className="rt-navDivider" />

          <div className="rt-navTitle">ACCESS</div>
          <NavLink to="/login" className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
            Login
          </NavLink>
          <NavLink to="/signup" className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
            Signup
          </NavLink>

          {role === "admin" && (
            <>
              <div className="rt-navDivider" />
              <div className="rt-navTitle">ADMIN</div>
              <NavLink to="/admin" className={({ isActive }) => `rt-navLink ${isActive ? "isActive" : ""}`}>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <section className="rt-content" aria-label="Content">
          <div className="rt-pageHeader">
            <div>
              <h1 className="rt-title">{title}</h1>
              {subtitle ? <p className="rt-subtitle">{subtitle}</p> : null}
            </div>
            <div className="rt-scanlines" aria-hidden="true" />
          </div>
          <div className="rt-card">{children}</div>
        </section>
      </div>

      <footer className="rt-footer">
        <span>© {new Date().getFullYear()} OrderTracker.EXE</span>
        <span className="rt-footerSep">|</span>
        <span>STATUS: READY</span>
      </footer>
    </div>
  );
}
