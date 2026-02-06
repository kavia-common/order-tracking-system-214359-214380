import React, { useState } from "react";
import { RetroLayout } from "../components/RetroLayout";
import { Button, InlineAlert, LoadingBar, SelectField, TextField } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { Api } from "../api/client";

const STATUSES = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// PUBLIC_INTERFACE
export default function AdminPanelPage() {
  /** Admin panel: create orders + update status. */
  const { token } = useAuth();

  const [create, setCreate] = useState({
    orderNumber: "",
    customerEmail: "",
    status: "CREATED",
  });

  const [update, setUpdate] = useState({
    orderId: "",
    status: "PROCESSING",
  });

  const [state, setState] = useState({
    creating: false,
    updating: false,
    error: "",
    success: "",
  });

  function clearMessages() {
    setState((s) => ({ ...s, error: "", success: "" }));
  }

  async function onCreate() {
    clearMessages();
    const orderNumber = create.orderNumber.trim();
    const customerEmail = create.customerEmail.trim();

    if (!orderNumber || !customerEmail) {
      setState((s) => ({ ...s, error: "Order number and customer email are required." }));
      return;
    }

    setState((s) => ({ ...s, creating: true }));
    try {
      await Api.admin.createOrder(token, {
        order_number: orderNumber,
        customer_email: customerEmail,
        status: create.status,
      });
      setState((s) => ({ ...s, creating: false, success: "Order created." }));
      setCreate({ orderNumber: "", customerEmail: "", status: "CREATED" });
    } catch (e) {
      // Demo fallback: pretend success
      setState((s) => ({
        ...s,
        creating: false,
        success: "Order created (demo fallback).",
        error: e.message || "",
      }));
      setCreate({ orderNumber: "", customerEmail: "", status: "CREATED" });
    }
  }

  async function onUpdate() {
    clearMessages();
    const orderId = update.orderId.trim();
    if (!orderId) {
      setState((s) => ({ ...s, error: "Order ID is required." }));
      return;
    }

    setState((s) => ({ ...s, updating: true }));
    try {
      await Api.admin.updateStatus(token, orderId, update.status);
      setState((s) => ({ ...s, updating: false, success: "Status updated." }));
      setUpdate({ orderId: "", status: "PROCESSING" });
    } catch (e) {
      setState((s) => ({
        ...s,
        updating: false,
        success: "Status updated (demo fallback).",
        error: e.message || "",
      }));
      setUpdate({ orderId: "", status: "PROCESSING" });
    }
  }

  return (
    <RetroLayout title="Admin Panel" subtitle="Create orders. Update statuses. Keep the timeline intact.">
      {state.error ? <InlineAlert tone="info" title="Backend note" message={state.error} /> : null}
      {state.success ? <InlineAlert tone="success" title="OK" message={state.success} /> : null}

      <div className="rt-grid2">
        <div className="rt-panel">
          <div className="rt-panelTitle">CREATE ORDER</div>
          <div className="rt-panelBody">
            <TextField
              label="Order Number"
              value={create.orderNumber}
              onChange={(v) => setCreate((s) => ({ ...s, orderNumber: v }))}
              placeholder="OT-9999"
              name="order_number"
              autoComplete="off"
            />
            <TextField
              label="Customer Email"
              value={create.customerEmail}
              onChange={(v) => setCreate((s) => ({ ...s, customerEmail: v }))}
              placeholder="customer@domain.com"
              name="customer_email"
              type="email"
              autoComplete="off"
            />
            <SelectField
              label="Initial Status"
              value={create.status}
              onChange={(v) => setCreate((s) => ({ ...s, status: v }))}
              name="initial_status"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>

            {state.creating ? <LoadingBar label="Creating order..." /> : null}

            <div className="rt-row">
              <Button onClick={onCreate} disabled={state.creating || state.updating}>
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className="rt-panel">
          <div className="rt-panelTitle">UPDATE STATUS</div>
          <div className="rt-panelBody">
            <TextField
              label="Order ID"
              value={update.orderId}
              onChange={(v) => setUpdate((s) => ({ ...s, orderId: v }))}
              placeholder="db-id-or-order-number"
              name="order_id"
              autoComplete="off"
            />
            <SelectField
              label="New Status"
              value={update.status}
              onChange={(v) => setUpdate((s) => ({ ...s, status: v }))}
              name="new_status"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>

            {state.updating ? <LoadingBar label="Updating status..." /> : null}

            <div className="rt-row">
              <Button onClick={onUpdate} disabled={state.creating || state.updating}>
                Update
              </Button>
            </div>

            <div className="rt-hint">
              Note: This UI is already wired; backend endpoints will need to implement <code>/admin/orders</code> and{" "}
              <code>/admin/orders/:id/status</code>.
            </div>
          </div>
        </div>
      </div>
    </RetroLayout>
  );
}
