import { useState } from "react";
import { Copy } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false)
const copyPrompt = async (text, index) => {
  await navigator.clipboard.writeText(text);

  setCopiedIndex(index);

  setTimeout(() => {
    setCopiedIndex(null);
  }, 2000);
};

  const [history, setHistory] = useState([
    "Explain DBMS with examples",
    "Write internship email",
    "Create startup pitch",
  ]);

  const [page, setPage] = useState("home");


  const examples = [
    "📚 Study notes",
    "💻 Coding help",
    "📧 Professional email",
    "🎤 Presentation ideas",
  ];

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

      setHistory((prev) => [input, ...prev]);
    } catch (err) {
      setResult("⚠ Error generating prompt");
    }

    setLoading(false);
  };

  const savePrompt = () => {
    if (!result) return;
    setSaved((prev) => [result, ...prev]);
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
  <div className="min-h-screen flex text-[#1f1f2e]">

  <div className="w-72 p-6 border-r border-[#d8d8e8]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-3xl"
        >
          ☰
        </button>

        {sidebarOpen && (
          <>
            <button
              onClick={() => setPage("home")}
              className="block mt-8"
            >
              🏠 Home
            </button>

            <button
              onClick={() => setPage("explore")}
              className="block mt-4"
            >
              🔍 Explore
            </button>

            <button
              onClick={() => setPage("templates")}
              className="block mt-4"
            >
              📂 Templates
            </button>
              <div className="flex flex-col h-full">

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
  </div>
  </div>

            </>
        )}
</div>

    )

{/* menu */}

      <div className="flex-1 p-10 overflow-y-auto">
        {page !== "home" ? (
          renderPage()
        ) : (
          <>
            <h1 className="text-6xl font-bold text-center">
              ContextPrompt AI
            </h1>

            <p className="text-center mt-4 opacity-80">
                Where ideas learn to speak AI 🪐
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {examples.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setInput(item)}
                  className="px-4 py-2 rounded-full bg-white/10"
                >
                  {item}
                </button>
              ))}
            </div>
  <div className="max-w-4xl mx-auto mt-10">
  <div
    className="
      bg-white/10
      backdrop-blur-xl
      border border-white/20
      shadow-2xl
      rounded-3xl
      p-6
    "
  >
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      rows={4}
      placeholder="Describe your idea..."
      className="w-full bg-transparent outline-none resize-none text-lg"
    />

    <div className="flex justify-end mt-3">
      <button
        onClick={generatePrompt}
        className="px-6 py-3 rounded-xl bg-white text-black font-semibold"
      >
        ✨ Generate
      </button>
    </div>
  </div>
</div>

          {result.length > 0 && (
  <div className="max-w-5xl mx-auto mt-10">

  <div className="grid gap-6">
  {result.map((item, index) => (
    <div
      key={index}
      className="bg-white/10 p-6 rounded-3xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
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
}
