import React, { useEffect, useRef, useState } from "react";
import { analyticsAPI } from "../../services/api";

const STATIC = [
  { label: "Facebook",  value: 42, color: "#3b82f6" },
  { label: "Google",    value: 31, color: "#f59e0b" },
  { label: "Instagram", value: 18, color: "#ec4899" },
  { label: "Other",     value: 9,  color: "#6366f1" },
];

const SZ = 160;
const R  = 58;
const CIR = 2 * Math.PI * R;

export default function AdsChart() {
  const ref = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [data, setData]         = useState(STATIC);
  const [budget, setBudget]     = useState({ used: 1240, total: 1500 });

  useEffect(() => {
    analyticsAPI.getStats()
      .then(res => {
        const ads = res?.data?.adsBreakdown;
        if (ads && ads.length > 0) {
          setData(ads.map(a => ({
            label: a.label,
            value: a.value,
            color: a.color || "#38BDF8",
          })));
        }
        if (res?.data?.adsBudget) {
          setBudget(res.data.adsBudget);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setAnimated(true), 100);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Calculate total for percentage display
  const total = data.reduce((sum, d) => sum + d.value, 0) || 100;

  let offset = 0;
  const segments = data.map(d => {
    const pct     = (d.value / total) * 100;
    const dash    = CIR * (pct / 100);
    const gap     = CIR - dash;
    const dashOff = -(offset / 100) * CIR;
    offset += pct;
    return { ...d, pct, dash, gap, dashOff };
  });

  return (
    <div ref={ref} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "clamp(16px,3vw,28px)", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(14px,3vw,24px)", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ color: "#fff", fontSize: "clamp(0.85rem,2.2vw,0.95rem)", fontWeight: 700, margin: 0, fontFamily: "var(--font-head)" }}>
          Ad Spend Breakdown
        </h3>
        <span style={{ background: "rgba(56,189,248,0.1)", color: "#38BDF8", padding: "3px 11px", borderRadius: 99, fontSize: "clamp(0.68rem,1.6vw,0.74rem)", fontWeight: 700, fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
          This Month
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,3vw,24px)", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ position: "relative", flexShrink: 0, width: "min(160px,38vw)", height: "min(160px,38vw)" }}>
          <svg viewBox={`0 0 ${SZ} ${SZ}`} width="100%" height="100%" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={18} />
            {segments.map((s, i) => (
              <circle key={i}
                cx={SZ/2} cy={SZ/2} r={R}
                fill="none" stroke={s.color} strokeWidth={18}
                strokeLinecap="round"
                strokeDasharray={animated ? `${s.dash} ${s.gap}` : `0 ${CIR}`}
                strokeDashoffset={s.dashOff}
                style={{ transition: `stroke-dasharray 1.1s ease ${i * 0.2}s` }}
              />
            ))}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.3rem)", color: "#fff", lineHeight: 1 }}>
              {total}%
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "clamp(0.6rem,1.5vw,0.65rem)", fontFamily: "var(--font-body)" }}>Total</div>
          </div>
        </div>

        <div style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: animated ? 1 : 0, transform: animated ? "none" : "translateX(12px)", transition: `all 0.5s ease ${i * 0.1 + 0.3}s` }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(0.76rem,2vw,0.82rem)", flex: 1, fontFamily: "var(--font-body)" }}>{d.label}</span>
              <span style={{ color: "#fff", fontSize: "clamp(0.82rem,2vw,0.88rem)", fontWeight: 700, fontFamily: "var(--font-body)" }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(0.74rem,1.8vw,0.8rem)", fontFamily: "var(--font-body)" }}>Total Budget Used</span>
        <span style={{ color: "#00D4AA", fontWeight: 700, fontSize: "clamp(0.8rem,2vw,0.88rem)", fontFamily: "var(--font-body)" }}>
          ${budget.used.toLocaleString()} / ${budget.total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
