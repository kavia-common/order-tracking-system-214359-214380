import React, { useEffect, useState } from "react";
import { RetroLayout } from "../components/RetroLayout";
import { Button, InlineAlert, LoadingBar, SelectField } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { Api } from "../api/client";

// PUBLIC_INTERFACE
export default function NotificationSettingsPage() {
  /** Authenticated notification preferences screen. */
  const { token } = useAuth();
  const [mode, setMode] = useState("email"); // email | sms | none
  const [frequency, setFrequency] = useState("instant"); // instant | daily
  const [state, setState] = useState({ loading: true, saving: false, error: "", saved: false });

  useEffect(() => {
    let mounted = true;

    async function load() {
      setState({ loading: true, saving: false, error: "", saved: false });
      try {
        const res = await Api.notifications.get(token);
        if (!mounted) return;
        setMode(res?.mode || "email");
        setFrequency(res?.frequency || "instant");
        setState({ loading: false, saving: false, error: "", saved: false });
      } catch (e) {
        if (!mounted) return;
        // Demo defaults
        setMode("email");
        setFrequency("instant");
        setState({ loading: false, saving: false, error: e.message || "Failed to load settings", saved: false });
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function onSave() {
    setState((s) => ({ ...s, saving: true, error: "", saved: false }));
    try {
      await Api.notifications.update(token, { mode, frequency });
      setState((s) => ({ ...s, saving: false, error: "", saved: true }));
    } catch (e) {
      // Demo fallback: treat as saved, but show info
      setState((s) => ({ ...s, saving: false, error: e.message || "Save failed", saved: true }));
    }
  }

  return (
    <RetroLayout title="Notifications" subtitle="Configure alerts for order updates.">
      {state.loading ? <LoadingBar label="Loading settings..." /> : null}

      {!state.loading && state.error ? (
        <InlineAlert
          tone="info"
          title="Backend not ready"
          message={`Using demo settings. Technical details: ${state.error}`}
        />
      ) : null}

      {state.saved ? <InlineAlert tone="success" title="Saved" message="Notification settings updated." /> : null}

      <div className="rt-form">
        <SelectField label="Mode" value={mode} onChange={setMode} name="mode">
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="none">None</option>
        </SelectField>

        <SelectField label="Frequency" value={frequency} onChange={setFrequency} name="frequency">
          <option value="instant">Instant</option>
          <option value="daily">Daily digest</option>
        </SelectField>

        {state.saving ? <LoadingBar label="Saving..." /> : null}

        <div className="rt-row">
          <Button onClick={onSave} disabled={state.loading || state.saving}>
            Save Settings
          </Button>
        </div>
      </div>
    </RetroLayout>
  );
}
