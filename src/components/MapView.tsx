"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl";
import { NAVI_MUMBAI_CENTER } from "@/lib/nodes";
import type { Pin } from "@/lib/types";

type Props = {
  pins: Pin[];
  onMapClick?: (lng: number, lat: number) => void;
  pendingPin?: { lng: number; lat: number } | null;
};

const STYLE_URL =
  process.env.NEXT_PUBLIC_MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
    : // Free demo style — replace with MapTiler key in production.
      "https://demotiles.maplibre.org/style.json";

export default function MapView({ pins, onMapClick, pendingPin }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const pendingMarkerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [NAVI_MUMBAI_CENTER.lng, NAVI_MUMBAI_CENTER.lat],
      zoom: NAVI_MUMBAI_CENTER.zoom,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => setReady(true));
    map.on("click", (e) => {
      onMapClick?.(e.lngLat.lng, e.lngLat.lat);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // onMapClick is intentionally excluded — handler is read fresh via closure
    // through an effect below to avoid re-creating the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh click handler on prop change without rebuilding the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: maplibregl.MapMouseEvent) => onMapClick?.(e.lngLat.lng, e.lngLat.lat);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onMapClick]);

  // Render pins as colored markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const pin of pins) {
      const el = document.createElement("button");
      el.type = "button";
      el.className =
        "h-6 w-6 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110";
      el.style.background =
        pin.type === "lister" ? "var(--accent, #0f766e)" : "#f59e0b";
      el.title = pin.type === "lister" ? "Listed flat" : "Seeker";

      const popup = new maplibregl.Popup({ offset: 14, closeButton: false })
        .setHTML(renderPopup(pin));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [pins, ready]);

  // Pending (just-clicked) location marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }
    if (!pendingPin) return;
    const el = document.createElement("div");
    el.className =
      "h-7 w-7 rounded-full border-2 border-white bg-rose-500 shadow-lg animate-pulse";
    pendingMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([pendingPin.lng, pendingPin.lat])
      .addTo(map);
  }, [pendingPin]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function renderPopup(pin: Pin): string {
  const title =
    pin.type === "lister"
      ? `${pin.bhk} · ₹${pin.rent.toLocaleString("en-IN")}/mo`
      : `Seeking ${pin.bhk} · up to ₹${pin.rent.toLocaleString("en-IN")}/mo`;
  const sub = [pin.society, pin.sector ? `Sector ${pin.sector}` : null, pin.node]
    .filter(Boolean)
    .join(" · ");
  const notes = pin.notes
    ? `<p style="margin-top:6px;color:#555;font-size:12px">${escapeHtml(pin.notes)}</p>`
    : "";
  return `
    <div style="font-family:var(--font-geist-sans),system-ui;padding:2px 4px;min-width:180px">
      <div style="font-weight:600;font-size:14px">${escapeHtml(title)}</div>
      <div style="color:#666;font-size:12px;margin-top:2px">${escapeHtml(sub)}</div>
      ${notes}
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
