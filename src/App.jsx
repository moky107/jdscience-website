import React, { useState } from "react";

export default function App() {
  const [page, setPage] = useState("home");

  const navigate = (target) => {
    setPage(target);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div style={styles.site}>
      <Navbar navigate={navigate} />

      {page === "home" && <Home navigate={navigate} />}
      {page === "subjects" && <Subjects navigate={navigate} />}
      {page === "resources" && <Resources />}
      {page === "videos" && <Videos />}
      {page === "tutors" && <Tutors navigate={navigate} />}
      {page === "becomeTutor" && <BecomeTutor />}
      {page === "bookSession" && <BookSession />}
      {page === "about" && <About />}
      {page === "contact" && <Contact />}

      <Footer navigate={navigate} />
    </div>
  );
}

function Navbar({ navigate }) {
  return (
    <header style={styles.navbar}>
      <div style={styles.brand}>
        <div style={styles.logo}>JD</div>
        <div>
          <h2 style={{ margin: 0 }}>JDScience</h2>
          <small>Science & Maths Tutoring</small>
        </div>
      </div>

      <nav style={styles.nav}>
        <button onClick={() => navigate("home")}>Home</button>
        <button onClick={() => navigate("subjects")}>Subjects</button>
        <button onClick={() => navigate("resources")}>Resources</button>
        <button onClick={() => navigate("videos")}>Videos</button>
        <button onClick={() => navigate("tutors")}>Tutors</button>
        <button onClick={() => navigate("about")}>About</button>
        <button onClick={() => navigate("contact")}>Contact</button>
      </nav>

      <div style={styles.actions}>
        <button onClick={() => navigate("becomeTutor")}>
          Become a Tutor
        </button>

        <button>Sign In</button>

        <button>Register</button>

        <button
          style={styles.primary}
          onClick={() => navigate("bookSession")}
        >
          Book Session
        </button>
      </div>
    </header>
  );
}

function Home({ navigate }) {
  return (
    <>
      <section style={styles.hero}>
        <h1>Learn Smarter. Revise Better. Achieve More.</h1>

        <p>
          GCSE, A-Level, BTEC, T-Level and 11+ tutoring with organised
          revision notes, past papers, mark schemes and examiner reports.
        </p>

        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <button
            style={styles.primary}
            onClick={() => navigate("subjects")}
          >
            Explore Subjects
          </button>

          <button
            style={styles.secondary}
            onClick={() => navigate("bookSession")}
          >
            Book Session
          </button>

          <button
            style={styles.secondary}
            onClick={() => navigate("becomeTutor")}
          >
            Become a Tutor
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <h2>Featured Subjects</h2>

        <div style={styles.grid}>
          {[
            "Physics",
            "Chemistry",
            "Biology",
            "Maths",
            "A-Level",
            "BTEC",
            "T-Level",
            "11+",
          ].map((subject) => (
            <div key={subject} style={styles.card}>
              <h3>{subject}</h3>
              <button
                style={styles.primary}
                onClick={() => navigate("subjects")}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2>Why Choose JDScience?</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Expert Tutors</h3>
          </div>

          <div style={styles.card}>
            <h3>Quality Resources</h3>
          </div>

          <div style={styles.card}>
            <h3>Flexible Learning</h3>
          </div>

          <div style={styles.card}>
            <h3>Exam Success</h3>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2>Featured Tutors</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>JD</h3>
            <p>Physics & Chemistry</p>
            <p>£40/hr</p>
          </div>

          <div style={styles.card}>
            <h3>Biology Tutor</h3>
            <p>£35/hr</p>
          </div>

          <div style={styles.card}>
            <h3>Maths Tutor</h3>
            <p>£35/hr</p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2>Resources Preview</h2>

        <div style={styles.grid}>
          <div style={styles.card}>Revision Notes</div>
          <div style={styles.card}>Past Papers</div>
          <div style={styles.card}>Mark Schemes</div>
          <div style={styles.card}>Examiner Reports</div>
        </div>

        <button
          style={styles.primary}
          onClick={() => navigate("resources")}
        >
          Browse Resources
        </button>
      </section>
    </>
  );
}

function Subjects() {
  return (
    <div style={styles.page}>
      <h1>Subjects</h1>

      <div style={styles.grid}>
        {[
          "Physics",
          "Chemistry",
          "Biology",
          "Maths",
          "A-Level",
          "BTEC",
          "T-Level",
          "11+",
        ].map((s) => (
          <div key={s} style={styles.card}>
            <h3>{s}</h3>
            <p>Professional tutoring support.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Resources() {
  return (
    <div style={styles.page}>
      <h1>Resources</h1>

      <h2>Revision Notes</h2>
      <p>
        Topic-based notes organised into PDFs, PowerPoints and Word
        documents.
      </p>

      <h2>Exam Resources</h2>

      <div style={styles.card}>
        <h3>2025</h3>
        <p>Question Paper</p>
        <p>Mark Scheme</p>
        <p>Examiner Report</p>
      </div>

      <div style={styles.card}>
        <h3>2024</h3>
        <p>Question Paper</p>
        <p>Mark Scheme</p>
        <p>Examiner Report</p>
      </div>
    </div>
  );
}

function Videos() {
  return (
    <div style={styles.page}>
      <h1>Video Lessons</h1>

      <div style={styles.grid}>
        <div style={styles.card}>Physics Videos</div>
        <div style={styles.card}>Chemistry Videos</div>
        <div style={styles.card}>Biology Videos</div>
        <div style={styles.card}>Maths Videos</div>
      </div>
    </div>
  );
}

function Tutors({ navigate }) {
  return (
    <div style={styles.page}>
      <h1>Find a Tutor</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>JD</h3>
          <p>Physics & Chemistry</p>
          <button
            style={styles.primary}
            onClick={() => navigate("bookSession")}
          >
            Book Tutor
          </button>
        </div>
      </div>
    </div>
  );
}

function BecomeTutor() {
  return (
    <div style={styles.page}>
      <h1>Become a Tutor</h1>

      <input placeholder="Full Name" style={styles.input} />
      <input placeholder="Email" style={styles.input} />
      <input placeholder="Phone" style={styles.input} />
      <input placeholder="Subjects" style={styles.input} />
      <input placeholder="Qualifications" style={styles.input} />

      <textarea
        placeholder="Tell us about yourself"
        style={styles.textarea}
      />

      <input type="file" style={styles.input} />

      <button style={styles.primary}>
        Submit Application
      </button>
    </div>
  );
}

function BookSession() {
  return (
    <div style={styles.page}>
      <h1>Book a Session</h1>

      <input placeholder="Name" style={styles.input} />
      <input placeholder="Email" style={styles.input} />
      <input placeholder="Phone" style={styles.input} />
      <input placeholder="Subject" style={styles.input} />
      <input type="date" style={styles.input} />

      <button style={styles.primary}>
        Book Session
      </button>
    </div>
  );
}

function About() {
  return (
    <div style={styles.page}>
      <h1>About JDScience</h1>

      <p>
        Science and Maths tutoring for GCSE, A-Level, BTEC, T-Level
        and 11+ students.
      </p>
    </div>
  );
}

function Contact() {
  return (
    <div style={styles.page}>
      <h1>Contact</h1>

      <input placeholder="Name" style={styles.input} />
      <input placeholder="Email" style={styles.input} />

      <textarea
        placeholder="Message"
        style={styles.textarea}
      />

      <button style={styles.primary}>
        Send Message
      </button>
    </div>
  );
}

function Footer({ navigate }) {
  return (
    <footer style={styles.footer}>
      <button onClick={() => navigate("home")}>Home</button>
      <button onClick={() => navigate("subjects")}>Subjects</button>
      <button onClick={() => navigate("resources")}>Resources</button>
      <button onClick={() => navigate("videos")}>Videos</button>
      <button onClick={() => navigate("tutors")}>Tutors</button>
      <button onClick={() => navigate("contact")}>Contact</button>
    </footer>
  );
}

const styles = {
  site: {
    fontFamily: "system-ui",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    background: "#150034",
    color: "white",
    flexWrap: "wrap",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "#7c3aed",
    fontWeight: "bold",
  },

  nav: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  hero: {
    background: "#1a003d",
    color: "white",
    padding: "100px 8%",
  },

  section: {
    padding: "60px 8%",
  },

  page: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "50px 20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,.08)",
  },

  primary: {
    background: "#7c3aed",
    color: "white",
    border: 0,
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  secondary: {
    background: "transparent",
    color: "white",
    border: "1px solid white",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },

  textarea: {
    width: "100%",
    height: "150px",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },

  footer: {
    background: "#150034",
    color: "white",
    padding: "40px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
};
