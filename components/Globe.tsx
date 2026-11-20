"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

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
  size = 380,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const currentPhi = useRef(0);
  const currentTheta = useRef(0);
  const targetPhi = useRef(0);
  const targetTheta = useRef(0);
  const [activeHubIndex, setActiveHubIndex] = useState(0);

  // Compute spherical target angles from lat/lng
  useEffect(() => {
    targetPhi.current = (-selectedLocation.lng * Math.PI) / 180 + Math.PI / 2;
    targetTheta.current = (selectedLocation.lat * Math.PI) / 180 * 0.45;
  }, [selectedLocation]);

  // Rotate through destination hubs every 4 seconds for route preview
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHubIndex((prev) => (prev + 1) % MEDICAL_HUBS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const highlightedHub = targetHub || MEDICAL_HUBS[activeHubIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Markers: Selected Origin (terracotta), Medical Hubs (teal)
    const markers = [
      {
        location: [selectedLocation.lat, selectedLocation.lng] as [number, number],
        size: 0.12,
        color: [0.83, 0.36, 0.17] as [number, number, number],
      },
      ...MEDICAL_HUBS.map((hub) => ({
        location: [hub.lat, hub.lng] as [number, number],
        size: hub.id === highlightedHub.id ? 0.08 : 0.04,
        color: hub.id === highlightedHub.id ? [0.83, 0.36, 0.17] as [number, number, number] : [0.05, 0.66, 0.61] as [number, number, number],
      })),
    ];

    // Native 3D flight arcs connecting Origin to Medical Hubs
    const arcs = MEDICAL_HUBS.map((hub) => ({
      from: [selectedLocation.lat, selectedLocation.lng] as [number, number],
      to: [hub.lat, hub.lng] as [number, number],
      color: hub.id === highlightedHub.id ? [0.83, 0.36, 0.17] as [number, number, number] : [0.05, 0.66, 0.61] as [number, number, number],
    }));

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2),
      width: (size || 380) * 2,
      height: (size || 380) * 2,
      phi: targetPhi.current,
      theta: targetTheta.current,
      dark: 1,
      diffuse: 1.25,
      mapSamples: 18000,
      mapBrightness: 6,
      baseColor: [0.04, 0.22, 0.19], // Deep MedTour teal (#0B463F)
      markerColor: [0.83, 0.36, 0.17], // Terracotta (#D45B2C)
      glowColor: [0.05, 0.66, 0.61], // Mint / bright teal glow (#0CA99D)
      markers,
      arcs,
      arcColor: [0.05, 0.66, 0.61],
      arcWidth: 1.5,
      arcHeight: 0.35,
    });

    let animId: number;
    const render = () => {
      // When user is not dragging, gently auto-drift and lerp towards target
      if (!pointerInteracting.current) {
        targetPhi.current += 0.002;
      }
      currentPhi.current += (targetPhi.current - currentPhi.current) * 0.06;
      currentTheta.current += (targetTheta.current - currentTheta.current) * 0.06;

      globe.update({
        phi: currentPhi.current + pointerInteractionMovement.current,
        theta: currentTheta.current,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
    };
  }, [selectedLocation, highlightedHub, size]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none overflow-hidden rounded-3xl ${className}`}
      style={{ width: "100%", maxWidth: size, height: size }}
    >
      {/* Radial Atmosphere Ambient Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(12,169,157,0.18)_0%,rgba(11,70,63,0.06)_50%,transparent_75%)] pointer-events-none" />

      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          maxWidth: "100%",
          aspectRatio: "1",
        }}
        className="cursor-grab active:cursor-grabbing touch-none relative z-10"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.005;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.005;
          }
        }}
      />

      {/* Floating Live Corridors HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 text-[11px]">
        <div className="bg-white/90 backdrop-blur-md border border-line shadow-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold text-ink">
          <span className="size-2 rounded-full bg-terracotta animate-pulse" />
          <span>{selectedLocation.flag} {selectedLocation.name}</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-line shadow-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold text-teal">
          <span>✈️ Route:</span>
          <span>{highlightedHub.flag} {highlightedHub.name}</span>
        </div>
      </div>

      {/* Drag & Controls Prompt */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink/80 backdrop-blur-md text-white border border-white/10 px-3.5 py-1 rounded-full text-[10px] flex items-center gap-2 pointer-events-none z-20">
        <span className="size-1.5 rounded-full bg-tealBrand animate-ping" />
        <span>Drag to rotate • WebGL 3D flight arcs</span>
      </div>
    </div>
  );
}
