import React, { useState } from "react";
import { toast } from "react-toastify";
import "./SyncButton.css";

const SyncButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) toast.success("Sync completed ✅");
      else toast.error("Error ❌");
    } catch (err) {
      console.error(err);
      toast.error("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sync-button-container">
      <button onClick={handleSync} disabled={loading}>
        {loading ? "Synchronization..." : "Run sync"}
      </button>
    </div>
  );
};

export default SyncButton;
