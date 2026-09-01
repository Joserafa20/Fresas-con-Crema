"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export function SoundAlert({ trigger }: { trigger: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    if (!enabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Web Audio not available
    }
  }, [enabled, volume]);

  useEffect(() => {
    if (trigger) playBeep();
  }, [trigger, playBeep]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} style={{ accentColor: "#e11d48" }} />
        🔊 Alerta sonora
      </label>
      {enabled && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ width: 80, accentColor: "#e11d48" }}
        />
      )}
    </div>
  );
}
