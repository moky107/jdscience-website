import React, { useState } from "react";
import {
  BookOpen,
  FlaskConical,
  Atom,
  Dna,
  Calculator,
  GraduationCap,
  School,
  Users,
  FileText,
} from "lucide-react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "subjects", label: "Subjects & Pricing" },
    { id: "booking", label: "Booking" },
    { id: "resources", label: "Resources" },
    { id: "videos", label: "Videos" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo" onClick={() => setPage("home")}>
          <FlaskConical size={28} />
          <span>JD Science</span>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={page === item.id ? "active" : ""}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === "home" && <Home setPage={setPage} />}
        {page === "about" && <About />}
        {page === "subjects" && <Subjects />}
        {page === "booking" && <Booking />}
        {page === "resources" && <Resources />}
        {page === "videos" && <Videos />}
        {page === "contact" && <Contact />}

        {page === "btec" && <BTEC />}
        {page === "tlevel" && <TLevel />}
        {page === "gcse" && <GCSE />}
        {page === "elevenplus" && <ElevenPlus />}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} JD Science. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Home({ setPage }) {
  const pathways = [
    {
      id: "btec",
      title: "BTEC",
      text: "Applied Science support for assignments, exams and practical units.",
      icon: <FileText size={36} />,
    },
    {
      id: "tlevel",
      title: "T-Level",
      text: "Specialist support for science, health and technical qualifications.",
      icon: <School size={36} />,
    },
    {
      id: "gcse",
      title: "GCSE / IGCSE",
      text: "AQA, Edexcel, OCR and Cambridge support in Science and Maths.",
      icon: <GraduationCap size={36} />,
    },
    {
      id: "elevenplus",
      title: "11+",
      text: "English, Maths, verbal reasoning and non-verbal reasoning preparation.",
      icon: <Users size={36} />,
    },
  ];

  return (
    <>
      <section className="hero">
        <h1>Expert Science and Maths Tuition</h1>
        <p>
          Personalised online and face-to-face tuition for GCSE, IGCSE, A-Level,
          BTEC, T-Level and 11+ learners.
        </p>
        <button onClick={() => setPage("booking")}>Book a Lesson</button>
      </section>

      <section className="pathway-section">
        <h2>Choose Your Learning Pathway</h2>
        <p className="section-intro">
          Select the qualification or stage that matches your learning needs.
        </p>

        <div className="pathway-grid">
          {pathways.map((item) => (
            <button
              key={item.id}
              className="pathway-card"
              onClick={() => setPage(item.id)}
            >
              <div className="pathway-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="subjects-preview">
        <h2>Core Subjects</h2>
        <div className="card-grid">
          <SubjectCard icon={<Dna />} title="Biology" />
          <SubjectCard icon={<FlaskConical />} title="Chemistry" />
          <SubjectCard icon={<Atom />} title="Physics" />
          <SubjectCard icon={<Calculator />} title="Maths" />
        </div>
      </section>
    </>
  );
}

function SubjectCard({ icon, title }) {
  return (
    <div className="subject-card">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function PageLayout({ title, children }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      {children}
    </section>
  );
}

function BTEC() {
  return (
    <PageLayout title="BTEC Science">
      <p>
        Support for BTEC Applied Science learners, including assignment planning,
        practical write-ups, exam preparation and unit-by-unit guidance.
      </p>
    </PageLayout>
  );
}

function TLevel() {
  return (
    <PageLayout title="T-Level Science">
      <p>
        Targeted support for T-Level learners, including technical knowledge,
        workplace application, assessment preparation and scientific skills.
      </p>
    </PageLayout>
  );
}

function GCSE() {
  return (
    <PageLayout title="GCSE / IGCSE Science and Maths">
      <p>
        Structured support for GCSE and IGCSE Biology, Chemistry, Physics and
        Maths across AQA, Edexcel, OCR and Cambridge specifications.
      </p>
    </PageLayout>
  );
}

function ElevenPlus() {
  return (
    <PageLayout title="11+ Tuition">
      <p>
        Preparation for 11+ entrance exams, including Maths, English, verbal
        reasoning, non-verbal reasoning, exam technique and confidence building.
      </p>
    </PageLayout>
  );
}

function About() {
  return (
    <PageLayout title="About JD Science">
      <p>
        JD Science provides high-quality tuition in Science and Maths, with a
        focus on clear explanations, exam confidence and personalised learning.
      </p>
    </PageLayout>
  );
}

function Subjects() {
  return (
    <PageLayout title="Subjects & Pricing">
      <p>
        Tuition is available in Biology, Chemistry, Physics and Maths for GCSE,
        IGCSE, A-Level, BTEC, T-Level and 11+ learners.
      </p>
    </PageLayout>
  );
}

function Booking() {
  return (
    <PageLayout title="Book a Lesson">
      <p>
        Use this page to request tuition, choose your subject and arrange a
        suitable lesson time.
      </p>
    </PageLayout>
  );
}

function Resources() {
  return (
    <PageLayout title="Resources">
      <p>
        Revision notes, worksheets, past questions and mark schemes will be
        organised here by subject, level and exam board.
      </p>
    </PageLayout>
  );
}

function Videos() {
  return (
    <PageLayout title="Videos">
      <p>
        Science and Maths video lessons, walkthroughs and revision tutorials will
        be available here.
      </p>
    </PageLayout>
  );
}

function Contact() {
  return (
    <PageLayout title="Contact">
      <p>
        For tuition enquiries, booking support or resource access, please contact
        JD Science directly.
      </p>
    </PageLayout>
  );
}

export default App;
