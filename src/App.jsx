import os, requests, json, threading, re, time, io, uuid, logging
from datetime import datetime as date
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from pydub import AudioSegment
from pydub.generators import WhiteNoise
import jwt

# --- [CONFIG] ---
BASE_DIR = "/home/cassandrafiles"
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")
MUSIC_FILE = os.path.join(BASE_DIR, "intro_theme.mp3")
LOG_FILE = os.path.join(BASE_DIR, "cassandra_debug.log")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

TRANSISTOR_KEY = "JCkOGuKj2z5De2fRE-Y-sA"
TRANSISTOR_SHOW_ID = "75952"
GHOST_ADMIN_KEY = "6990a859f1008e0001515e60:990fc746b817a062324410da692206290f6b81a5445e454e54a997109af71055"
MAKE_LIBRARIAN_URL = "https://hook.eu2.make.com/fft1ozfafc1ho74sd8qqcw8x6gb4e4lk"

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s v12.01: %(message)s', force=True)

app = Flask(__name__)
CORS(app)

PRODUCTION_STATE = {
    "status": "Idle", "last_ep": "None", "last_error": "None",
    "stages": {"voice": "pending", "mixing": "pending", "transistor": "pending", "ghost": "pending", "librarian": "pending"}
}

def generate_cartesia_audio(voice_chunks, api_key):
    url = "https://api.cartesia.ai/tts/bytes"
    headers = {"Cartesia-Version": "2024-06-10", "X-API-Key": api_key, "Content-Type": "application/json"}
    segments = []
    for chunk in voice_chunks:
        data = {"model_id": "sonic-3", "transcript": chunk.get('content', ''), "voice": {"mode": "id", "id": chunk.get('voice_id')}, "output_format": {"container": "wav", "encoding": "pcm_f32le", "sample_rate": 44100}}
        try:
            res = requests.post(url, headers=headers, json=data, timeout=120)
            if res.status_code == 200: segments.append(AudioSegment.from_wav(io.BytesIO(res.content)))
        except: pass
    return segments

def mix_podcast(voice_segments):
    if not voice_segments or len(voice_segments) < 2: return None
    theme = (AudioSegment.from_file(MUSIC_FILE) - 15) if os.path.exists(MUSIC_FILE) else None
    
    # CORRECT INSTANTIATION: Uses the WhiteNoise class properly
    hiss = WhiteNoise().to_audio_segment(duration=10000).apply_gain(-50)
    
    proc_segs = [s.overlay(hiss, loop=True) for s in voice_segments]
    first, last = proc_segs[0], proc_segs[-1]

    # INTRO: Overlap
    intro_dur = len(first) + 3500
    intro_music = theme[:intro_dur].fade_out(2500) if theme else AudioSegment.silent(duration=intro_dur)
    mixed_intro = intro_music.overlay(first, position=1000)

    # BODY
    middle = AudioSegment.empty()
    for s in proc_segs[1:-1]: middle += s + AudioSegment.silent(duration=700)

    # OUTRO: Overlap Reversed
    if theme:
        outro_dur = len(last) + 5500
        outro_m = theme.reverse()[:outro_dur].reverse().fade_in(1000).fade_out(3500)
        mixed_outro = outro_m.overlay(last, position=500)
    else: mixed_outro = last

    return mixed_intro + AudioSegment.silent(duration=1000) + middle + mixed_outro

def push_to_transistor(filepath, title, summary):
    headers = {"x-api-key": TRANSISTOR_KEY}
    try:
        f_name = os.path.basename(filepath)
        auth = requests.get(f"https://api.transistor.fm/v1/episodes/authorize_upload?filename={f_name}", headers=headers).json()
        up_url, audio_url = auth['data']['attributes']['upload_url'], auth['data']['attributes']['audio_url']
        with open(filepath, 'rb') as f: requests.put(up_url, data=f, headers={'Content-Type': 'audio/mpeg'})
        payload = {"episode[show_id]": TRANSISTOR_SHOW_ID, "episode[title]": title, "episode[summary]": summary, "episode[audio_url]": audio_url}
        res = requests.post("https://api.transistor.fm/v1/episodes", headers=headers, data=payload)
        return res.json()['data']['attributes'].get('share_url', '').split('/')[-1] if res.status_code in [200, 201] else None
    except: return None

def process_audit_thread(data):
    ep_id = data.get('ep_id', "S00E00")
    try:
        bundled = data.get('bundled_payload') or data
        ep_title = bundled.get('episode_title', "Audit")
        full_transcript = bundled.get('full_transcript', "")
        clean_title = re.sub(r'[^a-zA-Z0-9]', '_', str(ep_title))
        filepath = os.path.join(DOWNLOAD_DIR, f"{clean_title}.mp3")

        PRODUCTION_STATE.update({"status": "Active", "last_ep": ep_title})
        for k in PRODUCTION_STATE["stages"]: PRODUCTION_STATE["stages"][k] = "pending"

        # VOICE & MIX
        PRODUCTION_STATE["stages"]["voice"] = "progress"
        v_segs = generate_cartesia_audio(bundled.get('payload', []), bundled.get('api_key', ''))
        PRODUCTION_STATE["stages"]["voice"] = "complete"

        PRODUCTION_STATE["stages"]["mixing"] = "progress"
        mixed = mix_podcast(v_segs)
        if not mixed: raise Exception("KILL: Mixer failed.")
        mixed.export(filepath, format="mp3", bitrate="192k")
        PRODUCTION_STATE["stages"]["mixing"] = "complete"

        # TRANSISTOR
        PRODUCTION_STATE["stages"]["transistor"] = "progress"
        share_id = push_to_transistor(filepath, ep_title, bundled.get('podcast_show_notes', ''))
        PRODUCTION_STATE["stages"]["transistor"] = "complete"

        # GHOST SYNC (Mandatory updated_at lock)
        PRODUCTION_STATE["stages"]["ghost"] = "progress"
        post_ids = bundled.get('post_ids', {})
        meta = bundled.get('metadata', {})
        for persona, post_json in post_ids.items():
            p_data = json.loads(post_json) if isinstance(post_json, str) else post_json
            if 'posts' in p_data: p_data = p_data['posts'][0]
            
            embed = f'<iframe width="100%" height="180" frameborder="no" scrolling="no" src="https://share.transistor.fm/e/{share_id}"></iframe>'
            html = embed + p_data.get('html', '') + f'<hr><h4>[TRANSCRIPT]</h4><pre style="white-space:pre-wrap;">{full_transcript}</pre>'
            
            kid, secret = GHOST_ADMIN_KEY.split(':')
            token = jwt.encode({'iat': int(time.time()), 'exp': int(time.time()) + 300, 'aud': '/admin/'}, bytes.fromhex(secret), algorithm='HS256', headers={'alg': 'HS256', 'typ': 'JWT', 'kid': kid})
            
            requests.put(f"https://the-cassandra-files.ghost.io/ghost/api/admin/posts/{p_data['id']}/", 
                        headers={'Authorization': f'Ghost {token}'}, 
                        json={"posts": [{
                            "id": p_data['id'], "status": "published", "html": html,
                            "updated_at": p_data.get('updated_at')
                        }]})
        PRODUCTION_STATE["stages"]["ghost"] = "complete"

        # LIBRARIAN
        PRODUCTION_STATE["stages"]["librarian"] = "progress"
        requests.post(MAKE_LIBRARIAN_URL, json={"status": "Complete", "ep_id": ep_id, "share_id": share_id})
        PRODUCTION_STATE["stages"]["librarian"] = "complete"
        PRODUCTION_STATE["status"] = "Idle"
    except Exception as e:
        PRODUCTION_STATE["status"] = "Killed"
        PRODUCTION_STATE["last_error"] = str(e)
        for k, v in PRODUCTION_STATE["stages"].items():
            if v == "progress": PRODUCTION_STATE["stages"][k] = "error"
        requests.post(MAKE_LIBRARIAN_URL, json={"status": "Failed", "ep_id": ep_id, "reason": str(e)})

@app.route('/start_audit', methods=['POST', 'GET'])
def start_audit():
    if request.method == 'GET': return "KERNEL_v12.01_READY"
    threading.Thread(target=process_audit_thread, args=(request.json or {},)).start()
    return jsonify({"status": "Transmitted"})

@app.route('/')
def monitor():
    return render_template_string("""
    <body style="background:#0a0c0e; color:#00ffcc; font-family:monospace; padding:40px;">
        <h1>Cassandra_Kernel_v12.01</h1>
        <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:15px; margin:30px 0;">
            {% for stage, status in state.stages.items() %}
            <div style="border:1px solid #1a1a1a; padding:20px; text-align:center; background:{{ '#003311' if status=='complete' else '#440000' if status=='error' else '#001122' if status=='progress' else '#111' }};">
                <b>{{ stage.upper() }}</b><br><small>{{ status }}</small>
            </div>
            {% endfor %}
        </div>
        <div style="background:#111; padding:30px; border:1px solid #1a1a1a;">
            <div><b>STATUS:</b> <span style="color:{{ '#ff4444' if state.status=='Killed' else '#00ffcc' }}">{{ state.status }}</span></div>
            <div><b>ACTIVE_EPISODE:</b> {{ state.last_ep }}</div>
            <div style="color:#ff6666;"><b>LOG:</b> {{ state.last_error }}</div>
        </div>
    </body>""", state=PRODUCTION_STATE)

if __name__ == '__main__': app.run(debug=True)
