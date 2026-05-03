"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl";
import { NAVI_MUMBAI_CENTER, NODES } from "@/lib/nodes";

const NODE_NAME_BY_SLUG = new Map(NODES.map((n) => [n.slug, n.name]));
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

    // Track the currently-open click popup so we can close it before opening
    // another, ensuring only one full card is visible at a time.
    let openClickPopup: maplibregl.Popup | null = null;

    for (const pin of pins) {
      const el = document.createElement("button");
      el.type = "button";
      el.className =
        "h-6 w-6 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110";
      el.style.background =
        pin.type === "lister" ? "var(--accent, #0f766e)" : "#f59e0b";

      const clickPopup = new maplibregl.Popup({
        offset: 14,
        closeButton: true,
        maxWidth: "320px",
      }).setHTML(renderClickPopup(pin));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);

      const openCard = (ev: Event) => {
        ev.stopPropagation();
        if (openClickPopup) openClickPopup.remove();
        clickPopup.setLngLat([pin.lng, pin.lat]).addTo(map);
        openClickPopup = clickPopup;
        clickPopup.on("close", () => {
          if (openClickPopup === clickPopup) openClickPopup = null;
        });
      };
      el.addEventListener("click", openCard);
      el.addEventListener("touchend", openCard);

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

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0 }}
    />
  );
}

function renderClickPopup(pin: Pin): string {
  const price = `₹${pin.rent.toLocaleString("en-IN")}/mo`;
  const title =
    pin.type === "lister"
      ? `${pin.bhk} · ${price}`
      : `Seeking ${pin.bhk} · up to ${price}`;
  const nodeName = pin.node ? NODE_NAME_BY_SLUG.get(pin.node) ?? pin.node : null;
  const location = [
    pin.society,
    pin.sector ? `Sector ${pin.sector}` : null,
    nodeName,
  ]
    .filter(Boolean)
    .join(" · ");

  const detailRows: string[] = [];
  if (pin.furnishing) detailRows.push(row("Furnishing", capitalize(pin.furnishing)));
  if (pin.gated !== null && pin.gated !== undefined)
    detailRows.push(row("Gated society", pin.gated ? "Yes" : "No"));
  if (pin.parking !== null && pin.parking !== undefined && pin.parking > 0)
    detailRows.push(row("Parking", `${pin.parking} space${pin.parking > 1 ? "s" : ""}`));
  if (pin.deposit_months)
    detailRows.push(row("Deposit", `${pin.deposit_months} months`));
  if (pin.pet_ok !== null && pin.pet_ok !== undefined)
    detailRows.push(row("Pets", pin.pet_ok ? "Allowed" : "Not allowed"));
  if (pin.gender_pref && pin.gender_pref !== "any")
    detailRows.push(row("Gender", capitalize(pin.gender_pref)));
  if (pin.diet_pref && pin.diet_pref !== "any")
    detailRows.push(row("Diet", capitalize(pin.diet_pref)));
  if (pin.smoking_pref && pin.smoking_pref !== "any")
    detailRows.push(row("Smoking", pin.smoking_pref === "ok" ? "Allowed" : "No"));

  const notes = pin.notes
    ? `<p style="margin:10px 0 2px;padding-top:10px;border-top:1px solid #ececec;color:#404040;font-size:12.5px;line-height:1.5">${escapeHtml(pin.notes)}</p>`
    : "";

  const badgeColor = pin.type === "lister" ? "#0f766e" : "#f59e0b";
  const badgeText = pin.type === "lister" ? "Listed flat" : "Seeker";

  return `
    <div style="font-family:var(--font-geist-sans),system-ui;padding:4px 4px 2px;min-width:260px;max-width:300px;color:#0c0a09">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${badgeColor};color:#fff;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px">${badgeText}</span>
      </div>
      <div style="font-weight:600;font-size:16px;line-height:1.25">${escapeHtml(title)}</div>
      ${location ? `<div style="color:#737373;font-size:12.5px;margin-top:3px">${escapeHtml(location)}</div>` : ""}
      ${detailRows.length ? `<div style="margin-top:10px;display:flex;flex-direction:column;gap:4px">${detailRows.join("")}</div>` : ""}
      ${notes}
    </div>
  `;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function row(label: string, value: string): string {
  return `<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;gap:8px"><span style="color:#9ca3af">${escapeHtml(label)}</span><span style="color:#171717;font-weight:500;text-align:right">${escapeHtml(value)}</span></div>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
