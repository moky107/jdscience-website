const subjects = [
  {
    icon: "⚛️", name: "Physics",
    bg: "linear-gradient(135deg,#1a0533,#4c1d95,#2d1060)",
    desc: "Master the fundamental laws of the universe. From mechanics to quantum physics, build a strong conceptual and exam-ready foundation.",
    topics: ["Mechanics","Waves","Electricity","Magnetism","Quantum Physics","Nuclear Physics"]
  },
  {
    icon: "⚗️", name: "Chemistry",
    bg: "linear-gradient(135deg,#064e3b,#065f46,#047857)",
    desc: "Explore the science of matter and its transformations. From organic reactions to atomic structure, master every topic with confidence.",
    topics: ["Organic Chemistry","Atomic Structure","Bonding","Energetics","Kinetics","Electrochemistry"]
  },
  {
    icon: "🧬", name: "Biology",
    bg: "linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)",
    desc: "Understand the science of life. From cells and genetics to ecology and evolution, develop a deep understanding of living systems.",
    topics: ["Cell Biology","Genetics","Ecology","Evolution","Physiology","Microbiology"]
  },
  {
    icon: "🧮", name: "Maths",
    bg: "linear-gradient(135deg,#1c1917,#292524,#44403c)",
    desc: "Build strong mathematical foundations. From algebra and geometry to calculus and statistics, develop fluency and exam technique.",
    topics: ["Algebra","Calculus","Statistics","Geometry","Trigonometry","Mechanics"]
  },
  {
    icon: "📖", name: "A-Level",
    bg: "linear-gradient(135deg,#312e81,#4338ca,#6366f1)",
    desc: "In-depth A-Level tutoring for top grades in Science and Maths. Expert support for AS and A2 content across all major exam boards.",
    topics: ["AS Level","A2 Level","AQA","Edexcel","OCR","WJEC"]
  },
  {
    icon: "🎓", name: "T-Levels",
    bg: "linear-gradient(135deg,#78350f,#92400e,#b45309)",
    desc: "Expert support for T-Level Science qualifications. Combining classroom theory with practical application for a complete learning experience.",
    topics: ["Health Science","Engineering","Digital","Education","Construction","Science"]
  }
];

const whyCards = [
  { icon: "🎯", title: "Personalised Learning", desc: "Every session is tailored to the individual student's pace, gaps, and exam board requirements." },
  { icon: "🏆", title: "Experienced Tutor", desc: "Qualified science educator with 5000+ hours of tutoring experience across GCSE, A-Level, and T-Levels." },
  { icon: "📈", title: "Proven Results", desc: "98% student satisfaction rate with consistently improved grades and boosted confidence." },
  { icon: "💻", title: "Flexible Sessions", desc: "Online and in-person options available to suit your schedule and learning preferences." },
  { icon: "📋", title: "All Exam Boards", desc: "Covering AQA, Edexcel, OCR, WJEC, and iGCSE — no matter your school's curriculum." },
  { icon: "🤝", title: "Free Consultation", desc: "Start with a free no-obligation consultation to discuss your goals and find the right plan." }
];

function Navbar({ onSearch }) {
  const [query, setQuery] = React.useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'#fff',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 6px rgba(0,0,0,.08)',flexWrap:'wrap',gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:10,fontSize:'1.4rem',fontWeight:800,color:'#7c3aed'}}>
        <div style={{width:38,height:38,background:'linear-gradient(135deg,#7c3aed,#06b6d4)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:'.9rem'}}>JD</div>
        JDScience
      </div>
      <ul style={{display:'flex',gap:28,listStyle:'none',margin:0,padding:0}}>
        {['Home','Subjects','About','Testimonials','Contact'].map(l => (
          <li key={l}><a href="#" style={{color:'#444',fontWeight:500,fontSize:'.95rem',textDecoration:'none'}}>{l}</a></li>
        ))}
      </ul>
      <form onSubmit={handleSearch} style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{display:'flex',alignItems:'center',background:'#f3f4f6',borderRadius:8,padding:'8px 14px',gap:8,border:'1px solid #e5e7eb'}}>
          <span style={{fontSize:'1rem'}}>🔍</span>
          <input
            type="text"
            placeholder="Search subjects, topics..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{border:'none',background:'transparent',outline:'none',fontSize:'.9rem',width:180,color:'#333'}}
          />
        </div>
        <button type="submit" style={{background:'#7c3aed',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,fontWeight:600,cursor:'pointer',fontSize:'.85rem'}}>
          Search
        </button>
      </form>
      <button style={{background:'#7c3aed',color:'#fff',border:'none',padding:'10px 22px',borderRadius:8,fontWeight:600,cursor:'pointer',fontSize:'.9rem'}}>
        Book a Session
      </button>
    </nav>
  );
}

function SearchResults({ query, onClose }) {
  const results = subjects.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.desc.toLowerCase().includes(query.toLowerCase()) ||
    s.topics.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{background:'#f9fafb',padding:'40px',borderBottom:'1px solid #e5e7eb'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div>
            <h2 style={{fontSize:'1.5rem',fontWeight:800}}>Search Results for "<span style={{color:'#7c3aed'}}>{query}</span>"</h2>
            <p style={{color:'#666',fontSize:'.9rem',marginTop:4}}>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={onClose} style={{background:'#fff',border:'1px solid #e5e7eb',padding:'8px 16px',borderRadius:8,cursor:'pointer',color:'#666',fontWeight:600}}>✕ Clear</button>
        </div>
        {results.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'#888'}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🔍</div>
            <p style={{fontSize:'1.1rem',fontWeight:600}}>No results found for "{query}"</p>
            <p style={{fontSize:'.9rem',marginTop:8}}>Try searching for Physics, Chemistry, Biology, Maths, A-Level or T-Levels</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20}}>
            {results.map(s => (
              <div key={s.name} style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e5e7eb',cursor:'pointer'}}>
                <div style={{height:80,background:s.bg,display:'flex',alignItems:'center',padding:'0 20px',gap:12}}>
                  <span style={{fontSize:'1.8rem'}}>{s.icon}</span>
                  <span style={{color:'#fff',fontWeight:700,fontSize:'1.1rem'}}>{s.name}</span>
                </div>
                <div style={{padding:'16px 20px'}}>
                  <p style={{color:'#555',fontSize:'.9rem',lineHeight:1.6,marginBottom:12}}>{s.desc}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {s.topics.map(t => (
                      <span key={t} style={{background:'#f3e8ff',color:'#7c3aed',fontSize:'.78rem',padding:'3px 10px',borderRadius:20,fontWeight:500}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{minHeight:'92vh',background:'linear-gradient(135deg,#1a0533 0%,#2d1060 50%,#0f2557 100%)',display:'flex',alignItems:'center',padding:'60px 40px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',borderRadius:'50%',opacity:.35,width:300,height:300,background:'radial-gradient(circle,#a855f7,transparent)',top:'-60px',right:'10%'}} />
      <div style={{position:'absolute',borderRadius:'50%',opacity:.35,width:200,height:200,background:'radial-gradient(circle,#06b6d4,transparent)',bottom:'10%',right:'25%'}} />
      <div style={{position:'absolute',borderRadius:'50%',opacity:.35,width:160,height:160,background:'radial-gradient(circle,#f59e0b,transparent)',bottom:'20%',right:'5%'}} />
      <div style={{position:'absolute',borderRadius:'50%',opacity:.35,width:120,height:120,background:'radial-gradient(circle,#ec4899,transparent)',top:'30%',right:'40%'}} />
      <div style={{maxWidth:620,position:'relative',zIndex:2}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.1)',color:'#fff',padding:'8px 16px',borderRadius:50,fontSize:'.85rem',marginBottom:28,border:'1px solid rgba(255,255,255,.15)'}}>
          🏆 Expert Science & Maths Tutoring
        </div>
        <h1 style={{fontSize:'3.6rem',fontWeight:900,color:'#fff',lineHeight:1.1,marginBottom:24}}>
          Learn <span style={{color:'#a78bfa'}}>Smarter</span>.<br/>
          Revise <span style={{color:'#2dd4bf'}}>Better</span>.<br/>
          Achieve <span style={{color:'#fbbf24'}}>More</span>.
        </h1>
        <p style={{color:'rgba(255,255,255,.8)',fontSize:'1.1rem',lineHeight:1.7,marginBottom:36}}>
          Personalised tutoring in Physics, Chemistry, Biology, and Maths.<br/>
          Tailored sessions designed to boost confidence, understanding, and grades.
        </p>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:40}}>
          <button style={{background:'#7c3aed',color:'#fff',padding:'14px 28px',borderRadius:10,border:'none',fontWeight:700,fontSize:'1rem',cursor:'pointer'}}>
            Book a Free Consultation →
          </button>
          <button style={{background:'rgba(255,255,255,.15)',color:'#fff',padding:'14px 28px',borderRadius:10,border:'1px solid rgba(255,255,255,.25)',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>
            Explore Subjects
          </button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <span style={{color:'rgba(255,255,255,.6)',fontSize:'.85rem'}}>Exam Boards Covered:</span>
          {['AQA','Edexcel','OCR','WJEC','iGCSE'].map(b => (
            <span key={b} style={{color:'rgba(255,255,255,.85)',fontSize:'.9rem',fontWeight:600}}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    {icon:'👥',num:'200+',label:'Students Tutored'},
    {icon:'📚',num:'6',label:'Subjects Covered'},
    {icon:'⭐',num:'98%',label:'Satisfaction Rate'},
    {icon:'🕐',num:'5000+',label:'Hours of Tutoring'},
  ];
  return (
    <section style={{padding:'48px 40px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,borderBottom:'1px solid #f0f0f0'}}>
      {items.map(s => (
        <div key={s.label} style={{textAlign:'center'}}>
          <div style={{fontSize:'1.6rem',marginBottom:8}}>{s.icon}</div>
          <div style={{fontSize:'2.2rem',fontWeight:900}}>{s.num}</div>
          <div style={{color:'#666',fontSize:'.9rem',marginTop:4}}>{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function Subjects() {
  return (
    <section style={{padding:'80px 40px'}}>
      <div style={{textAlign:'center',marginBottom:48}}>
        <h2 style={{fontSize:'2.2rem',fontWeight:800}}>Subjects We <span style={{color:'#7c3aed'}}>Offer</span></h2>
        <p style={{color:'#666',fontSize:'1rem',marginTop:10,maxWidth:520,margin:'10px auto 0'}}>Expert tutoring across core science and maths subjects, tailored to your curriculum and learning style.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:24,maxWidth:900,margin:'0 auto'}}>
        {subjects.map(s => (
          <div key={s.name} style={{borderRadius:16,overflow:'hidden',border:'1px solid #e5e7eb',cursor:'pointer'}}>
            <div style={{height:200,background:s.bg,position:'relative',display:'flex',alignItems:'flex-end',padding:14}}>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'4rem',opacity:.4}}>{s.icon}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,color:'#fff',fontWeight:700,fontSize:'1.1rem',position:'relative',zIndex:1}}>
                <div style={{width:36,height:36,background:'rgba(255,255,255,.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>{s.icon}</div>
                {s.name}
              </div>
            </div>
            <div style={{padding:'18px 20px 22px'}}>
              <p style={{color:'#555',fontSize:'.93rem',lineHeight:1.6,marginBottom:14}}>{s.desc}</p>
              <a href="#" style={{color:'#7c3aed',fontWeight:600,fontSize:'.9rem',textDecoration:'none'}}>Learn more →</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section style={{background:'#faf5ff',padding:'80px 40px'}}>
      <div style={{textAlign:'center',marginBottom:48}}>
        <h2 style={{fontSize:'2.2rem',fontWeight:800}}>Why Choose <span style={{color:'#7c3aed'}}>JDScience</span>?</h2>
        <p style={{color:'#666',marginTop:10}}>We go beyond textbooks to deliver real understanding and lasting results.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:28,maxWidth:1000,margin:'0 auto'}}>
        {whyCards.map(c => (
          <div key={c.title} style={{background:'#fff',borderRadius:16,padding:28,border:'1px solid #e5e7eb'}}>
            <div style={{width:48,height:48,background:'#f3e8ff',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',marginBottom:16}}>{c.icon}</div>
            <h3 style={{fontSize:'1.05rem',fontWeight:700,marginBottom:8}}>{c.title}</h3>
            <p style={{color:'#666',fontSize:'.9rem',lineHeight:1.6}}>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{background:'linear-gradient(135deg,#1a0533,#2d1060)',padding:'80px 40px',textAlign:'center'}}>
      <h2 style={{color:'#fff',fontSize:'2.2rem',fontWeight:800,marginBottom:16}}>Ready to Achieve More?</h2>
      <p style={{color:'rgba(255,255,255,.75)',fontSize:'1rem',marginBottom:32,maxWidth:480,margin:'0 auto 32px'}}>Book your free consultation today and take the first step towards better grades and greater confidence.</p>
      <button style={{background:'#7c3aed',color:'#fff',padding:'14px 28px',borderRadius:10,border:'none',fontWeight:700,fontSize:'1rem',cursor:'pointer'}}>
        Book a Free Consultation →
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{padding:'32px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #e5e7eb',flexWrap:'wrap',gap:16}}>
      <div style={{fontWeight:800,color:'#7c3aed',fontSize:'1.1rem'}}>JDScience</div>
      <p style={{color:'#888',fontSize:'.85rem'}}>© 2025 JDScience. All rights reserved.</p>
      <p style={{color:'#888',fontSize:'.85rem'}}>Expert Science & Maths Tutoring</p>
    </footer>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#111',background:'#fff'}}>
      <Navbar onSearch={setSearchQuery} />
      {searchQuery && <SearchResults query={searchQuery} onClose={() => setSearchQuery("")} />}
      {!searchQuery && (
        <>
          <Hero />
          <Stats />
          <Subjects />
          <WhyUs />
          <CTA />
        </>
      )}
      <Footer />
    </div>
  );
}
