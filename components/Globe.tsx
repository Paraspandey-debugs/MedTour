"use client";

import React, { useEffect, useRef } from "react";

export interface GlobeLocation {
  id: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
}

export interface MedicalHub {
  id: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
}

export const MEDICAL_HUBS: MedicalHub[] = [
  { id: "bangkok", name: "Bangkok", country: "Thailand", flag: "🇹🇭", lat: 13.7563, lng: 100.5018 },
  { id: "delhi", name: "New Delhi", country: "India", flag: "🇮🇳", lat: 28.6139, lng: 77.2090 },
  { id: "istanbul", name: "Istanbul", country: "Türkiye", flag: "🇹🇷", lat: 41.0082, lng: 28.9784 },
  { id: "seoul", name: "Seoul", country: "South Korea", flag: "🇰🇷", lat: 37.5665, lng: 126.9780 },
  { id: "singapore", name: "Singapore", country: "Singapore", flag: "🇸🇬", lat: 1.3521, lng: 103.8198 },
  { id: "penang", name: "Penang", country: "Malaysia", flag: "🇲🇾", lat: 5.4164, lng: 100.3327 },
  { id: "dubai", name: "Dubai", country: "UAE", flag: "🇦🇪", lat: 25.2048, lng: 55.2708 },
  { id: "tijuana", name: "Tijuana", country: "Mexico", flag: "🇲🇽", lat: 32.5149, lng: -117.0382 },
];

// Pre-calculated representative landmass points for earth continents (lat, lng in degrees)
const LAND_POINTS: [number, number][] = [
  // North America
  [45, -100], [55, -110], [50, -85], [40, -75], [35, -90], [30, -100], [38, -120], [48, -122],
  [60, -135], [64, -150], [25, -80], [20, -100], [50, -65], [32, -85], [42, -93], [37, -105],
  // South America
  [5, -73], [-5, -60], [-10, -50], [-15, -45], [-23, -46], [-34, -58], [-20, -65], [-33, -70],
  [-12, -77], [0, -78], [-45, -70], [-52, -68],
  // Europe
  [50, 10], [52, 0], [48, 2], [40, -4], [42, 12], [46, 14], [55, 37], [60, 25],
  [58, 15], [60, 10], [54, 18], [44, 20], [38, 24], [56, -4], [53, -8],
  // Africa
  [30, 31], [25, 15], [20, 0], [15, -15], [10, 10], [5, 25], [0, 35], [-5, 20],
  [-15, 30], [-25, 28], [-33, 20], [10, 40], [12, -5], [-20, 18], [-4, 39], [32, -5],
  // Asia
  [35, 105], [30, 115], [40, 116], [22, 114], [35, 139], [34, 135], [43, 142], [37, 127],
  [55, 80], [60, 100], [65, 130], [50, 60], [45, 75], [25, 85], [20, 78], [13, 80],
  [23, 70], [15, 101], [10, 106], [1, 104], [32, 53], [24, 45], [33, 44], [38, 35],
  // Oceania / Australia
  [-25, 135], [-33, 151], [-37, 145], [-31, 115], [-20, 148], [-12, 131], [-41, 174], [-36, 175],
  [-3, 140], [-6, 106], [-8, 115],
];

interface GlobeProps {
  selectedLocation: GlobeLocation;
  targetHub?: MedicalHub;
  className?: string;
  size?: number;
}

export default function Globe({
  selectedLocation,
  targetHub,
  className = "",
  size = 360,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current view rotation angles (in radians)
  const currentRot = useRef({
    yaw: -selectedLocation.lng * (Math.PI / 180),
    pitch: selectedLocation.lat * (Math.PI / 180) * 0.4,
  });

  // Target rotation angles towards selected location
  const targetRot = useRef({
    yaw: -selectedLocation.lng * (Math.PI / 180),
    pitch: selectedLocation.lat * (Math.PI / 180) * 0.4,
  });

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);
  const pulsePhase = useRef(0);
  const beamProgress = useRef(0);

  // Update target rotation when selected location changes
  useEffect(() => {
    targetRot.current = {
      yaw: -selectedLocation.lng * (Math.PI / 180),
      pitch: Math.max(-0.6, Math.min(0.6, selectedLocation.lat * (Math.PI / 180) * 0.5)),
    };
  }, [selectedLocation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle High-DPI screens
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = size * 0.38;
    const cx = size / 2;
    const cy = size / 2;

    let running = true;

    // Convert lat/lng to 3D Cartesian on unit sphere
    const latLngToVec3 = (lat: number, lng: number): [number, number, number] => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -Math.sin(phi) * Math.cos(theta);
      const z = Math.sin(phi) * Math.sin(theta);
      const y = Math.cos(phi);
      return [x, y, z];
    };

    // Rotate point around Y-axis (yaw) and X-axis (pitch)
    const rotateVec = (
      [x, y, z]: [number, number, number],
      yaw: number,
      pitch: number
    ): [number, number, number] => {
      // Rotate around Y
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      return [x1, y2, z2];
    };

    const render = () => {
      if (!running) return;

      // Smooth camera interpolation towards target
      if (!isDragging.current) {
        currentRot.current.yaw += (targetRot.current.yaw - currentRot.current.yaw) * 0.06;
        currentRot.current.pitch += (targetRot.current.pitch - currentRot.current.pitch) * 0.06;
        // Subtle ambient continuous drift
        targetRot.current.yaw -= 0.0012;
      }

      pulsePhase.current = (pulsePhase.current + 0.04) % (Math.PI * 2);
      beamProgress.current = (beamProgress.current + 0.008) % 1;

      ctx.clearRect(0, 0, size, size);

      // 1. Atmospheric Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      glowGrad.addColorStop(0, "rgba(13, 92, 83, 0.25)");
      glowGrad.addColorStop(0.5, "rgba(12, 169, 157, 0.08)");
      glowGrad.addColorStop(1, "rgba(23, 35, 33, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Earth Sphere Body
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, "#123c38");
      sphereGrad.addColorStop(0.5, "#0b2b28");
      sphereGrad.addColorStop(1, "#071c19");

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // 3. Graticule (Latitudinal and Longitudinal Grid Lines)
      ctx.strokeStyle = "rgba(123, 168, 162, 0.14)";
      ctx.lineWidth = 1;

      // Parallels (Latitude rings)
      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 10) {
          const v = latLngToVec3(lat, lng);
          const [rx, ry, rz] = rotateVec(v, currentRot.current.yaw, currentRot.current.pitch);
          if (rz > 0) {
            const px = cx + rx * radius;
            const py = cy - ry * radius;
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });

      // Meridians (Longitude lines)
      [-120, -60, 0, 60, 120, 180].forEach((lng) => {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 8) {
          const v = latLngToVec3(lat, lng);
          const [rx, ry, rz] = rotateVec(v, currentRot.current.yaw, currentRot.current.pitch);
          if (rz > 0) {
            const px = cx + rx * radius;
            const py = cy - ry * radius;
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });

      // 4. Landmass Points
      LAND_POINTS.forEach(([lat, lng]) => {
        const v = latLngToVec3(lat, lng);
        const [rx, ry, rz] = rotateVec(v, currentRot.current.yaw, currentRot.current.pitch);
        if (rz > 0) {
          const px = cx + rx * radius;
          const py = cy - ry * radius;
          const alpha = Math.max(0.15, rz);
          ctx.fillStyle = `rgba(85, 196, 190, ${alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.4 * (0.6 + rz * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Medical Hubs (Destinations)
      const visibleHubs: { hub: MedicalHub; px: number; py: number; rz: number }[] = [];
      MEDICAL_HUBS.forEach((hub) => {
        const v = latLngToVec3(hub.lat, hub.lng);
        const [rx, ry, rz] = rotateVec(v, currentRot.current.yaw, currentRot.current.pitch);
        if (rz > 0) {
          const px = cx + rx * radius;
          const py = cy - ry * radius;
          visibleHubs.push({ hub, px, py, rz });

          // Draw hub node
          const isTarget = targetHub?.id === hub.id;
          ctx.fillStyle = isTarget ? "#17b4a5" : "#0ca99d";
          ctx.beginPath();
          ctx.arc(px, py, isTarget ? 4.5 : 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 6. Selected Origin Marker & Radar Ping
      const originV = latLngToVec3(selectedLocation.lat, selectedLocation.lng);
      const [ox, oy, oz] = rotateVec(originV, currentRot.current.yaw, currentRot.current.pitch);
      let originPx = 0;
      let originPy = 0;

      if (oz > 0) {
        originPx = cx + ox * radius;
        originPy = cy - oy * radius;

        // Animated radar pulse rings
        const ringRadius = 4 + Math.sin(pulsePhase.current) * 8 + 8;
        const ringAlpha = Math.max(0, 1 - ringRadius / 22);

        ctx.strokeStyle = `rgba(212, 91, 44, ${ringAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(originPx, originPy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Origin central core
        ctx.fillStyle = "#d45b2c";
        ctx.beginPath();
        ctx.arc(originPx, originPy, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 7. Flight Arcs Connecting Origin to Medical Hubs
      if (oz > -0.2) {
        const hubsToConnect = targetHub
          ? MEDICAL_HUBS.filter((h) => h.id === targetHub.id)
          : MEDICAL_HUBS.slice(0, 4);

        hubsToConnect.forEach((hub) => {
          const hubV = latLngToVec3(hub.lat, hub.lng);
          const [hx, hy, hz] = rotateVec(hubV, currentRot.current.yaw, currentRot.current.pitch);

          if (hz > -0.2) {
            const hpx = cx + hx * radius;
            const hpy = cy - hy * radius;

            // Arc control point lifted outward into 3D space
            const midX = (ox + hx) * 0.5;
            const midY = (oy + hy) * 0.5;
            const midZ = (oz + hz) * 0.5;
            const dist = Math.sqrt(midX * midX + midY * midY + midZ * midZ) || 1;
            const arcAltitude = 1.25; // Bulge outwards

            const ctlX = cx + (midX / dist) * radius * arcAltitude;
            const ctlY = cy - (midY / dist) * radius * arcAltitude;

            // Draw curved flight arc
            ctx.beginPath();
            ctx.moveTo(originPx, originPy);
            ctx.quadraticCurveTo(ctlX, ctlY, hpx, hpy);
            ctx.strokeStyle = "rgba(12, 169, 157, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 4]);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash

            // Draw animated traveling photon beam along quadratic curve
            const t = (beamProgress.current + (hub.lng % 50) / 100) % 1;
            const oneMinusT = 1 - t;
            // Quadratic Bezier formula: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
            const bx =
              oneMinusT * oneMinusT * originPx +
              2 * oneMinusT * t * ctlX +
              t * t * hpx;
            const by =
              oneMinusT * oneMinusT * originPy +
              2 * oneMinusT * t * ctlY +
              t * t * hpy;

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(bx, by, 3, 0, Math.PI * 2);
            ctx.fill();

            const beamGlow = ctx.createRadialGradient(bx, by, 1, bx, by, 7);
            beamGlow.addColorStop(0, "rgba(85, 196, 190, 0.9)");
            beamGlow.addColorStop(1, "rgba(85, 196, 190, 0)");
            ctx.fillStyle = beamGlow;
            ctx.beginPath();
            ctx.arc(bx, by, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      ctx.restore(); // restore clipping

      // 8. Outer Rim & Atmosphere Ring
      ctx.strokeStyle = "rgba(13, 92, 83, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 9. Location Pin Tooltip when facing front
      if (oz > 0.15) {
        ctx.fillStyle = "rgba(23, 35, 33, 0.88)";
        ctx.strokeStyle = "rgba(212, 91, 44, 0.6)";
        ctx.lineWidth = 1;

        const labelText = `${selectedLocation.flag} ${selectedLocation.name}`;
        ctx.font = "bold 11px Inter, system-ui, sans-serif";
        const textMetrics = ctx.measureText(labelText);
        const padding = 6;
        const boxW = textMetrics.width + padding * 2;
        const boxH = 20;
        const boxX = originPx - boxW / 2;
        const boxY = originPy - 28;

        // Rounded box
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(labelText, boxX + padding, boxY + 14);
      }

      animFrame.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [selectedLocation, targetHub, size]);

  // Interactive mouse/touch dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    currentRot.current.yaw += dx * 0.008;
    currentRot.current.pitch = Math.max(
      -0.8,
      Math.min(0.8, currentRot.current.pitch - dy * 0.008)
    );
    targetRot.current.yaw = currentRot.current.yaw;
    targetRot.current.pitch = currentRot.current.pitch;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (canvasRef.current) canvasRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="cursor-grab active:cursor-grabbing rounded-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        title="Interactive 3D Medical Route Globe: Click and drag to spin"
      />

      {/* Floating Interactive Badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xs border border-line shadow-xs px-3 py-1 rounded-full text-[10px] text-muted flex items-center gap-1.5 pointer-events-none">
        <span className="size-2 rounded-full bg-teal animate-pulse" />
        <span>Live Medical Corridors • Drag to spin</span>
      </div>
    </div>
  );
}
