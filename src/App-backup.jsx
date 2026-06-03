import { Copy } from "lucide-react";
import { WandSparkles } from "lucide-react";
import {
  Sparkles,
  History,
  Zap,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  BriefcaseBusiness,
  Brain
} from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saved, setSaved] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
const copyPrompt = async (text, index) => {
  await navigator.clipboard.writeText(text);

  setCopiedIndex(index);

  setTimeout(() => {
    setCopiedIndex(null);
  }, 2000);
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
  const unsubscribe = onAuthStateChanged(
    auth,
    (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    }
  );

const handleLogout = async () => {
  await signOut(auth);

  localStorage.removeItem("user");

  setUser(null);
};

  return () => unsubscribe();
}, []);
  const [history, setHistory] = useState([]);
const [savedPrompts, setSavedPrompts] =
  useState([]);
  useEffect(() => {
  const prompts =
    JSON.parse(
      localStorage.getItem("savedPrompts")
    ) || [];

  setSavedPrompts(prompts);
}, []);
  const [page, setPage] = useState("home");

  useEffect(() => {
  const savedHistory =
    JSON.parse(
      localStorage.getItem("history")
    ) || [];

  setHistory(savedHistory);
}, []);


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
    if (!input.trim()) return;

    setLoading(true);

    try {
        console.log(import.meta.env.VITE_GROQ_API_KEY);
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              import.meta.env.VITE_GROQ_API_KEY
            }`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "user",
               content: `Generate exactly 3 AI prompts for:

${input}

Format exactly like this:

### Professional Prompt
[prompt]

### Creative Prompt
[prompt]

### Expert Prompt
[prompt]
`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log("GROQ RESPONSE:", data);

      const text =
        data?.choices?.[0]?.message?.content ||
        "No response";

      const sections = text.split("###").filter(Boolean);

const prompts = sections.map((section) => {
  const lines = section.trim().split("\n");

  return {
    title: lines[0],
    text: lines.slice(1).join("\n").trim(),
  };
});

setResult(prompts);

      const updatedHistory = [input, ...history];

setHistory(updatedHistory);

localStorage.setItem(
  "history",
  JSON.stringify(updatedHistory)
);
    }  catch (err) {
  setResult([]);
}

    setLoading(false);
  };

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
  if (page === "explore") {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {exploreItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setInput(item.prompt)
              setPage("home");
            }}
            className="p-5 rounded-3xl bg-white/10 text-left"
          >
            <h3 className="font-bold">
              {item.title}
            </h3>

            <p className="opacity-70 text-sm mt-2">
              Discover ideas
            </p>
          </button>
        ))}
      </div>
    )

  };
if (page === "templates") {
  return (
    <div>
      <h1 className="text-5xl font-bold mb-8">
        Templates 📁
      </h1>

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
            <h3 className="font-bold text-xl">
              {item.title}
            </h3>

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
          <h2 className="text-4xl font-bold mb-6">
            Saved Prompts
          </h2>

          {saved.length === 0 ? (
            <p>No saved prompts yet.</p>
          ) : (
            saved.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 p-5 rounded-3xl mb-4"
              >
                {item}
              </div>
            ))
          )}
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
    ${sidebarOpen ? "w-65" : "w-20"}
    transition-all duration-300
    border-r border-[#dfe0ff]
    p-4
    overflow-hidden
    flex flex-col
    h-screen
    sticky top-0
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

    {/* Recent */}
{sidebarOpen && (
  <div className="mt-10">
    <p className="text-xs opacity-50 mb-4">
      RECENT
    </p>

    {history.map((item, index) => (
      <div
        key={index}
        className="mb-3 text-sm"
      >
        {item}
      </div>
    ))}

    <button
      onClick={() => {
        localStorage.removeItem("history");
        setHistory([]);
      }}
      className="mt-2"
    >
      Clear History
    </button>
  </div>
)}


<div className="mt-auto pt-4 border-t border-[#dfe0ff]">

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
  {/* Badge */}
  <div
    className="
      inline-flex
      items-center
      gap-2
      px-6
      py-3
      rounded-full
      border
      border-[#cfcfff]
      text-[#8b8cff]
      bg-white/40
      backdrop-blur-sm
    "
  >
    ✨ AI-Powered Prompt Engineering
  </div>

  {/* Heading */}
  <h1
    className="
      mt-10
      text-6xl
      md:text-6xl
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

  {/* Description */}
  <p
    className="
      max-w-2xl
      mx-auto
      mt-2
      text-xl
      text-black-700
    "
  >
    Generate powerful, effective AI prompts tailored to your needs.
    Save your history and refine your prompt engineering skills.
  </p>

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
  {item.title.includes("Professional") && (
    <BriefcaseBusiness
      size={22}
      className="text-[#8f8cff]"
    />
  )}

  {item.title.includes("Creative") && (
    <WandSparkles
      size={22}
      className="text-[#8f8cff]"
    />
  )}

  {item.title.includes("Expert") && (
    <Brain
      size={22}
      className="text-[#8f8cff]"
    />
  )}

  {item.title}
</h2>

<button
  onClick={() => copyPrompt(item.text, index)}
  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
>
  <Copy size={18} />
  {copiedIndex === index ? "Copied!" : "Copy"}
</button>
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
);
}