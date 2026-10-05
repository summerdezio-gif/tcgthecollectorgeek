import React from "react";
import { MASCOTTE_URL } from "@/lib/constants";

// Mascotte T.C.G. — garçon à lunettes tenant une carte
export default function Mascotte({ className = "", size = 200 }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Halo jaune sunburst derrière */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, #FFD000 0%, #FFD000 55%, transparent 70%)",
          filter: "drop-shadow(0 0 20px rgba(255,208,0,0.5))"
        }}
      />
      <img
        src={MASCOTTE_URL}
        alt="Mascotte T.C.G. The Collector Geeks"
        className="absolute inset-0 w-full h-full object-contain animate-float"
        style={{ filter: "drop-shadow(4px 4px 0 #0B0B10)" }}
      />
    </div>
  );
}