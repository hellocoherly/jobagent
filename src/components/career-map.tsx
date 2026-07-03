"use client";

import { useMemo, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import type { MapOffice } from "@/lib/map-data";
import { EmployerPanel } from "@/components/employer-panel";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }; // continental US center
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

function pinColor(bestMatchScore: number | null, hiringScore: number | null) {
  const score = bestMatchScore ?? hiringScore ?? 0;
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#eab308";
  return "#737373";
}

export function CareerMap({ offices, initialSavedEmployerIds }: { offices: MapOffice[]; initialSavedEmployerIds: string[] }) {
  const { isLoaded } = useJsApiLoader({
    id: "compass-ai-google-maps",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [savedEmployerIds, setSavedEmployerIds] = useState(new Set(initialSavedEmployerIds));

  const center = useMemo(() => {
    if (offices.length === 0) return DEFAULT_CENTER;
    const avgLat = offices.reduce((sum, o) => sum + o.latitude, 0) / offices.length;
    const avgLng = offices.reduce((sum, o) => sum + o.longitude, 0) / offices.length;
    return { lat: avgLat, lng: avgLng };
  }, [offices]);

  const selectedOffice = offices.find((office) => office.id === selectedOfficeId) ?? null;

  async function toggleSaved(employerId: string) {
    const isSaved = savedEmployerIds.has(employerId);
    const method = isSaved ? "DELETE" : "POST";
    const res = await fetch(`/api/saved-employers/${employerId}`, { method });
    if (!res.ok) return;

    setSavedEmployerIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(employerId);
      } else {
        next.add(employerId);
      }
      return next;
    });
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900 p-8 text-center text-sm text-neutral-400">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the Career Map. {offices.length} employer offices are ready to display.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-sm text-neutral-400">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full">
      <div className="flex-1">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={offices.length ? 5 : 4}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: MAP_DARK_STYLE,
          }}
        >
          {offices.map((office) => (
            <MarkerF
              key={office.id}
              position={{ lat: office.latitude, lng: office.longitude }}
              onClick={() => setSelectedOfficeId(office.id)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: pinColor(office.bestMatchScore, office.employer.hiringScore),
                fillOpacity: 1,
                strokeColor: "#0a0a0a",
                strokeWeight: 2,
                scale: 9,
              }}
            />
          ))}
        </GoogleMap>
      </div>
      {selectedOffice && (
        <EmployerPanel
          office={selectedOffice}
          isSaved={savedEmployerIds.has(selectedOffice.employer.id)}
          onToggleSaved={() => toggleSaved(selectedOffice.employer.id)}
          onClose={() => setSelectedOfficeId(null)}
        />
      )}
    </div>
  );
}

const MAP_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3a3a3a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];
