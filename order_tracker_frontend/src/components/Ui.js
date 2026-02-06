import React from "react";

// PUBLIC_INTERFACE
export function TextField({ label, value, onChange, type = "text", placeholder, name, autoComplete }) {
  /** Controlled text input field. */
  return (
    <label className="rt-field">
      <div className="rt-fieldLabel">{label}</div>
      <input
        className="rt-input"
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// PUBLIC_INTERFACE
export function SelectField({ label, value, onChange, name, children }) {
  /** Controlled select field. */
  return (
    <label className="rt-field">
      <div className="rt-fieldLabel">{label}</div>
      <select className="rt-select" name={name} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}

// PUBLIC_INTERFACE
export function Button({ children, onClick, type = "button", variant = "primary", disabled }) {
  /** Retro-styled button. */
  const cls =
    variant === "ghost"
      ? "rt-btn rt-btnGhost"
      : variant === "danger"
        ? "rt-btn rt-btnDanger"
        : "rt-btn";

  return (
    <button className={cls} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
export function InlineAlert({ tone = "info", title, message }) {
  /** Inline alert for errors/success/info. */
  const cls = tone === "error" ? "rt-alert rt-alertError" : tone === "success" ? "rt-alert rt-alertSuccess" : "rt-alert";
  return (
    <div className={cls} role={tone === "error" ? "alert" : "status"}>
      <div className="rt-alertTitle">{title}</div>
      {message ? <div className="rt-alertMsg">{message}</div> : null}
    </div>
  );
}

// PUBLIC_INTERFACE
export function LoadingBar({ label = "Loading..." }) {
  /** Retro loading indicator. */
  return (
    <div className="rt-loading" role="status" aria-live="polite">
      <div className="rt-loadingLabel">{label}</div>
      <div className="rt-loadingTrack">
        <div className="rt-loadingFill" />
      </div>
    </div>
  );
}
