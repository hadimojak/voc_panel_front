import { useEffect, useRef, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { getSupersetGuestToken } from "../services/superset";

const SUPERSET_DOMAIN = "http://localhost:8088";
const DASHBOARD_ID = "f23ab6b6-f175-4daa-8323-ae2be31c38e2";

export default function ReportsPage() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === pageRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  async function handleToggleFullscreen() {
    if (!pageRef.current) return;

    try {
      if (document.fullscreenElement === pageRef.current) {
        await document.exitFullscreen();
      } else {
        await pageRef.current.requestFullscreen();
      }
    } catch (err) {
      setError("Fullscreen mode is not available.");
    }
  }

  return (
    <div
      ref={pageRef}
      className={`reports-page ${isFullscreen ? "reports-page--fullscreen" : ""}`}
    >
      <div className="reports-page__toolbar">
        <button
          type="button"
          className="reports-page__fullscreen-btn"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {loading && <p className="reports-page__message">Loading dashboard...</p>}
      {error && <p className="reports-page__message">{error}</p>}

      <div
        ref={mountRef}
        className={`reports-page__dashboard ${
          isFullscreen ? "reports-page__dashboard--fullscreen" : ""
        }`}
      />
    </div>
  );
}
