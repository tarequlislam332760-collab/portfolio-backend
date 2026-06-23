import React, { useEffect, useRef, useState } from "react";
import { analyticsAPI } from "../../services/api";

const STATIC = [
  { m: "Jan", s: 45 }, { m: "Feb", s: 52 }, { m: "Mar", s: 48 },
  { m: "Apr", s: 61 }, { m: "May", s: 67 }, { m: "Jun", s: 74 },
];

export default function SEOChart() {
  const ref = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [data, setData]         = useState(STATIC);
  const [ytd, setYtd]           = useState("+64%");

  useEffect(() => {
    analyticsAPI.getStats()
      .then(res => {
        const trend = res?.data?.seoTrend;
        if (trend && trend.length > 0) {
          setData(trend);
          // Calculate YTD change: first vs last
          const first = trend[0]?.s || 1;
          const last  = trend[trend.length - 1]?.s || first;
          const pct   = Math.round(((last - first) / first) * 100);
          setYtd((pct >= 0 ? "+" : "") + pct + "%");
        }
      })
      .catch(() => {}); // silently use static fallback
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setAnimated(true);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const MAX = Math.max(...data.map(d => d.s), 1);

  const getColor = (s) => {
    if (s >= 70) return "linear-gradient(180deg,#00D4AA,#38BDF8)";
    if (s >= 50) return "linear-gradient(180deg,#38BDF8,#818CF8)";
    return "linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))";
  };

  return (
    <div ref={ref} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "clamp(16px,3vw,28px)", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(14px,3vw,24px)", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ color: "#fff", fontSize: "clamp(0.85rem,2.2vw,0.95rem)", fontWeight: 700, margin: 0, fontFamily: "var(--font-head)" }}>
          SEO Score Trend
        </h3>
        <span style={{ background: "rgba(0,212,170,0.1)", color: "#00D4AA", padding: "3px 11px", borderRadius: 99, fontSize: "clamp(0.68rem,1.6vw,0.74rem)", fontWeight: 700, fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
          {ytd} YTD
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(5px,1.5vw,10px)", height: "clamp(100px,22vw,130px)", marginBottom: 12 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end", minWidth: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(0.6rem,1.5vw,0.68rem)", fontFamily: "var(--font-body)" }}>{d.s}</span>
            <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: "6px 6px 0 0", height: "100%", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
              <div style={{
                width: "100%",
                height: animated ? (d.s / MAX * 100) + "%" : "0%",
                background: getColor(d.s),
                borderRadius: "5px 5px 0 0",
                transition: `height 0.9s ease ${i * 0.1}s`,
                minHeight: animated ? 4 : 0,
                cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.3)"}
                onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "clamp(0.6rem,1.5vw,0.68rem)", fontFamily: "var(--font-body)" }}>{d.m}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "clamp(8px,2vw,16px)", marginTop: 8, flexWrap: "wrap" }}>
        {[["#00D4AA","High (70+)"],["#38BDF8","Medium (50-70)"],["rgba(255,255,255,0.2)","Low (<50)"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "clamp(0.62rem,1.5vw,0.68rem)", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
