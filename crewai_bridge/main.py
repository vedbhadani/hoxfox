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
        # Note: CrewAI result.raw is the string output. 
        # We attempt to find JSON for the playlist and treat the rest as the report.
        raw_output = result.raw
        
        playlist = []
        report = None
        
        # Simple extraction logic: look for the first '[' and last ']'
        try:
            start_idx = raw_output.find('[')
            end_idx = raw_output.rfind(']') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = raw_output[start_idx:end_idx]
                playlist = json.loads(json_str)
                # The rest is the report
                report = raw_output.replace(json_str, "").strip()
            else:
                report = raw_output
        except:
            report = raw_output

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
