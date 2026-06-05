import os
import re
print("ENV CHECK:", os.path.exists(".env"))
print("KEY CHECK:", os.getenv("GROQ_API_KEY"))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from pymongo import MongoClient

# LOAD ENV
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).parent / ".env"

load_dotenv(dotenv_path=env_path)

print("ENV PATH:", env_path)
print("ENV EXISTS:", env_path.exists())
print("GROQ KEY LOADED:", bool(os.getenv("GROQ_API_KEY")))
print("RAW KEY:", repr(os.getenv("GROQ_API_KEY")))

app = FastAPI()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 👇 MUST BE IMMEDIATELY AFTER app creation
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://context-prompt-ai.vercel.app",
        "https://context-prompt-ai-1.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GROQ CLIENT
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise Exception("GROQ_API_KEY missing in .env")

client = Groq(api_key=api_key)


# REQUEST MODEL
class PromptRequest(BaseModel):
    prompt: str
    category: str
    email: str
    tone: str

# -----------------------
# GENERATE ROUTE
# -----------------------
@app.post("/generate")
async def generate(data: PromptRequest):

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""
You are a world-class prompt engineer.

Generate 3 HIGH-QUALITY prompts for the following request.

Topic: {data.prompt}
Category: {data.category}
Tone: {data.tone}

Requirements:

Prompt 1 = Quick Prompt
- Concise but complete
- Include a role
- Include the main objective
- Include 2-3 key requirements
- Ready to use immediately

Prompt 2 = Detailed Prompt
- Include role
- Include context
- Include clear instructions
- Include expected output

Prompt 3 = Expert Prompt
- Advanced prompt engineering
- Include role, objective, constraints
- Include step-by-step reasoning
- Include output format
- Maximize response quality

Each prompt must be significantly different.

Return exactly:

Prompt 1
[prompt]

Prompt 2
[prompt]

Prompt 3
[prompt]

Do not explain anything.
Only return the prompts.
"""
            }
        ]
    )

    result = completion.choices[0].message.content

    # ✅ MUST BE INSIDE FUNCTION
    quick = ""
    detailed = ""
    expert = ""

    quick_match = re.search(r"Prompt 1\s*(.*?)(?=Prompt 2)", result, re.S)
    detailed_match = re.search(r"Prompt 2\s*(.*?)(?=Prompt 3)", result, re.S)
    expert_match = re.search(r"Prompt 3\s*(.*)", result, re.S)

    if quick_match:
        quick = quick_match.group(1).strip()

    if detailed_match:
        detailed = detailed_match.group(1).strip()

    if expert_match:
        expert = expert_match.group(1).strip()

    return {
        "prompts": [
            {
                "title": "Quick Prompt",
                "text": quick
            },
            {
                "title": "Detailed Prompt",
                "text": detailed
            },
            {
                "title": "Expert Prompt",
                "text": expert
            }
        ]
    }