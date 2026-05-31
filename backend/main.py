from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# LOAD ENV
load_dotenv()

# FASTAPI
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GROQ CLIENT
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# MONGODB CONNECTION
# MONGODB CONNECTION
mongo = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsAllowInvalidCertificates=True
)

db = mongo["contextpromptai"]

collection = db["prompts"]

# REQUEST MODEL
class PromptRequest(BaseModel):
    prompt: str
    category: str

# GENERATE ROUTE
@app.post("/generate")
async def generate(data: PromptRequest):

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""
Generate 3 high-quality AI prompts for:

{data.prompt}

Category:
{data.category}

Return clean readable prompts.
"""
            }
        ]
    )

    result = completion.choices[0].message.content

    prompt_data = {
        "prompt": data.prompt,
        "category": data.category,
        "result": result
    }

    # SAVE TO DATABASE
    collection.insert_one(prompt_data)

    return {
        "prompts": [
            {
                "id": 1,
                "label": "AI Generated",
                "color": "mint",
                "text": result
            }
        ]
    }