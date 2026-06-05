import { Copy } from "lucide-react";
import { WandSparkles } from "lucide-react";
import { Star } from "lucide-react";
import { Bookmark } from "lucide-react";
import { Sparkles, History, Zap } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Target, Brain } from "lucide-react";
import { Stars } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  BriefcaseBusiness } from "lucide-react";
import { auth, provider } from "./firebase";
export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptType, setPromptType] = useState("general");
const [tone, setTone] = useState("professional");
  const [result, setResult] = useState([]);
const getIcon = (title) => {
const iconMap = {
  quick: <Zap size={22} />,
  detailed: <Target size={22} />,
  expert: <Brain size={22} />,
};

  return iconMap[title] || <Zap size={22} className="text-gray-400" />;
};
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saved, setSaved] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
const copyPrompt = async (text, index) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    setTimeout(() => setCopiedIndex(null), 2000);
  } catch (err) {
    console.error("Copy failed", err);
  }
};
const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(
      auth,
      provider
    );

    setUser(result.user);

    localStorage.setItem(
      "user",
      JSON.stringify(result.user)
    );

  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  const savedUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  if (savedUser) {
    setUser(savedUser);
  }
}, []);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);
  const [history, setHistory] = useState([]);
const [savedPrompts, setSavedPrompts] = useState(() => {
  return JSON.parse(localStorage.getItem("savedPrompts")) || [];
});
  const [page, setPage] = useState("home");

  useEffect(() => {
  const savedHistory =
    JSON.parse(
      localStorage.getItem("history")
    ) || [];

  setHistory(savedHistory);
}, []);

const saveSinglePrompt = (prompt) => {
  const updated = [...savedPrompts, prompt];

  setSavedPrompts(updated);

  localStorage.setItem(
    "savedPrompts",
    JSON.stringify(updated)
  );
};

const deleteSavedPrompt = (index) => {
  const updated = savedPrompts.filter(
    (_, i) => i !== index
  );

  setSavedPrompts(updated);
  localStorage.setItem(
    "savedPrompts",
    JSON.stringify(updated)
  );
};
  const exploreItems = [
  {
    title: "📚 Study Notes",
    prompt: "Create concise study notes for:"
  },
  {
    title: "📝 Quiz Generator",
    prompt: "Generate 20 quiz questions with answers on:"
  },
  {
    title: "🎓 Exam Preparation",
    prompt: "Create an exam preparation guide for:"
  },
  {
    title: "💻 Coding Helper",
    prompt: "Explain and solve coding problems related to:"
  },
  {
    title: "📊 PPT Creator",
    prompt: "Create a presentation outline on:"
  },
  {
    title: "📧 Internship Email",
    prompt: "Write a professional internship email for:"
  },
  {
    title: "📄 Assignment Writer",
    prompt: "Help me write an assignment on:"
  },
  {
    title: "🧠 Flashcards",
    prompt: "Generate flashcards for:"
  },
  {
    title: "🔬 Research Summary",
    prompt: "Summarize research about:"
  },
  {
    title: "🚀 Project Ideas",
    prompt: "Suggest innovative project ideas for:"
  }
];

const templates = [
  {
    title: "📚 Study Notes",
    prompt: `Create structured study notes on:
Topic:

Include:
- Key concepts
- Definitions
- Examples
- Summary`
  },

  {
    title: "🎓 Exam Revision",
    prompt: `Create an exam revision guide for:
Topic:

Include:
- Important questions
- Short answers
- Long answers
- Quick revision tips`
  },

  {
    title: "📧 Internship Email",
    prompt: `Write a professional internship application email.

Details:
Name:
Role:
Skills:
Company:`
  },

  {
    title: "💻 Coding Assistant",
    prompt: `Help me solve a coding problem.

Language:
Problem:
Requirements:
Expected Output:`
  },

  {
    title: "🎤 Presentation",
    prompt: `Create a presentation outline.

Topic:

Include:
- Introduction
- Main points
- Examples
- Conclusion`
  },

  {
    title: "🚀 Startup Pitch",
    prompt: `Create a startup pitch.

Startup Idea:
Target Audience:
Problem:
Solution:
Revenue Model:`
  }
];

const generatePrompt = async () => {
  try {
    setLoading(true);

    const API_URL =
      import.meta.env.VITE_API_URL ||
      "https://contextprompt-ai-1.onrender.com";

    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: input,
        category: promptType,
        tone: tone,
        email: user?.email || "guest",
      }),
    });

    const data = await response.json(); 

    console.log("DATA:", data);

    const prompts = data.prompts || [];

    setResult(prompts);

    setHistory((prev) => {
      const updated = [
        {
          id: crypto.randomUUID(),
          text: input,
          timestamp: Date.now(),
          type: "generate",
        },
        ...prev,
      ];

      localStorage.setItem("history", JSON.stringify(updated));
      return updated;
    });

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const totalPrompts = history.length;

const getLast7Days = () => {
  const days = {};

  history.forEach((h) => {
    const date = new Date(h.timestamp).toLocaleDateString();
    days[date] = (days[date] || 0) + 1;
  });

  return Object.entries(days).slice(-7);
};

const usageData = getLast7Days();

const mostActiveDay =
  Object.entries(
    history.reduce((acc, h) => {
      const d = new Date(h.timestamp).toDateString();
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

const avgUsage =
  history.length
    ? (
        history.length /
        Math.max(
          new Set(
            history.map(h =>
              new Date(h.timestamp).toDateString()
            )
          ).size,
          1
        )
      ).toFixed(1)
    : 0;
  const savePrompt = () => {
  const updated = [
    ...savedPrompts,
    ...result
  ];

  setSavedPrompts(updated);

  localStorage.setItem(
    "savedPrompts",
    JSON.stringify(updated)
  );
};
const handleLogout = async () => {
  await signOut(auth);
  localStorage.removeItem("user");
  setUser(null);
};
 const renderPage = () => {
    if (page === "analytics") {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Analytics 📊</h1>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="p-6 rounded-2xl bg-white/70 border">
          <p className="text-sm text-gray-500">Total Prompts</p>
          <h2 className="text-3xl font-bold">{totalPrompts}</h2>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 border">
          <p className="text-sm text-gray-500">Avg per Day</p>
          <h2 className="text-3xl font-bold">{avgUsage}</h2>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 border">
          <p className="text-sm text-gray-500">Most Active Day</p>
          <h2 className="text-lg font-bold">
            {mostActiveDay?.[0] || "N/A"}
          </h2>
        </div>
      </div>

      {/* Activity */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3">
          {history.slice().reverse().map((h, i) => (
            <div key={i} className="p-4 bg-white/60 rounded-xl border">
              <p>{h.text}</p>
              <p className="text-xs text-gray-400">
                {new Date(h.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  if (page === "explore") {
    return (
      <div>
        <h1 className="text-5xl font-bold mb-8">Explore  🔎</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {exploreItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setInput(item.prompt);
              setPage("home");
            }}
            className="p-5 rounded-3xl bg-white/10 text-left"
          >
            <h3 className="font-bold">{item.title}</h3>
            <p className="opacity-70 text-sm mt-2">Discover ideas</p>
          </button>
        ))}
      </div>
      </div>
    );
  }

  if (page === "templates") {
    return (
      <div>
        <h1 className="text-5xl font-bold mb-8">Templates 📁</h1>

        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(item.prompt);
                setPage("home");
              }}
              className="p-5 rounded-3xl bg-white/10 text-left hover:bg-white/20 transition"
            >
              <h3 className="font-bold text-xl">{item.title}</h3>
              <p className="opacity-70 text-sm mt-2">
                Ready-made professional prompt
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

if (page === "saved") {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">
          Saved Prompts
        </h2>

        <button
          onClick={() => {
            localStorage.removeItem("savedPrompts");
            setSavedPrompts([]);
          }}
          className="
            px-4 py-2
            rounded-xl
            bg-red-50
            text-red-600
            hover:bg-red-100
          "
        >
          Delete All
        </button>
      </div>

      {savedPrompts.map((item, index) => (
        <div
          key={index}
          className="bg-white/70 p-5 rounded-3xl mb-4"
        >
          {item.text || item.prompt || JSON.stringify(item)}
        </div>
      ))}
    </div>
  );
}
  return null;
};

  return (

<div
  className="min-h-screen flex text-[#1f1f2e] bg-[#faf9ff]"
style={{
  backgroundColor: "#f8fbff",
  backgroundImage: `
    radial-gradient(circle at top, rgba(125, 170, 255, 0.18), transparent 40%),
    linear-gradient(rgba(125, 170, 255, 0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 170, 255, 0.10) 1px, transparent 1px)
  `,
  backgroundSize: "100% 100%, 26px 26px, 26px 26px",
}}
>

 <div
  className={`
    ${sidebarOpen ? "w-64" : "w-20"}
    transition-all duration-300
    border-r border-[#dfe0ff]
    p-4
    flex flex-col
    h-screen
    sticky top-0
    overflow-hidden
  `}
>
<div className="mb-8 flex justify-start">
<button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="
    absolute
    top-4
    left-4
    text-3xl
    z-50
  "
>
  ☰
</button>
</div>
    {/* Logo */}

  {sidebarOpen && (
  <div className="mb-8">
    <h2 className="font-extrabold text-xl leading-none flex items-center gap-2">
      🚀 ContextPrompt AI
    </h2>

    <p className="text-xs text-gray-500">
      AI Prompt Generator
    </p>
  </div>
)}

    {/* Navigation */}
   <button
  onClick={() => setPage("home")}
  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/20"
>
  <span>🏠</span>
  {sidebarOpen && <span>Home</span>}
</button>

<button
  onClick={() => setPage("explore")}
  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/20"
>
  <span>🔍</span>
  {sidebarOpen && <span>Explore</span>}
</button>

<button
  onClick={() => setPage("templates")}
  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/20"
>
  <span>📂</span>
  {sidebarOpen && <span>Templates</span>}
</button>
<button
  onClick={() => setPage("analytics")}
  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/20"
>
  📊
  {sidebarOpen && <span>Analytics</span>}
</button>
<button
  onClick={() => setPage("saved")}
  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/20"
>
  <div className="flex items-center gap-3">
    <Bookmark size={18} />
    {sidebarOpen && <span>Saved</span>}
  </div>

  {savedPrompts.length > 0 && (
    <span className="bg-[#8f8cff] text-white text-xs px-2 py-1 rounded-full">
      {savedPrompts.length}
    </span>
  )}
</button>


    {/* Recent */}
{sidebarOpen && (
  <div className="flex-1 min-h-0 flex flex-col mt-6">
    <p className="text-xs opacity-50 mb-4">
      RECENT
    </p>

    <div className="flex-1 overflow-y-auto pr-2">
      {history.map((item, index) => (
        <div key={index} className="mb-3 text-sm">
          {item.text}
        </div>
      ))}
    </div>

    <button
      onClick={() => {
        localStorage.removeItem("history");
        setHistory([]);
      }}
      className="
        mt-3
        w-full
        py-2
        rounded-xl
        bg-red-50
        hover:bg-red-100
        text-red-600
      "
    >
      Clear History
    </button>
  </div>
)}


<div className="mt-auto border-t border-[#dfe0ff] pt-4">

  {user ? (

    <div>
      <div
        className={`flex mt-6 mb-10 ${
          sidebarOpen
            ? "items-center gap-4"
            : "justify-center"
        }`}
      >
        <img
          src={user.photoURL}
          alt=""
          className="w-10 h-10 rounded-full"
        />

        {sidebarOpen && (
          <div>
            <p className="font-semibold text-sm">
              {user.displayName}
            </p>

            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>
      <div className="h-px bg-[#dfe0ff] my-3" />

      {sidebarOpen && (
        <button
          onClick={handleLogout}
          className="mt-3 w-full py-2 rounded-xl bg-red-100 hover:bg-red-200"
        >
          Logout
        </button>
      )}
    </div>

  ) : (

    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 bg-white border border-[#dfe0ff] py-3 rounded-xl"
    >
      <FcGoogle size={20} />
      {sidebarOpen && <span>Sign In</span>}
    </button>
  )}
  </div>
</div>
 {/* menu */}

   <div className="flex-1 p-10 overflow-y-auto relative">
        {page !== "home" ? (
          renderPage()
        ) : (
          <>
<div className="text-center mt-1">
  <div className="flex justify-center mb-2">
  <div
    className="
      flex items-center gap-1
      px-2 py-1.5
      rounded-full
      bg-white/70
      backdrop-blur-md
      border border-[#efe7ff]
      shadow-sm
    "
  >
    <Sparkles
      size={18}
      className="text-[#b38cff]"
    />

    <span
      className="
        text-lg
        font-medium
        bg-gradient-to-r
        from-[#a78bfa]
        to-[#d16ba5]
        bg-clip-text
        text-transparent
      "
    >
      AI-Powered Prompt Engineering
    </span>
  </div>
</div>

  <h1
  className="
    mt-6
    text-6xl
    font-extrabold
    leading-none
    text-[#1f1f2e]
  "
>
  Craft Perfect Prompts
  <br />

  with{" "}
  <span
    className="
      bg-gradient-to-r
      from-[#7f8cff]
      via-[#c8a0ff]
      to-[#ffb3d9]
      bg-clip-text
      text-transparent
    "
  >
    ContextPrompt AI
  </span>
</h1>

  <p
    className="
      max-w-2xl
      mx-auto
      mt-5
      text-lg
      font-light
      text-gray-600
    "
  >
    Turn ideas into professional, creative, and expert-level prompts
    instantly. Designed for students, creators, developers, and
    professionals.
  </p>
</div>
  {/* Feature Pills */}
<div className="flex flex-wrap justify-center gap-4 mt-8">

  <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/70 border border-[#e7e7ff]">
    <WandSparkles
      size={24}
      className="text-[#8f8cff]"
    />
    <span>Smart Generation</span>
  </div>

  <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/70 border border-[#e7e7ff]">
    <History
      size={24}
      className="text-[#8f8cff]"
    />
    <span>Save History</span>
  </div>

  <div className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/70 border border-[#e7e7ff]">
    <Zap
      size={24}
      className="text-[#8f8cff]"
    />
    <span>Instant Results</span>
  </div>

</div>
 <div className="max-w-4xl mx-auto mt-16 px-4">
  <div
  className="
    max-w-3xl
    mx-auto
    mt-16
    bg-white/70
    backdrop-blur-xl
    border border-[#dfe0ff]
    rounded-3xl
    p-8
    shadow-xl
  "
>
  <div className="flex items-center gap-2 mb-2">
  <Sparkles
    size={24}
    className="text-[#8f8cff]"
  />

  <h2 className="text-3xl font-light tracking-tight">
    Create Your Prompt
  </h2>
</div>
  <p className="text-gray-500 text-base font-light leading-relaxed">
  Describe what you want to achieve and we'll craft
  the perfect prompt
</p>

  {/* Prompt Input */}
  <div className="mb-6">
<label className="text-sm font-medium text-gray-600">
  What do you want to create?
</label>

    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      rows={6}
      placeholder="E.g., A blog post about sustainable living tips..."
      className="
        w-full
        rounded-2xl
        border border-[#dfe0ff]
        p-4
        bg-white
        outline-none
        focus:ring-2
        focus:ring-[#8f8cff]
      "
    />
  </div>
  <div className="mb-4 p-4 rounded-2xl border border-[#dfe0ff] bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md">



  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* TYPE */}
    <div className="p-3 rounded-xl bg-white/70 border border-[#e7e7ff] shadow-sm">
      <label className="text-xs font-semibold text-[#8f8cff] uppercase tracking-wide">
        Prompt Type
      </label>

      <select
        value={promptType}
        onChange={(e) => setPromptType(e.target.value)}
        className="
          w-full mt-2 p-2 rounded-lg
          bg-white/80
          border border-[#dfe0ff]
          focus:ring-2 focus:ring-[#8f8cff]/40
          outline-none
        "
      >
        <option value="general">General</option>
        <option value="study">Study / Education</option>
        <option value="coding">Coding / Developer</option>
        <option value="business">Business / Startup</option>
        <option value="creative">Creative Writing</option>
        <option value="marketing">Marketing / Ads</option>
        <option value="research">Research / Analysis</option>
        <option value="productivity">Productivity / Planning</option>
        <option value="resume">Resume / Career</option>
        <option value="social">Social Media Content</option>
        <option value="email">Email / Communication</option>
      </select>
    </div>

    {/* TONE */}
    <div className="p-3 rounded-xl bg-white/70 border border-[#e7e7ff] shadow-sm">
      <label className="text-xs font-semibold text-[#ff9ed2] uppercase tracking-wide">
        Tone
      </label>

      <select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        className="
          w-full mt-2 p-2 rounded-lg
          bg-white/80
          border border-[#dfe0ff]
          focus:ring-2 focus:ring-[#ff9ed2]/40
          outline-none
        "
      >
        <option value="professional">Professional</option>
        <option value="friendly">Friendly</option>
        <option value="formal">Formal</option>
        <option value="creative">Creative</option>
        <option value="persuasive">Persuasive</option>
        <option value="simple">Simple / Beginner</option>
        <option value="concise">Concise</option>
        <option value="detailed">Detailed</option>
        <option value="enthusiastic">Enthusiastic</option>
        <option value="authoritative">Authoritative</option>
        <option value="storytelling">Storytelling</option>
      </select>
    </div>

  </div>
</div>
  <button
  onClick={generatePrompt}
  className="
    flex items-center justify-center gap-2
    w-full py-4 rounded-2xl
    bg-gradient-to-r
    from-[#8f8cff]
    to-[#6f72ff]
    text-white font-medium
  "
>

  <WandSparkles size={20} />
  Generate Prompt
</button>
</div>
  </div>

          {result.length > 0 && (
  <div className="max-w-5xl mx-auto mt-10">

  <div className="grid gap-6">
  {result.map((item, index) => (
    <div
      key={index}
     className="
bg-white/70
backdrop-blur-md
border border-[#dfe0ff]
p-6
rounded-3xl
shadow-lg
"
    >
        
        
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-medium flex items-center gap-2">
<div className="flex items-center gap-2">
  <span>{item.title}</span>
</div>
</h2>
<div className="flex items-center gap-2">
  <button
    onClick={() => saveSinglePrompt(item)}
    className="
      flex items-center gap-1
      px-4 py-2
      rounded-xl
      border border-[#dfe0ff]
      hover:bg-yellow-50
      transition
    "
  >
    <Star size={18} className="text-yellow-500" />
    Save
  </button>

  <button
    onClick={() => copyPrompt(item.text, index)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
      ${
        copiedIndex === index
          ? "border-green-400 shadow-lg shadow-green-200 bg-green-50"
          : "border-[#dfe0ff] bg-white/10 hover:bg-white/20"
      }`}
  >
    <Copy size={18} />
    {copiedIndex === index ? "Copied!" : "Copy"}
  </button>
</div>
      </div>

      <div className="whitespace-pre-wrap">
        {item.text}
      </div>
    </div>
  ))}
</div>
</div>
          )}
          </>
        )}
        </div>

        </div>
  )
}