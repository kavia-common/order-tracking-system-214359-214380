import React, { useEffect, useState } from "react";
import { RetroLayout } from "../components/RetroLayout";
import { Button, InlineAlert, LoadingBar, TextField } from "../components/Ui";
import { Api } from "../api/client";
import { useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Landing dashboard: quick lookup + system health. */
  const [health, setHealth] = useState({ loading: true, error: "", ok: false });
  const [orderNumber, setOrderNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        await Api.health();
        if (mounted) setHealth({ loading: false, error: "", ok: true });
      } catch (e) {
        if (mounted) setHealth({ loading: false, error: e.message || "Backend unreachable", ok: false });
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  function onLookup() {
    const trimmed = orderNumber.trim();
    if (!trimmed) return;
    navigate(`/lookup?order_number=${encodeURIComponent(trimmed)}`);
  }

  return (
    <RetroLayout title="Dashboard" subtitle="Monitor orders. Diagnose system. Ship pixels.">
      <div className="rt-grid2">
        <div className="rt-panel">
          <div className="rt-panelTitle">QUICK LOOKUP</div>
          <div className="rt-panelBody">
            <TextField
              label="Order Number"
              value={orderNumber}
              onChange={setOrderNumber}
              placeholder="e.g. OT-2048"
              name="order_number"
              autoComplete="off"
            />
            <div className="rt-row">
              <Button onClick={onLookup} disabled={!orderNumber.trim()}>
                Lookup
              </Button>
              <Button variant="ghost" onClick={() => setOrderNumber("")} disabled={!orderNumber}>
                Clear
              </Button>
            </div>
            <div className="rt-hint">
              Tip: Once backend endpoints exist, this will show real order status. For now it demonstrates loading/error wiring.
            </div>
          </div>
        </div>

        <div className="rt-panel">
          <div className="rt-panelTitle">SYSTEM HEALTH</div>
          <div className="rt-panelBody">
            {health.loading ? <LoadingBar label="Pinging backend..." /> : null}
            {!health.loading && health.ok ? (
              <InlineAlert tone="success" title="Backend online" message="Health check OK (GET /)" />
            ) : null}
            {!health.loading && !health.ok ? (
              <InlineAlert
                tone="error"
                title="Backend offline or misconfigured"
                message={
                  health.error +
                  (process.env.REACT_APP_API_BASE_URL
                    ? ""
                    : " (REACT_APP_API_BASE_URL not set; using relative path)")
                }
              />
            ) : null}

            <div className="rt-kv">
              <div className="rt-kvKey">API BASE URL</div>
              <div className="rt-kvVal">{process.env.REACT_APP_API_BASE_URL || "(not set)"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rt-divider" />

      <div className="rt-panel">
        <div className="rt-panelTitle">WHAT'S NEXT</div>
        <div className="rt-panelBody">
          <ul className="rt-list">
            <li>Login / Signup (demo fallback until backend auth endpoints are implemented)</li>
            <li>Order history (wired to planned endpoints)</li>
            <li>Notification settings (wired to planned endpoints)</li>
            <li>Admin panel for order creation + status updates (admin role required)</li>
          </ul>
        </div>
      </div>
    </RetroLayout>
  );
}
