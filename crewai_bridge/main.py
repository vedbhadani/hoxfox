import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from crew_runner import EnterpriseAiMusicRecommendationSystemCrew

load_dotenv()

app = FastAPI()

class TrackInput(BaseModel):
    id: str
    name: str
    artists: List[str]
    genres: Optional[List[str]] = []
    clusters: Optional[List[str]] = []
    moodTags: Optional[List[str]] = []
    popularity: Optional[int] = 0
    score: float
    matchReasons: Optional[List[str]] = []

class RecommendRequest(BaseModel):
    music_request: str
    playlist_tracks: List[TrackInput]
    spotify_access_token: str
    generate_report: bool = False

class RecommendResponse(BaseModel):
    playlist: List[Dict[str, Any]] = []
    report: Optional[str] = None
    final_score: Optional[float] = None
    confidence_score: Optional[float] = None
    status: str
    error: Optional[str] = None

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    try:
        # 1. Select seed tracks (top 5 by score)
        sorted_tracks = sorted(request.playlist_tracks, key=lambda x: x.score, reverse=True)
        seed_tracks = sorted_tracks[:5]
        seed_ids = [t.id for t in seed_tracks]

        # 2. Build context (top 20 tracks)
        context_tracks = []
        for t in sorted_tracks[:20]:
            context_tracks.append({
                "id": t.id,
                "name": t.name,
                "artists": t.artists,
                "genres": t.genres,
                "clusters": t.clusters,
                "moodTags": t.moodTags
            })

        # 3. Build crew inputs
        inputs = {
            "music_request": request.music_request,
            "playlist_context": json.dumps(context_tracks),
            "seed_track_ids": ",".join(seed_ids),
            "spotify_access_token": request.spotify_access_token,
            "generate_report": str(request.generate_report)
        }

        # 4. Instantiate and kickoff crew
        crew_instance = EnterpriseAiMusicRecommendationSystemCrew().crew()
        result = crew_instance.kickoff(inputs=inputs)

        # 5. Parse result
        raw_output = result.raw
        playlist = []
        report = None

        # The final task output is a markdown report — the playlist lives in earlier tasks.
        # Search task outputs in reverse for the first one containing a clean_playlist or songs array.
        try:
            tasks_output = result.tasks_output if hasattr(result, 'tasks_output') else []
            
            for task_output in reversed(tasks_output):
                text = task_output.raw if hasattr(task_output, 'raw') else str(task_output)
                # Look for JSON with clean_playlist or songs key
                try:
                    # Strip markdown code fences if present
                    clean = text.replace('```json', '').replace('```', '').strip()
                    parsed = json.loads(clean)
                    if isinstance(parsed, dict):
                        if 'clean_playlist' in parsed and isinstance(parsed['clean_playlist'], list):
                            playlist = parsed['clean_playlist']
                            break
                        elif 'songs' in parsed and isinstance(parsed['songs'], list):
                            playlist = parsed['songs']
                            break
                        elif 'playlist' in parsed and isinstance(parsed['playlist'], list):
                            playlist = parsed['playlist']
                            break
                    elif isinstance(parsed, list) and len(parsed) > 0:
                        playlist = parsed
                        break
                except:
                    continue
        except Exception as parse_err:
            print(f"[main] result parsing warning: {parse_err}")

        # The final task (generate_final_report) raw output is the report
        report = raw_output if request.generate_report else None

        return RecommendResponse(
            playlist=playlist,
            report=report if request.generate_report else None,
            status="success"
        )

    except Exception as e:
        return RecommendResponse(
            status="error",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
