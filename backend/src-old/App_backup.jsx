import { useState } from "react"
import axios from "axios"
import "./App.css"

function App() {

  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")

  const generatePrompt = async () => {

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/generate",
        {
          prompt: input
        }
      )

      setResponse(res.data.response || "No response received")

    } catch (error) {

      console.log(error)
      setResponse("Error generating prompt")

    }
  }

  return (
    <div className="container">

      <h1>ContextPrompt AI</h1>

      <textarea
        placeholder="Enter topic..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={generatePrompt}>
        Generate Prompt
      </button>

      <div className="response-box">
        {response}
      </div>

    </div>
  )
}

export default App