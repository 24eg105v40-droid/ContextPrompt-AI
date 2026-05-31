import { useState } from "react";
import "./App.css";

const RECENTS = [
  "Write a cold email to a startup founder",
  "Instagram caption for a sunset photo",
  "Blog intro about minimalism",
  "Python debugging assistant prompt",
];

const EXAMPLE_CHIPS = [
  "✉️ Email", "📸 Instagram Caption", "📝 Blog Post", "💻 Code Help",
  "🎓 Academic Writing", "📣 Marketing Copy", "📖 Storytelling", "🎨 Creative Content",
];

const EXAMPLE_INPUTS = {
  "✉️ Email": "Write a professional follow-up email after a job interview",
  "📸 Instagram Caption": "A cozy rainy day at a café with a book and coffee",
  "📝 Blog Post": "Why minimalism improves mental clarity and focus",
  "💻 Code Help": "Debug a React useEffect that causes infinite re-renders",
  "🎓 Academic Writing": "Introduction for an essay on climate change policy",
  "📣 Marketing Copy": "Launch post for a new productivity mobile app",
  "📖 Storytelling": "Opening scene of a mystery novel set in 1920s Paris",
  "🎨 Creative Content": "Poem about the feeling of watching a sunrise alone",
};

const MOCK_PROMPTS = [
  {
    id: 1,
    label: "Professional & Concise",
    color: "rose",
    text: "You are a professional communication expert. Write a warm, concise follow-up email after a job interview at [Company Name]. Express genuine enthusiasm for the role, briefly reference a key topic discussed during the interview, and close with a polite call to action. Keep the tone confident yet approachable. Limit to 150 words.",
  },
  {
    id: 2,
    label: "Detailed & Thorough",
    color: "lavender",
    text: "Act as a senior career coach helping craft a post-interview follow-up email. The email should: (1) Open with a personalized thank-you referencing a specific interview moment, (2) Reinforce why you're the ideal candidate with one concrete example, (3) Address any concern raised during the interview, (4) End with a clear next-step request. Tone: professional yet human. Length: 200–250 words.",
  },
  {
    id: 3,
    label: "Creative & Memorable",
    color: "mint",
    text: "Write an unconventional yet professional post-interview follow-up email that stands out in a crowded inbox. Use a compelling opening line that references something unique from the conversation. Weave in subtle storytelling to reinforce your passion for the role. Keep it respectful, witty, and under 180 words. The reader should smile and immediately remember who you are.",
  },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, open, setOpen, name }) {
  const nav = [
    { id: "home", icon: "⊹", label: "Home" },
    { id: "history", icon: "◷", label: "History" },
    { id: "saved", icon: "◇", label: "Saved" },
    { id: "deleted", icon: "○", label: "Recently Deleted" },
    { id: "account", icon: "◉", label: "Account" },
  ];

  return (
    <>
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="sb-brand">
          <span className="sb-dot" />
          <span className="sb-title">ContextPrompt</span>
          <button className="sb-close" onClick={() => setOpen(false)}>‹</button>
        </div>

        <div className="sb-user">
          <div className="sb-avatar">{name.charAt(0)}</div>
          <div>
            <p className="sb-hello">Good morning,</p>
            <p className="sb-name">{name}</p>
          </div>
        </div>

        <p className="sb-section">Menu</p>
        <nav>
          {nav.map(n => (
            <button
              key={n.id}
              className={`sb-nav ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="sb-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <p className="sb-section" style={{ marginTop: 24 }}>Recents</p>
        {RECENTS.map((r, i) => (
          <div key={i} className="sb-recent">
            <span className="sb-recent-dot" />
            <span>{r}</span>
          </div>
        ))}
      </aside>

      {!open && (
        <button className="sb-open-btn" onClick={() => setOpen(true)}>›</button>
      )}
    </>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function Home({ name }) {
  const [input, setInput] = useState("");
  const [selectedChip, setSelectedChip] = useState(null);
  const [outputMode, setOutputMode] = useState(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copied, setCopied] = useState(null);

  // NEW
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChip = (chip) => {
    setSelectedChip(chip);
    setInput(EXAMPLE_INPUTS[chip] || "");
    setShowPrompts(false);
    setSelectedPrompt(null);
  };

  // REAL AI GENERATION
  const handleGenerate = async (mode) => {
    if (!input.trim()) return;

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          category: selectedChip || "General",
        }),
      });

      const data = await response.json();

      setPrompts(data.prompts);

      setOutputMode(mode);
      setShowPrompts(true);
      setSelectedPrompt(null);

    } catch (error) {
      console.log(error);

      setPrompts([
        {
          id: 1,
          label: "Error",
          color: "rose",
          text: "Error generating prompts 😭",
        },
      ]);

      setShowPrompts(true);

    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setShowPrompts(false);
    setOutputMode(null);
  };

  const PromptCards = () => (
    <div className="prompt-cards">
      {prompts.map((p, i) => (
        <div
          key={p.id}
          className={`prompt-card color-${p.color} ${selectedPrompt === p.id ? "selected" : ""}`}
          style={{ animationDelay: `${i * 0.08}s` }}
          onClick={() => setSelectedPrompt(p.id)}
        >
          <div className="pc-header">
            <span className={`pc-label color-${p.color}`}>{p.label}</span>

            <button
              className="pc-copy"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(p.id, p.text);
              }}
            >
              {copied === p.id ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <p className="pc-text">{p.text}</p>

          {selectedPrompt === p.id && (
            <div className="pc-selected-badge">
              ✓ Selected
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="page home-page">
      <div className="home-inner">

        {/* Hero */}
        <div className="hero fade-up">
          <div className="hero-badge">✦ AI Prompt Builder</div>

          <h1 className="hero-title">
            ContextPrompt <span className="hero-ai">AI</span>
          </h1>

          <p className="hero-sub">
            Turn your half-formed ideas into beautifully crafted prompts —
            <br />
            tailored to your tone, purpose, and imagination.
          </p>
        </div>

        {/* Input */}
        <div className="input-card fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="input-label">
            What would you like to create today?
          </p>

          <textarea
            className="main-input"
            placeholder="e.g. Write a heartfelt thank-you email to my mentor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />

          {/* Chips */}
          <div className="chips-wrap">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                className={`chip ${selectedChip === chip ? "chip-active" : ""}`}
                onClick={() => handleChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="gen-row">
            <p className="gen-hint">
              Choose how you'd like to see your prompts:
            </p>

            <div className="gen-btns">

              <button
                className="btn-primary"
                onClick={() => handleGenerate("inline")}
                disabled={!input.trim() || loading}
              >
                {loading ? "Generating..." : "Generate — Inline ↓"}
              </button>

              <button
                className="btn-outline"
                onClick={() => handleGenerate("floating")}
                disabled={!input.trim() || loading}
              >
                {loading ? "Generating..." : "Generate — Floating ↗"}
              </button>

            </div>
          </div>
        </div>

        {/* Inline */}
        {showPrompts && outputMode === "inline" && (
          <div className="inline-output fade-up">

            <div className="output-header">
              <div>
                <p className="output-title">
                  Your generated prompts
                </p>

                <p className="output-sub">
                  Pick the one that resonates with you
                </p>
              </div>

              <button
                className="output-close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            <PromptCards />

            {selectedPrompt && (
              <button
                className="btn-primary"
                style={{ marginTop: 16 }}
              >
                Use this prompt →
              </button>
            )}

          </div>
        )}
      </div>

      {/* Floating */}
      {showPrompts && outputMode === "floating" && (
        <div
          className="floating-backdrop"
          onClick={handleClose}
        >
          <div
            className="floating-panel float-up"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="output-header">
              <div>
                <p className="output-title">
                  Your generated prompts
                </p>

                <p className="output-sub">
                  Pick the one that resonates with you
                </p>
              </div>

              <button
                className="output-close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            <PromptCards />

            {selectedPrompt && (
              <button
                className="btn-primary"
                style={{ marginTop: 16 }}
              >
                Use this prompt →
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// ─── History Page ────────────────────────────────────────────────────────────
const HISTORY_DATA = [
  { id: 1, title: "Cold email to a startup founder", category: "✉️ Email", date: "Today, 10:42 am", color: "rose" },
  { id: 2, title: "Instagram caption for a sunset photo", category: "📸 Instagram Caption", date: "Today, 9:15 am", color: "lavender" },
  { id: 3, title: "Blog intro about minimalism", category: "📝 Blog Post", date: "Yesterday", color: "mint" },
  { id: 4, title: "Python debugging assistant", category: "💻 Code Help", date: "Yesterday", color: "peach" },
  { id: 5, title: "Essay on climate change policy", category: "🎓 Academic Writing", date: "May 23", color: "sky" },
];

function History() {
  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-head fade-up">
          <h2 className="page-title">History</h2>
          <p className="page-desc">All your previously generated prompts in one place.</p>
        </div>
        <div className="list-wrap">
          {HISTORY_DATA.map((h, i) => (
            <div key={h.id} className="list-card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`list-accent color-${h.color}`} />
              <div className="list-body">
                <p className="list-title">{h.title}</p>
                <div className="list-meta">
                  <span className={`tag color-${h.color}`}>{h.category}</span>
                  <span className="list-date">{h.date}</span>
                </div>
              </div>
              <div className="list-actions">
                <button className="action-btn">View</button>
                <button className="action-btn">Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Saved Page ──────────────────────────────────────────────────────────────
const SAVED_DATA = [
  { id: 1, title: "Launch post for a productivity app", category: "📣 Marketing Copy", color: "lavender" },
  { id: 2, title: "Opening scene of a mystery novel", category: "📖 Storytelling", color: "rose" },
  { id: 3, title: "Poem about watching a sunrise alone", category: "🎨 Creative Content", color: "mint" },
];

function Saved() {
  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-head fade-up">
          <h2 className="page-title">Saved</h2>
          <p className="page-desc">Prompts you've bookmarked for later use.</p>
        </div>
        <div className="grid-wrap">
          {SAVED_DATA.map((s, i) => (
            <div key={s.id} className={`grid-card fade-up bg-${s.color}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <span className={`tag color-${s.color}`}>{s.category}</span>
              <p className="grid-title">{s.title}</p>
              <div className="grid-actions">
                <button className="action-btn">View</button>
                <button className="action-btn danger">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recently Deleted ────────────────────────────────────────────────────────
const DELETED_DATA = [
  { id: 1, title: "Marketing email for SaaS product", date: "Deleted 2 days ago" },
  { id: 2, title: "Short story about a lost traveller", date: "Deleted 3 days ago" },
];

function RecentlyDeleted() {
  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-head fade-up">
          <h2 className="page-title">Recently Deleted</h2>
          <p className="page-desc">Prompts are permanently removed after 30 days.</p>
        </div>
        {DELETED_DATA.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">○</p>
            <p>Nothing deleted recently.</p>
          </div>
        ) : (
          <div className="list-wrap">
            {DELETED_DATA.map((d, i) => (
              <div key={d.id} className="list-card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="list-accent color-rose" />
                <div className="list-body">
                  <p className="list-title">{d.title}</p>
                  <p className="list-date">{d.date}</p>
                </div>
                <div className="list-actions">
                  <button className="action-btn">Restore</button>
                  <button className="action-btn danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Account Page ────────────────────────────────────────────────────────────
function Account({ name }) {
  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-head fade-up">
          <h2 className="page-title">Account</h2>
          <p className="page-desc">Manage your profile and preferences.</p>
        </div>

        <div className="account-avatar-wrap fade-up">
          <div className="account-avatar">{name.charAt(0)}</div>
          <div>
            <p className="account-name">{name}</p>
            <p className="account-email">vaishnavi@anurag.edu.in</p>
          </div>
        </div>

        <div className="account-section fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="section-label">Profile</p>
          <div className="account-field">
            <label>Full Name</label>
            <input type="text" defaultValue={name} />
          </div>
          <div className="account-field">
            <label>Email</label>
            <input type="email" defaultValue="vaishnavi@anurag.edu.in" />
          </div>
        </div>

        <div className="account-section fade-up" style={{ animationDelay: "0.18s" }}>
          <p className="section-label">Preferences</p>
          <div className="account-field">
            <label>Default Tone</label>
            <select defaultValue="professional">
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
              <option value="academic">Academic</option>
            </select>
          </div>
          <div className="account-field">
            <label>Default Category</label>
            <select defaultValue="email">
              <option value="email">Email</option>
              <option value="social">Social Media</option>
              <option value="blog">Blog</option>
              <option value="code">Code</option>
            </select>
          </div>
        </div>

        <button className="btn-primary fade-up" style={{ animationDelay: "0.24s" }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const name = "Vaishnavi";

  const renderPage = () => {
    switch (page) {
      case "home": return <Home name={name} />;
      case "history": return <History />;
      case "saved": return <Saved />;
      case "deleted": return <RecentlyDeleted />;
      case "account": return <Account name={name} />;
      default: return <Home name={name} />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        name={name}
      />
      <main className={`app-main ${sidebarOpen ? "pushed" : ""}`}>
        {renderPage()}
      </main>
    </div>
  );
}
