import React, { useEffect, useState } from "react";
import { RetroLayout } from "../components/RetroLayout";
import { InlineAlert, LoadingBar } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { Api } from "../api/client";

// PUBLIC_INTERFACE
export default function OrderHistoryPage() {
  /** Authenticated order history view. */
  const { token, user } = useAuth();
  const [state, setState] = useState({ loading: true, error: "", orders: [] });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setState({ loading: true, error: "", orders: [] });
      try {
        const res = await Api.orders.history(token);
        const items = Array.isArray(res) ? res : res?.orders || [];
        if (mounted) setState({ loading: false, error: "", orders: items });
      } catch (e) {
        // Demo fallback list
        const demo = [
          { id: "1", order_number: "OT-2048", status: "SHIPPED", updated_at: "2026-01-14T11:00:00Z" },
          { id: "2", order_number: "OT-1024", status: "DELIVERED", updated_at: "2026-01-01T08:30:00Z" },
        ];
        if (mounted) setState({ loading: false, error: e.message || "Failed to load history", orders: demo });
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <RetroLayout title="Order History" subtitle={`Account: ${user?.email || "unknown"}`}>
      {state.loading ? <LoadingBar label="Loading order history..." /> : null}
      {!state.loading && state.error ? (
        <InlineAlert
          tone="info"
          title="Backend not ready"
          message={`Showing demo data. Technical details: ${state.error}`}
        />
      ) : null}

      <div className="rt-table" role="table" aria-label="Order history table">
        <div className="rt-tr rt-th" role="row">
          <div className="rt-td" role="columnheader">
            Order
          </div>
          <div className="rt-td" role="columnheader">
            Status
          </div>
          <div className="rt-td" role="columnheader">
            Updated
          </div>
        </div>

        {state.orders.map((o) => (
          <div className="rt-tr" role="row" key={o.id || o.order_number}>
            <div className="rt-td" role="cell">
              {o.order_number}
            </div>
            <div className="rt-td" role="cell">
              <span className="rt-badge">{o.status}</span>
            </div>
            <div className="rt-td" role="cell">
              {o.updated_at || o.last_update || "n/a"}
            </div>
          </div>
        ))}

        {!state.loading && state.orders.length === 0 ? (
          <div className="rt-empty">No orders found.</div>
        ) : null}
      </div>
    </RetroLayout>
  );
}
