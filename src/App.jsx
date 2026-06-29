function Hero({ onBook }) {
  const isMobile = useIsMobile();
  return (
    <section id="home" style={{ background: "linear-gradient(135deg,#004d40,#009688)", color: "#fff", padding: isMobile ? "32px 16px" : "48px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 420px", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,.12)", padding: "6px 12px", borderRadius: 20, marginBottom: 12, fontSize: 13 }}>🏆 Expert Science &amp; Maths Tutoring</div>
          <h1 style={{ fontSize: isMobile ? 26 : 34, margin: "12px 0", lineHeight: 1.1 }}>Learn <span style={{ color: "#80cbc4" }}>Smarter</span>. Revise <span style={{ color: "#2dd4bf" }}>Better</span>. Achieve <span style={{ color: "#fbbf24" }}>More</span>.</h1>
          <p style={{ color: "rgba(255,255,255,.9)", maxWidth: 600 }}>Personalised tutoring and professional resources organised by subject, exam board and topic.</p>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,.15)", color: "#fff", cursor: "pointer" }}>Explore Subjects</button>
            <button onClick={onBook} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#fff", color: "#00796b", cursor: "pointer", fontWeight: 700 }}>Book a Session</button>
          </div>
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.4)", order: isMobile ? -1 : 0 }}>
          <img src={HERO_IMG} alt="hero" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
        </div>
      </div>
    </section>
  );
}
