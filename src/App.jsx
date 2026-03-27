import os
import json
import random
import asyncio
import aiohttp
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai
from tinydb import TinyDB, Query

# --- [CREDENTIALS] ---
genai.configure(api_key="AIzaSyA50nT7Eb3z-34rB7dbQgib3U_NKx0Elm0")
DEEPGRAM_API_KEY = "3a7c16c4e200d9755030b744e8d16a146448ec62"

# --- [MODEL SELECTOR] ---
def get_apex():
    """LOCKED: Gemini 3.1 Pro Priority."""
    try:
        manifest = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        target = "models/gemini-3.1-pro"
        if target not in manifest:
            target = next((t for t in ['models/gemini-3.0-pro', 'models/gemini-1.5-pro'] if t in manifest), manifest[0])
        m_basic = genai.GenerativeModel(target)
        m_grounded = genai.GenerativeModel(model_name=target, tools=['google_search'])
        return m_basic, m_grounded, target
    except Exception:
        m = genai.GenerativeModel('models/gemini-2.5-flash')
        return m, m, "models/gemini-2.5-pro-emergency"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- [PERSISTENCE] ---
db = TinyDB('apex_db.json')
personas_table = db.table('personas')
seasons_table = db.table('seasons')

if not os.path.exists('static/podcasts'):
    os.makedirs('static/podcasts')
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- [SCHEMAS] ---
class PersonaCreate(BaseModel):
    name: str
    role: str
    description: str
    gender: str

class SeasonReconcile(BaseModel):
    topic: str
    relationship: str
    host_ids: list
    episodes_count: int
    target_runtime: int

# --- [ROUTES] ---

@app.get("/api/v2/persona/list")
async def list_personas():
    return personas_table.all()

@app.post("/api/v2/persona/create")
async def create_persona(req: PersonaCreate):
    m_basic, _, _ = get_apex()
    prompt = f"Create full MBTI, 30 anecdotes, and bio for {req.name} ({req.role}). Backstory: {req.description}. Return ONLY JSON: {{'mbti': '', 'anecdotes': [], 'bio': '', 'vocal_vibe': 'elitist|sarcastic|cynical|energetic'}}"
    response = m_basic.generate_content(prompt)
    details = json.loads(response.text)
    
    vibe = details.get('vocal_vibe', 'default')
    v_map = {
        "Female": {"elitist": "hera", "sarcastic": "stella", "default": "athena"},
        "Male": {"cynical": "orpheus", "energetic": "orion", "default": "zeus"},
        "Non-Binary": {"default": "stella"},
        "Fluid": {"default": "orpheus"}
    }
    pool = v_map.get(req.gender, v_map["Female"])
    voice_id = pool.get(vibe, pool["default"])

    new_p = {
        "id": str(random.randint(1000, 9999)), "name": req.name, "role": req.role,
        "description": req.description, "gender": req.gender, "mbti": details['mbti'],
        "voice_id": voice_id, "archive": details,
        "portrait": f"https://api.dicebear.com/7.x/bottts/svg?seed={req.name}"
    }
    personas_table.insert(new_p)
    return new_p

@app.post("/api/v2/season/reconcile")
async def reconcile_season(req: SeasonReconcile):
    _, m_grounded, _ = get_apex()
    hosts = [p for p in personas_table.all() if p['id'] in req.host_ids]
    prompt = f"Build {req.episodes_count} episodes for '{req.topic}'. Relationship: {req.relationship}. Hosts: {hosts[0]['name']} & {hosts[1]['name']}. 100% Factual. JSON list: [{{'node': 1, 'title': '', 'summary': ''}}]"
    response = m_grounded.generate_content(prompt)
    episodes = json.loads(response.text)
    
    for ep in episodes: ep.update({"id": f"ep_{random.randint(1000,9999)}", "acts": {}, "saved_brief": "", "audio_url": ""})
        
    season = {
        "id": str(random.randint(1000, 9999)), "title": req.topic, "rel": req.relationship,
        "target_runtime": req.target_runtime, "ep_count": req.episodes_count, "episodes": episodes
    }
    seasons_table.insert(season)
    return season

@app.get("/api/v2/season/list")
async def list_seasons(): return seasons_table.all()

@app.delete("/api/v2/delete/persona/{id}")
async def delete_p(id: str):
    personas_table.remove(Query().id == id)
    return {"status": "ok"}

@app.delete("/api/v2/delete/season/{id}")
async def delete_s(id: str):
    seasons_table.remove(Query().id == id)
    return {"status": "ok"}
