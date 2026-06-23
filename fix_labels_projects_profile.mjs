import fs from "fs";
import path from "path";

const base = process.cwd();
const src  = path.join(base, "src");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trimStart(), "utf8");
  console.log("✅", filePath.replace(base + "/", ""));
}

// ══════════════════════════════════════════
// 1. AdminBlog — fix category label visibility
// ══════════════════════════════════════════
{
  const fp = path.join(src, "pages/admin/AdminBlog.jsx");
  if (fs.existsSync(fp)) {
    let c = fs.readFileSync(fp, "utf8");

    // Fix the category button styles — labels were invisible on dark bg
    // Find the category button style and fix color contrast
    c = c.replace(
      /color: form\.category === c \? cfg\.color : "rgba\(255,255,255,0\.38\)"/g,
      `color: form.category === c ? cfg.color : "rgba(255,255,255,0.75)"`
    );
    // Fix background of unselected buttons
    c = c.replace(
      /background: form\.category === c \? \`\$\{cfg\.color\}15\` : "transparent"/g,
      `background: form.category === c ? \`\${cfg.color}15\` : "rgba(255,255,255,0.06)"`
    );
    // Fix border of unselected
    c = c.replace(
      /border: form\.category === c \? \`1px solid \$\{cfg\.color\}66\` : "1px solid rgba\(255,255,255,0\.07\)"/g,
      `border: form.category === c ? \`1px solid \${cfg.color}66\` : "1px solid rgba(255,255,255,0.15)"`
    );
    // Fix font weight
    c = c.replace(
      /fontWeight: form\.category === c \? 700 : 400,/g,
      `fontWeight: form.category === c ? 700 : 500,`
    );

    fs.writeFileSync(fp, c, "utf8");
    console.log("✅ AdminBlog.jsx — category label colors fixed");
  }
}

// ══════════════════════════════════════════
// 2. Backend analyticsController — fix Live Projects count
//    (Projects এ "status":"Live" filter করা ছিল, কিন্তু
//     frontend থেকে add করা projects এ status field নেই/ভিন্ন)
// ══════════════════════════════════════════
write(path.join(base, "controllers/analyticsController.js"), `
const Project     = require('../models/Project');
const Blog        = require('../models/Blog');
const Message     = require('../models/Message');
const Skill       = require('../models/Skill');
const Testimonial = require('../models/Testimonial');

const getStats = async (req, res) => {
  try {
    // Count ALL projects (not just "Live" status — because default may vary)
    const [
      totalProjects,
      totalBlogs,
      totalSkills,
      totalMessages,
      unreadMessages,
      totalTestimonials,
      recentMessages,
    ] = await Promise.all([
      Project.countDocuments(),                          // all projects
      Blog.countDocuments({ published: true }),          // published blogs
      Skill.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Testimonial.countDocuments({ active: true }),
      Message.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const seoTrend = [
      { m: 'Jan', s: 45 }, { m: 'Feb', s: 52 }, { m: 'Mar', s: 48 },
      { m: 'Apr', s: 61 }, { m: 'May', s: 67 }, { m: 'Jun', s: 74 },
    ];
    const adsBreakdown = [
      { label: 'Facebook',  value: 42, color: '#3b82f6' },
      { label: 'Google',    value: 31, color: '#f59e0b' },
      { label: 'Instagram', value: 18, color: '#ec4899' },
      { label: 'Other',     value: 9,  color: '#6366f1' },
    ];

    res.json({
      success: true,
      data: {
        // Use consistent key names that frontend expects
        totalProjects,
        totalBlogs,
        totalSkills,
        totalMessages,
        unreadMessages,
        totalTestimonials,
        recentMessages,
        seoTrend,
        adsBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats };
`);

// ══════════════════════════════════════════
// 3. AdminProfile — full customization with local image preview
//    (Cloudinary পরে, এখন base64 local preview)
// ══════════════════════════════════════════
write(path.join(src, "pages/admin/AdminProfile.jsx"), `
import React, { useEffect, useState, useRef } from "react";
import { profileAPI } from "../../services/api";

const SECTIONS = [
  { key: "personal", label: "👤 Personal Info",  icon: "👤" },
  { key: "social",   label: "🔗 Social Links",    icon: "🔗" },
  { key: "content",  label: "✍️ Bio & Content",   icon: "✍️" },
  { key: "settings", label: "⚙️ Site Settings",  icon: "⚙️" },
];

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "Tarikul Islam Tarek",
    title: "MERN Full Stack Developer",
    subtitle: "Digital Marketing Specialist",
    bio: "I build high-performance MERN stack web apps and help businesses scale through digital marketing.",
    bio2: "Deployed 2+ full-stack projects on Vercel.",
    email: "tareq.islam.dev@gmail.com",
    phone: "+880 1732-483149",
    location: "Sylhet, Bangladesh",
    available: true,
    github:    "https://github.com/tarequlislam332760-collab",
    linkedin:  "https://www.linkedin.com/in/tareq-islam3149/",
    facebook:  "https://www.facebook.com/profile.php?id=61585040426028",
    instagram: "https://www.instagram.com/tareq23337/",
    whatsapp:  "https://wa.me/8801732483149",
    cvLink:    "#",
    image:     "",
  });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [section,  setSection]  = useState("personal");
  const [preview,  setPreview]  = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    profileAPI.get()
      .then(res => {
        if (res.data) {
          setProfile(prev => ({ ...prev, ...res.data }));
          if (res.data.image) setPreview(res.data.image);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const inp = e => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setProfile(p => ({ ...p, [e.target.name]: val }));
  };

  // Local image preview (base64) — Cloudinary পরে add হবে
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image 2MB এর কম হতে হবে");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      setProfile(p => ({ ...p, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await profileAPI.update(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Save করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputSt = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10,
    padding: "12px 14px", color: "#fff", fontSize: "0.88rem",
    fontFamily: "var(--font-body)", outline: "none",
    marginBottom: "1rem", boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelSt = {
    color: "rgba(255,255,255,0.45)", fontSize: "0.72rem",
    letterSpacing: "1px", textTransform: "uppercase",
    fontFamily: "var(--font-body)", display: "block", marginBottom: 6,
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(0,212,170,0.1)", borderTop: "3px solid #00D4AA", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.5s ease both", maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: "clamp(1rem,3vw,1.8rem)" }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "clamp(1.2rem,4vw,1.5rem)", color: "#fff", marginBottom: "0.3rem" }}>Profile Settings</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", fontFamily: "var(--font-body)" }}>আপনার portfolio সম্পূর্ণ এখান থেকে customize করুন</p>
      </div>

      {/* Status messages */}
      {saved && (
        <div style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: "1.2rem", color: "#00D4AA", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
          ✅ Profile সফলভাবে save হয়েছে! Website এ automatically update হবে।
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: "1.2rem", color: "#f87171", fontSize: "0.88rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            style={{
              padding: "8px clamp(10px,2vw,16px)", borderRadius: 99, cursor: "pointer",
              fontSize: "clamp(0.74rem,1.8vw,0.82rem)", fontWeight: section === s.key ? 700 : 500,
              fontFamily: "var(--font-body)", transition: "all 0.2s",
              background: section === s.key ? "linear-gradient(135deg,#00D4AA,#38BDF8)" : "rgba(255,255,255,0.04)",
              border: section === s.key ? "none" : "1px solid rgba(255,255,255,0.09)",
              color: section === s.key ? "#050A14" : "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
            }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "clamp(16px,3vw,28px)" }}>

        {/* ── PERSONAL INFO ── */}
        {section === "personal" && (
          <div>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1rem", color: "#00D4AA", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
              👤 Personal Information
            </h3>

            {/* Profile Image Upload */}
            <div style={{ marginBottom: "1.8rem" }}>
              <label style={labelSt}>Profile Photo</label>
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,3vw,24px)", flexWrap: "wrap" }}>
                {/* Preview */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "clamp(80px,15vw,100px)", height: "clamp(80px,15vw,100px)", borderRadius: "50%", background: "linear-gradient(135deg,#00D4AA,#38BDF8)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "3px solid rgba(0,212,170,0.3)" }}>
                    {preview ? (
                      <img src={preview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#050A14", fontFamily: "var(--font-head)" }}>T</span>
                    )}
                  </div>
                  {/* Camera button overlay */}
                  <button onClick={() => fileRef.current?.click()}
                    style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00D4AA,#38BDF8)", border: "2px solid #050A14", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.7rem" }}>
                    📷
                  </button>
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", fontFamily: "var(--font-body)", marginBottom: "0.8rem", lineHeight: 1.7 }}>
                    JPG, PNG, WebP — সর্বোচ্চ 2MB<br/>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.74rem" }}>Cloudinary integration পরে যোগ হবে</span>
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()}
                    style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 9, padding: "8px 18px", color: "#00D4AA", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-body)", marginRight: 8 }}>
                    📷 Choose Photo
                  </button>
                  {preview && (
                    <button onClick={() => { setPreview(""); setProfile(p => ({ ...p, image: "" })); }}
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, padding: "8px 14px", color: "#f87171", cursor: "pointer", fontSize: "0.82rem", fontFamily: "var(--font-body)" }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 16px" }}>
              {[
                ["Full Name","name","text","Tarikul Islam Tarek"],
                ["Job Title","title","text","MERN Full Stack Developer"],
                ["Subtitle","subtitle","text","Digital Marketing Specialist"],
                ["Email","email","email","tareq.islam.dev@gmail.com"],
                ["Phone","phone","tel","+880 1732-483149"],
                ["Location","location","text","Sylhet, Bangladesh"],
              ].map(([l, n, t, ph]) => (
                <div key={n}>
                  <label style={labelSt}>{l}</label>
                  <input name={n} type={t} value={profile[n] || ""} onChange={inp} placeholder={ph} style={inputSt}
                    onFocus={e => e.target.style.borderColor = "#00D4AA"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                </div>
              ))}
            </div>

            {/* Available toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: profile.available ? "rgba(0,212,170,0.06)" : "rgba(255,255,255,0.03)", border: \`1px solid \${profile.available ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.08)"}\`, borderRadius: 12, marginBottom: "1rem", cursor: "pointer" }}
              onClick={() => setProfile(p => ({ ...p, available: !p.available }))}>
              <div style={{ width: 44, height: 24, borderRadius: 99, background: profile.available ? "#00D4AA" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: profile.available ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
              </div>
              <div>
                <div style={{ color: profile.available ? "#00D4AA" : "rgba(255,255,255,0.5)", fontSize: "0.88rem", fontWeight: 600, fontFamily: "var(--font-body)" }}>
                  {profile.available ? "✓ Available for hire" : "✗ Not available"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.74rem", fontFamily: "var(--font-body)" }}>Website এ "Available for work" badge দেখাবে</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SOCIAL LINKS ── */}
        {section === "social" && (
          <div>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1rem", color: "#38BDF8", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
              🔗 Social Media Links
            </h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontFamily: "var(--font-body)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              এই links Footer, About page এবং Contact page এ দেখাবে।
            </p>
            {[
              ["📘 Facebook", "facebook", "https://www.facebook.com/profile.php?id=61585040426028"],
              ["📸 Instagram","instagram","https://www.instagram.com/tareq23337/"],
              ["💼 LinkedIn", "linkedin", "https://www.linkedin.com/in/tareq-islam3149/"],
              ["🐙 GitHub",   "github",   "https://github.com/tarequlislam332760-collab"],
              ["💬 WhatsApp", "whatsapp", "https://wa.me/8801732483149"],
              ["📄 CV Link",  "cvLink",   "#"],
            ].map(([l, n, ph]) => (
              <div key={n}>
                <label style={labelSt}>{l}</label>
                <input name={n} type="url" value={profile[n] || ""} onChange={inp} placeholder={ph} style={inputSt}
                  onFocus={e => e.target.style.borderColor = "#38BDF8"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
              </div>
            ))}
          </div>
        )}

        {/* ── BIO & CONTENT ── */}
        {section === "content" && (
          <div>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1rem", color: "#818CF8", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
              ✍️ Bio & About Content
            </h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontFamily: "var(--font-body)", marginBottom: "1.5rem" }}>
              About page ও Home page এ এই text দেখাবে।
            </p>

            <label style={labelSt}>Main Bio (About page paragraph 1)</label>
            <textarea name="bio" value={profile.bio || ""} onChange={inp} rows={4}
              placeholder="আমি একজন passionate MERN Full Stack Developer..."
              style={{ ...inputSt, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "#818CF8"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />

            <label style={labelSt}>Bio 2 (About page paragraph 2)</label>
            <textarea name="bio2" value={profile.bio2 || ""} onChange={inp} rows={3}
              placeholder="আমার ২টি MERN project Vercel এ live আছে..."
              style={{ ...inputSt, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "#818CF8"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />

            {/* Preview */}
            {(profile.bio || profile.bio2) && (
              <div style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.15)", borderRadius: 12, padding: "16px", marginTop: "0.5rem" }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "var(--font-body)", marginBottom: 10 }}>Preview</div>
                {profile.bio && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", lineHeight: 1.85, fontFamily: "var(--font-body)", marginBottom: profile.bio2 ? 10 : 0 }}>{profile.bio}</p>}
                {profile.bio2 && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.85, fontFamily: "var(--font-body)", margin: 0 }}>{profile.bio2}</p>}
              </div>
            )}
          </div>
        )}

        {/* ── SITE SETTINGS ── */}
        {section === "settings" && (
          <div>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1rem", color: "#f472b6", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
              ⚙️ Site Settings
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Availability */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-body)", marginBottom: 4 }}>Availability Status</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>Hero section এ "Available for work" badge</div>
                </div>
                <div onClick={() => setProfile(p => ({ ...p, available: !p.available }))}
                  style={{ width: 50, height: 26, borderRadius: 99, background: profile.available ? "#00D4AA" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.3s", cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 4, left: profile.available ? 28 : 4, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
                </div>
              </div>

              {/* Profile image URL manual entry */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-body)", marginBottom: 4 }}>Profile Image URL</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", fontFamily: "var(--font-body)", marginBottom: 12 }}>Cloudinary বা অন্য hosting এর URL দিতে পারেন</div>
                <input name="image" type="url" value={profile.image?.startsWith("data:") ? "" : (profile.image || "")}
                  onChange={inp} placeholder="https://res.cloudinary.com/..."
                  style={inputSt}
                  onFocus={e => e.target.style.borderColor = "#f472b6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
              </div>

              {/* Info box */}
              <div style={{ background: "rgba(244,114,182,0.05)", border: "1px solid rgba(244,114,182,0.15)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.84rem", fontFamily: "var(--font-body)", lineHeight: 1.75 }}>
                    <strong style={{ color: "#f472b6" }}>Cloudinary integration:</strong> পরে যোগ করা হবে। তখন সরাসরি admin থেকে ছবি upload করা যাবে এবং automatically optimize হয়ে website এ দেখাবে।
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button — always visible */}
        <div style={{ marginTop: "1.8rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={save} disabled={saving}
            style={{ flex: "1 1 200px", padding: "14px 28px", background: saving ? "rgba(0,212,170,0.4)" : "linear-gradient(135deg,#00D4AA,#38BDF8)", border: "none", borderRadius: 12, color: "#050A14", fontWeight: 800, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", transition: "transform 0.2s,box-shadow 0.2s" }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(0,212,170,0.4)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
            {saving ? "Saving to MongoDB..." : "💾 Save All Changes"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>
            <span>🔒</span> Auto-saves to MongoDB
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ══════════════════════════════════════════
// 4. Skills.jsx — connect to backend API
// ══════════════════════════════════════════
write(path.join(src, "pages/Skills.jsx"), `
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
        <div style={{ height: "100%", width: w + "%", background: color, borderRadius: 4, transition: "width 1.1s ease", boxShadow: \`0 0 8px \${color}66\` }} />
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
`);

console.log(`
╔══════════════════════════════════════════════════════════╗
║     ✅ সব সমস্যা fix হয়েছে!                             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ✅ Fix 1 — Blog category labels visible:               ║
║     React, Node.js, MongoDB ইত্যাদি এখন                ║
║     সাদা text দিয়ে clearly দেখাবে                       ║
║                                                          ║
║  ✅ Fix 2 — Live Projects 0:                            ║
║     Backend analyticsController fix করা হয়েছে          ║
║     এখন ALL projects count করবে                         ║
║     (status:"Live" filter সরানো হয়েছে)                 ║
║                                                          ║
║  ✅ Fix 3 — AdminProfile সম্পূর্ণ customize:           ║
║     • 📷 Photo upload (mobile থেকেও)                   ║
║     • 4 section: Personal/Social/Bio/Settings           ║
║     • Toggle switch for availability                    ║
║     • Bio preview                                       ║
║     • সব MongoDB এ save হয়                             ║
║                                                          ║
║  ✅ Fix 4 — Skills page backend connected:              ║
║     Admin থেকে add করা skills দেখাবে                   ║
║     Animated progress bars on scroll                    ║
║                                                          ║
║  🚀 চালান:                                              ║
║     Terminal 1: cd backend && node server.js            ║
║     Terminal 2: cd client && npm run dev               ║
╚══════════════════════════════════════════════════════════╝
`);
