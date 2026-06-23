import React, { useEffect, useState, useRef } from "react";
import SectionTitle from "../components/SectionTitle";
import { skillsAPI } from "../services/api";

// Static fallback
const STATIC_CATS = [
  { cat:"Frontend", color:"#00D4AA", items:[{n:"React.js",p:90},{n:"JavaScript",p:88},{n:"HTML/CSS",p:95},{n:"Tailwind CSS",p:82}] },
  { cat:"Backend",  color:"#38BDF8", items:[{n:"Node.js",p:80},{n:"Express.js",p:80},{n:"REST API",p:85},{n:"JWT Auth",p:78}] },
  { cat:"Database", color:"#818CF8", items:[{n:"MongoDB",p:85},{n:"Mongoose",p:82},{n:"Firebase",p:70}] },
  { cat:"Marketing",color:"#f472b6", items:[{n:"Digital Marketing",p:85},{n:"SEO",p:75},{n:"Social Media",p:80}] },
];
const CAT_COLORS = { Frontend:"#00D4AA", Backend:"#38BDF8", Database:"#818CF8", Marketing:"#f472b6", Other:"#f59e0b" };
const TOOLS = ["VS Code","Git & GitHub","Postman","Vercel","Netlify","Figma","npm","MongoDB Atlas","React DevTools"];

function SkillBar({ name, pct, color, delay = 0 }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setW(pct), 100 + delay);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{ background: "var(--card)", borderRadius: 12, padding: "17px 20px", border: "1px solid var(--border)", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color + "44"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.9rem" }}>{name}</span>
        <span style={{ color, fontWeight: 700, fontSize: "0.87rem" }}>{pct}%</span>
      </div>
      <div style={{ height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: w + "%", background: color, borderRadius: 4, transition: "width 1.1s ease", boxShadow: `0 0 8px ${color}66` }} />
      </div>
    </div>
  );
}

export default function Skills() {
  const [apiSkills, setApiSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillsAPI.getAll()
      .then(res => setApiSkills(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build category groups from API data or fallback to static
  const buildCats = () => {
    if (apiSkills.length === 0) return STATIC_CATS;

    // Group by category
    const grouped = {};
    apiSkills.forEach(s => {
      const cat = s.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      // Handle both {name,level} and {items:[{name,percent}]} formats
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach(item => grouped[cat].push({ n: item.name, p: item.percent }));
      } else if (s.name) {
        grouped[cat].push({ n: s.name, p: s.level || 80 });
      }
    });

    return Object.entries(grouped).map(([cat, items]) => ({
      cat, color: CAT_COLORS[cat] || "#00D4AA", items,
    }));
  };

  const cats = buildCats();

  return (
    <main style={{ minHeight: "100vh", paddingTop: 68, padding: "100px 5% 60px", background: "#050A14" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle pre="What I Know" title="Skills &" highlight="Expertise" />

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 0 3rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(0,212,170,0.1)", borderTop: "3px solid #00D4AA", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        )}

        {cats.map((c, ci) => (
          <div key={c.cat} style={{ marginBottom: "3rem" }}>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.05rem", color: c.color, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 28, height: 3, background: c.color, borderRadius: 2, display: "inline-block" }} />
              {c.cat}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem" }}>
              {c.items.map((s, i) => (
                <SkillBar key={s.n} name={s.n} pct={s.p} color={c.color} delay={ci * 100 + i * 80} />
              ))}
            </div>
          </div>
        ))}

        {/* Tools */}
        <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.05rem", color: "#38BDF8", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 28, height: 3, background: "#38BDF8", borderRadius: 2, display: "inline-block" }} />
          Tools & Technologies
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
          {TOOLS.map(t => (
            <span key={t} style={{ background: "rgba(0,212,170,0.07)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 18px", fontSize: "0.84rem", color: "var(--text)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,170,0.14)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,170,0.07)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
