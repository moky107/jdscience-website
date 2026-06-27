import React, { useState, useRef } from "react";
import { supabase } from "./supabaseClient";

const HERO_IMG = "https://cdn.abacus.ai/images/a3ac8de7-2ad2-4a64-bab2-8fbe6d17616e.png";
const CONTACT = { email:"info@jdscience.co.uk", phone:"07466142805" };
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_xxxxxxxxxxxx";
const DEFAULT_VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";

const inputStyle = { padding:"12px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:".95rem", outline:"none", width:"100%", boxSizing:"border-box" };

// ── Specifications: Subject → Exam Board → Paper → Topics ────
const subjects = [
  { icon:"⚛️", name:"Physics", bg:"linear-gradient(135deg,#1a0533,#4c1d95,#2d1060)", desc:"Master the fundamental laws of the universe — from energy and electricity to forces, waves and magnetism.",
    boards:{
      AQA:{ code:"8463", papers:{ "Paper 1":["Energy","Electricity","Particle Model of Matter","Atomic Structure"], "Paper 2":["Forces","Waves","Magnetism and Electromagnetism","Space Physics (Separate Science only)"] }},
      Edexcel:{ code:"1PH0", papers:{ "Paper 1":["Key Concepts of Physics","Motion and Forces","Conservation of Energy","Waves","Light and the Electromagnetic Spectrum","Radioactivity","Energy Resources and Energy Transfers"], "Paper 2":["Forces and their Effects","Electricity and Circuits","Magnetism and the Motor Effect","Electromagnetic Induction","Particle Model","Cosmology"] }},
      OCR:{ code:"J249 (Gateway A)", papers:{ "Paper 1":["P1 Matter","P2 Forces","P3 Electricity","P4 Magnetism and Magnetic Fields"], "Paper 2":["P5 Waves in Matter","P6 Radioactivity","P7 Energy","P8 Global Challenges"] }},
      Eduqas:{ code:"C420P", papers:{ "Component 1":["Electric Circuits","Generating Electricity","Energy and Efficiency in the Home","Domestic Electricity","Features of Waves","Distribution and Use of Energy"], "Component 2":["Describing Motion","Newton's Laws","Work and Energy","Further Motion Concepts","Stars and Planets","Types of Radiation","Nuclear Decay and Nuclear Energy","Kinetic Theory","Electromagnetism"] }}
    }},
  { icon:"⚗️", name:"Chemistry", bg:"linear-gradient(135deg,#064e3b,#065f46,#047857)", desc:"Explore matter and its transformations — atomic structure, bonding, energy changes and organic chemistry.",
    boards:{
      AQA:{ code:"8462", papers:{ "Paper 1":["Atomic Structure and the Periodic Table","Bonding, Structure and the Properties of Matter","Quantitative Chemistry","Chemical Changes","Energy Changes"], "Paper 2":["The Rate and Extent of Chemical Change","Organic Chemistry","Chemical Analysis","Chemistry of the Atmosphere","Using Resources"] }},
      Edexcel:{ code:"1CH0", papers:{ "Paper 1":["Key Concepts in Chemistry","States of Matter and Mixtures","Chemical Changes","Extracting Metals and Equilibria","Separate Chemistry 1"], "Paper 2":["Groups in the Periodic Table","Rates of Reaction and Energy Changes","Fuels and Earth Science","Separate Chemistry 2"] }},
      OCR:{ code:"J248 (Gateway A)", papers:{ "Paper 1":["C1 Particles","C2 Elements, Compounds and Mixtures","C3 Chemical Reactions"], "Paper 2":["C4 Predicting and Identifying Reactions and Products","C5 Monitoring and Controlling Chemical Reactions","C6 Global Challenges"] }},
      Eduqas:{ code:"C410P", papers:{ "Component 1":["The Nature of Substances and Chemical Reactions","Atomic Structure and the Periodic Table","Water","The Detection of Ions","Bonding, Structure and Properties"], "Component 2":["Acids, Bases and Salts","Metals and their Extraction","Chemical Reactions and Energy Changes","Crude Oil and its Products","Rates of Reaction","Equilibria","Organic Chemistry"] }}
    }},
  { icon:"🧬", name:"Biology", bg:"linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)", desc:"Understand the science of life — cells, organisation, infection, inheritance, evolution and ecology.",
    boards:{
      AQA:{ code:"8461", papers:{ "Paper 1":["Cell Biology","Organisation","Infection and Response","Bioenergetics"], "Paper 2":["Homeostasis and Response","Inheritance, Variation and Evolution","Ecology"] }},
      Edexcel:{ code:"1BI0", papers:{ "Paper 1":["Key Concepts in Biology","Cells and Control","Genetics","Natural Selection and Genetic Modification","Health, Disease and the Development of Medicines"], "Paper 2":["Plant Structures and their Functions","Animal Coordination, Control and Homeostasis","Exchange and Transport in Animals","Ecosystems and Material Cycles"] }},
      OCR:{ code:"J247 (Gateway A)", papers:{ "Paper 1":["B1 Cell Level Systems","B2 Scaling Up","B3 Organism Level Systems"], "Paper 2":["B4 Community Level Systems","B5 Genes, Inheritance and Selection","B6 Global Challenges"] }},
      Eduqas:{ code:"C400P", papers:{ "Component 1":["Cells and Movement Across Membranes","Respiration and the Cellular System","Digestion and the Circulatory System","Plants and Photosynthesis","Ecosystems and Food Production"], "Component 2":["Homeostasis","Disease, Defence and Treatment","Genetics, Variation and Evolution","Response and Regulation","Hormones and Reproduction"] }}
    }},
  { icon:"🧮", name:"Maths", bg:"linear-gradient(135deg,#1c1917,#292524,#44403c)", desc:"Build strong mathematical foundations.",
    boards:{
      AQA:{ code:"8300", papers:{ "Paper 1 (Non-Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"], "Papers 2 & 3 (Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"] }},
      Edexcel:{ code:"1MA1", papers:{ "Paper 1 (Non-Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"], "Papers 2 & 3 (Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"] }},
      OCR:{ code:"J560", papers:{ "Paper 1 (Non-Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"], "Papers 2 & 3 (Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"] }},
      Eduqas:{ code:"C300", papers:{ "Paper 1 (Non-Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"], "Paper 2 (Calculator)":["Number","Algebra","Ratio","Geometry","Probability","Statistics"] }}
    }}
];

const EXAM_BOARDS = ["AQA","Edexcel","OCR","Eduqas"];
const RES_SUBJECTS = ["Physics","Chemistry","Biology","Maths"];

const navMenu = [
  { label:"Home", id:"home" },
  { label:"11+", options:["English","Maths","Verbal Reasoning","Non-Verbal Reasoning"] },
  { label:"GCSE / IGCSE", level:"GCSE / IGCSE", options:["Physics","Chemistry","Biology","Maths"] },
  { label:"A-Level", level:"A-Level", options:["Physics","Chemistry","Biology","Maths"] },
  { label:"T-Levels", options:["Health & Science","Engineering","Digital","Education"] },
  { label:"BTEC", options:["Applied Science","Engineering","IT","Health & Social Care"] },
  { label:"Resources", resource:true, options:["Revision Notes","Past Questions","Videos"] },
  { label:"Tutors", id:"tutors" },
  { label:"Contact", id:"contact" }
];

const scrollTo = (id) => { const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:"smooth"}); };
const topicsFor = (subj, board) => { const s = subjects.find(s=>s.name===subj); if (!s) return []; const b = s.boards[board] || Object.values(s.boards)[0]; return Object.values(b.papers).flat(); };

// ── Front Page Video (admin-editable) ───────────────────────
function FrontVideo({ isAdmin }) {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO);
  const toEmbed = (url) => { const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}` : url; };

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "front_video").single();
    if (data && data.value) setVideoUrl(data.value);
  };
  React.useEffect(() => { load(); }, []);

  const changeVideo = async () => {
    const url = window.prompt("Paste a YouTube link or direct .mp4 URL:", videoUrl);
    if (!url) return;
    const finalUrl = toEmbed(url.trim());
    const { error } = await supabase.from("site_settings").upsert({ key: "front_video", value: finalUrl });
    if (error) alert("Failed to save: " + error.message);
    else setVideoUrl(finalUrl);
  };

  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl);
  return (
    <section id="intro-video" style={{padding:"70px 40px",background:"#0b0420",textAlign:"center"}}>
      <div style={{maxWidth:860,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.1)",color:"#fff",padding:"6px 16px",borderRadius:50,fontSize:".8rem",marginBottom:18,border:"1px solid rgba(255,255,255,.15)"}}>🎬 Watch Our Intro</div>
        <h2 style={{color:"#fff",fontSize:"2.2rem",fontWeight:800,marginBottom:12}}>See How <span style={{color:"#a78bfa"}}>JDScience</span> Works</h2>
        <p style={{color:"rgba(255,255,255,.7)",fontSize:"1rem",marginBottom:24,maxWidth:560,margin:"0 auto 24px"}}>A quick look at our approach to tutoring and how we help students achieve more.</p>
        {isAdmin && <button onClick={changeVideo} style={{background:"#a78bfa",color:"#1a0533",border:"none",padding:"10px 20px",borderRadius:8,fontWeight:700,cursor:"pointer",marginBottom:24,boxShadow:"0 4px 12px rgba(167,139,250,0.3)"}}>✎ Change Home Video</button>}
        <div style={{position:"relative",paddingTop:"56.25%",borderRadius:18,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,0.1)"}}>
          {isYouTube ? (
            <iframe src={videoUrl} title="JDScience intro video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} />
          ) : (
            <video src={videoUrl} controls style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} />
          )}
        </div>
      </div>
    </section>
  );
}

// ── Booking Modal ──────────────────────────────────────────
function BookingModal({ onClose, tutor }) {
  const [form, setForm] = useState({ name:"", email:"", subject:"Physics", message:"" });
  const proceedToPay = (e) => {
    e.preventDefault();
    const link = (tutor && tutor.payment_link) || STRIPE_PAYMENT_LINK;
    const url = `${link}${link.includes("?")?"&":"?"}prefilled_email=${encodeURIComponent(form.email)}&client_reference_id=${encodeURIComponent(form.name + " | " + form.subject + (tutor?(" | Tutor: "+tutor.name):""))}`;
    window.open(url, "_blank");
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,padding:36,maxWidth:480,width:"100%",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:"1.4rem",cursor:"pointer",color:"#888"}}>✕</button>
        <h2 style={{fontSize:"1.5rem",fontWeight:800,marginBottom:6}}>{tutor ? `Book ${tutor.name}` : "Book a Session"}</h2>
        <form onSubmit={proceedToPay} style={{display:"flex",flexDirection:"column",gap:14}}>
          <input required name="name" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inputStyle} />
          <input required type="email" name="email" placeholder="Your email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inputStyle} />
          <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} style={inputStyle}>
            {subjects.map(s => <option key={s.name}>{s.name}</option>)}
          </select>
          <textarea placeholder="Your request..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={3} style={inputStyle} />
          <button type="submit" style={{background:"#635bff",color:"#fff",border:"none",padding:"14px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>💳 Pay with Stripe</button>
        </form>
      </div>
    </div>
  );
}

// ── Navbar ──────────────────────────────────────────────────
function Navbar({ onSearch, onBook, onOpenResource, onOpenSubject, isAdmin }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const handleAuth = async () => {
    if (isAdmin) { await supabase.auth.signOut(); return; }
    const email = window.prompt("Admin email:"); if (!email) return;
    const password = window.prompt("Admin password:"); if (!password) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login: " + error.message);
  };
  return (
    <nav style={{background:"#fff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,.08)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 40px",gap:12}}>
        <div onClick={() => { scrollTo("home"); }} style={{display:"flex",alignItems:"center",gap:10,fontSize:"1.4rem",fontWeight:800,color:"#7c3aed",cursor:"pointer"}}>
          <div style={{width:38,height:38,background:"linear-gradient(135deg,#7c3aed,#06b6d4)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:".9rem"}}>JD</div>
          JDScience
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={handleAuth} style={{background: isAdmin ? "#16a34a" : "#eee", color: isAdmin ? "#fff" : "#555", border:"none", padding:"8px 12px", borderRadius:6, cursor:"pointer",fontSize:".8rem"}}>{isAdmin ? "Logout" : "Admin"}</button>
          <button onClick={onBook} style={{background:"#06b6d4",color:"#fff",border:"none",padding:"10px 18px",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:".85rem"}}>Book Session</button>
        </div>
      </div>
      <div style={{background:"#2dd4bf",display:"flex",justifyContent:"center"}}>
        {navMenu.map((item,i) => (
          <div key={item.label} onMouseEnter={() => setOpen(item.options?i:null)} onMouseLeave={() => setOpen(null)} style={{position:"relative"}}>
            <button onClick={() => item.id && scrollTo(item.id)} style={{background:"transparent",border:"none",padding:"14px 22px",fontWeight:700,fontSize:".85rem",cursor:"pointer",color:"#1f2937"}}>{item.label.toUpperCase()}{item.options ? " ▾":" "}</button>
            {item.options && open===i && (
              <div style={{position:"absolute",top:"100%",left:0,background:"#1f2937",minWidth:200,boxShadow:"0 10px 30px rgba(0,0,0,.25)",zIndex:200}}>
                {item.options.map(opt => (
                  <a key={opt} onClick={() => item.resource ? onOpenResource(opt) : item.level ? onOpenSubject(item.level, opt) : scrollTo("resources")} style={{display:"block",padding:"12px 20px",color:"#e5e7eb",cursor:"pointer",fontSize:".88rem"}}>{opt}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ── Resource Browser ───────────────────────────────────────── (Simplified to focus on functionality)
function ResourceBrowser({ type, onClose, isAdmin }) {
  const [subject, setSubject] = useState(null);
  const [board, setBoard] = useState(null);
  const [topic, setTopic] = useState(null);
  const [files, setFiles] = useState([]);
  const folder = type === "Revision Notes" ? `notes/${subject}/${board}/${topic}` : `past/${subject}/${board}`;
  
  const loadFiles = async () => {
    const { data } = await supabase.storage.from("resources").list(folder);
    if(data) setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder").map(f => ({ name:f.name, url: supabase.storage.from("resources").getPublicUrl(`${folder}/${f.name}`).data.publicUrl })));
  };
  React.useEffect(() => { if(subject && board && (type!=="Revision Notes" || topic)) loadFiles(); }, [folder, subject, board, topic]);

  return (
    <div style={{padding:40, background:"#f9fafb", minHeight:"70vh"}}>
      <div style={{maxWidth:1000, margin:"0 auto"}}>
        <button onClick={onClose} style={{marginBottom:20, cursor:"pointer"}}>← Back</button>
        <h2>{type}</h2>
        <div style={{display:"flex", gap:10, marginBottom:20}}>
          {RES_SUBJECTS.map(s => <button key={s} onClick={() => setSubject(s)} style={{padding:10, background:subject===s?"#7c3aed":"#fff", color:subject===s?"#fff":"#333"}}>{s}</button>)}
        </div>
        {subject && <div style={{display:"flex", gap:10, marginBottom:20}}>
          {EXAM_BOARDS.map(b => <button key={b} onClick={() => setBoard(b)} style={{padding:10, background:board===b?"#7c3aed":"#fff", color:board===b?"#fff":"#333"}}>{b}</button>)}
        </div>}
        {files.map(f => <div key={f.name} style={{padding:10, background:"#fff", marginBottom:5, border:"1px solid #eee", display:"flex", justifyContent:"space-between"}}>
          <span>{f.name}</span>
          <a href={f.url} target="_blank">View</a>
        </div>)}
      </div>
    </div>
  );
}

// ── Homepage Sections ───────────────────────────────────────
function Hero({ onBook }) {
  return (
    <section id="home" style={{background:"linear-gradient(135deg,#1a0533 0%,#2d1060 50%,#0f2557 100%)",padding:"60px 40px", color:"#fff", textAlign:"center"}}>
      <h1 style={{fontSize:"3.5rem", fontWeight:900, marginBottom:20}}>JD Education</h1>
      <p style={{fontSize:"1.2rem", maxWidth:600, margin:"0 auto 30px"}}>Expert tutoring for 11+, GCSE, A-Level and beyond. Diverse perspectives, professional results.</p>
      <div style={{display:"flex", justifyContent:"center", gap:15}}>
        <button onClick={() => scrollTo("subjects")} style={{padding:"15px 30px", borderRadius:8, border:"1px solid #fff", background:"transparent", color:"#fff", fontWeight:700, cursor:"pointer"}}>Explore Subjects</button>
        <button onClick={onBook} style={{padding:"15px 30px", borderRadius:8, border:"none", background:"#fff", color:"#7c3aed", fontWeight:700, cursor:"pointer"}}>Book a Free Session</button>
      </div>
      <div style={{marginTop:50, maxWidth:900, margin:"50px auto 0", borderRadius:20, overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,0.3)"}}>
        <img src={HERO_IMG} style={{width:"100%", display:"block"}} alt="Students" />
      </div>
    </section>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [resourceView, setResourceView] = useState(null);
  const [bookingTutor, setBookingTutor] = useState(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  const isAdmin = !!session;

  return (
    <div style={{fontFamily:"'Inter', sans-serif"}}>
      <Navbar onBook={() => setBookingTutor(null)} onOpenResource={setResourceView} isAdmin={isAdmin} />
      {resourceView ? (
        <ResourceBrowser type={resourceView} onClose={() => setResourceView(null)} isAdmin={isAdmin} />
      ) : (
        <>
          <Hero onBook={() => setBookingTutor(null)} />
          <FrontVideo isAdmin={isAdmin} />
          <section id="subjects" style={{padding:80, textAlign:"center"}}>
            <h2>Our Subjects</h2>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:30, maxWidth:1200, margin:"40px auto"}}>
              {subjects.map(s => (
                <div key={s.name} style={{padding:40, background:s.bg, borderRadius:20, color:"#fff"}}>
                  <div style={{fontSize:"3rem"}}>{s.icon}</div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      {bookingTutor !== undefined && <BookingModal onClose={() => setBookingTutor(undefined)} />}
    </div>
  );
}

export default App;
