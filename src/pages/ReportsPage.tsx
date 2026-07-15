import { useEffect, useRef, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { getSupersetGuestToken } from "../services/superset";

const SUPERSET_DOMAIN = "http://localhost:8088";
const DASHBOARD_ID = "f23ab6b6-f175-4daa-8323-ae2be31c38e2";

export default function ReportsPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!mountRef.current) return;

      try {
        setLoading(true);
        setError(null);

        await embedDashboard({
          id: DASHBOARD_ID,
          supersetDomain: SUPERSET_DOMAIN,
          mountPoint: mountRef.current,
          fetchGuestToken: async () => getSupersetGuestToken(DASHBOARD_ID),
        });

        const iframe = mountRef.current.querySelector("iframe");

        if (iframe) {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load dashboard.");
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {loading && <p style={{ padding: "16px" }}>Loading dashboard...</p>}
      {error && <p style={{ padding: "16px" }}>{error}</p>}

      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "calc(100vh - 64px)",
        }}
      />
    </div>
  );
}
