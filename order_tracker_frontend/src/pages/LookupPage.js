import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { RetroLayout } from "../components/RetroLayout";
import { Button, InlineAlert, LoadingBar, TextField } from "../components/Ui";
import { Api } from "../api/client";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// PUBLIC_INTERFACE
export default function LookupPage() {
  /** Public order lookup by order number (no auth required). */
  const query = useQuery();
  const initial = query.get("order_number") || "";

  const [orderNumber, setOrderNumber] = useState(initial);
  const [state, setState] = useState({ loading: false, error: "", result: null });

  useEffect(() => {
    // If navigated in with query param, attempt lookup immediately.
    if (initial) {
      void runLookup(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runLookup(num) {
    const trimmed = num.trim();
    if (!trimmed) return;

    setState({ loading: true, error: "", result: null });
    try {
      const res = await Api.orders.lookup(trimmed);
      setState({ loading: false, error: "", result: res });
    } catch (e) {
      // Demo fallback: show a mock order on 404/endpoint missing
      const fallback = {
        order_number: trimmed,
        status: "PROCESSING",
        eta: "T+3 days",
        last_update: new Date().toISOString(),
        note: "Demo fallback (backend endpoint not implemented yet).",
      };
      setState({ loading: false, error: e.message || "Lookup failed", result: fallback });
    }
  }

  return (
    <RetroLayout title="Lookup" subtitle="Enter an order number and retrieve the latest status.">
      <div className="rt-grid2">
        <div className="rt-panel">
          <div className="rt-panelTitle">LOOKUP INPUT</div>
          <div className="rt-panelBody">
            <TextField
              label="Order Number"
              value={orderNumber}
              onChange={setOrderNumber}
              placeholder="OT-2048"
              name="order_number"
              autoComplete="off"
            />
            <div className="rt-row">
              <Button onClick={() => runLookup(orderNumber)} disabled={!orderNumber.trim() || state.loading}>
                Run Lookup
              </Button>
              <Button variant="ghost" onClick={() => setOrderNumber("")} disabled={state.loading || !orderNumber}>
                Clear
              </Button>
            </div>

            {state.loading ? <LoadingBar label="Querying backend..." /> : null}
            {state.error && !state.result ? (
              <InlineAlert tone="error" title="Lookup error" message={state.error} />
            ) : null}
            {state.error && state.result ? (
              <InlineAlert
                tone="info"
                title="Backend not ready"
                message={`Showing demo data. Technical details: ${state.error}`}
              />
            ) : null}
          </div>
        </div>

        <div className="rt-panel">
          <div className="rt-panelTitle">RESULT</div>
          <div className="rt-panelBody">
            {!state.result ? (
              <div className="rt-hint">No result yet. Enter an order number and run lookup.</div>
            ) : (
              <div className="rt-orderCard">
                <div className="rt-orderRow">
                  <div className="rt-orderKey">ORDER</div>
                  <div className="rt-orderVal">{state.result.order_number || orderNumber}</div>
                </div>
                <div className="rt-orderRow">
                  <div className="rt-orderKey">STATUS</div>
                  <div className="rt-orderVal rt-badge">{state.result.status || "UNKNOWN"}</div>
                </div>
                <div className="rt-orderRow">
                  <div className="rt-orderKey">ETA</div>
                  <div className="rt-orderVal">{state.result.eta || "n/a"}</div>
                </div>
                <div className="rt-orderRow">
                  <div className="rt-orderKey">LAST UPDATE</div>
                  <div className="rt-orderVal">{state.result.last_update || "n/a"}</div>
                </div>
                {state.result.note ? <div className="rt-hint">{state.result.note}</div> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </RetroLayout>
  );
}
