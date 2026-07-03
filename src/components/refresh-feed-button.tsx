"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshFeedButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/feed/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to refresh feed");
        return;
      }
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isRefreshing}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isRefreshing ? "Scanning the market…" : "Refresh feed"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
