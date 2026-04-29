import requests
import json
from crewai.tools import BaseTool
from pydantic import Field
from typing import List, Optional

class SpotifyRecommendationTool(BaseTool):
    name: str = "Spotify Recommendation Tool"
    description: str = "Fetch track recommendations from Spotify based on seed tracks and audio feature targets."

    def _run(self, seed_track_ids: List[str], target_energy: float, target_valence: float, target_tempo: float, spotify_access_token: str, limit: int = 20) -> str:
        """
        Calls Spotify GET /v1/recommendations.
        """
        url = "https://api.spotify.com/v1/recommendations"
        params = {
            "seed_tracks": ",".join(seed_track_ids),
            "target_energy": target_energy,
            "target_valence": target_valence,
            "target_tempo": target_tempo,
            "limit": limit
        }
        headers = {
            "Authorization": f"Bearer {spotify_access_token}"
        }

        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()

            tracks = []
            for item in data.get("tracks", []):
                tracks.append({
                    "title": item.get("name"),
                    "artist": item.get("artists")[0].get("name") if item.get("artists") else "Unknown",
                    "album": item.get("album").get("name") if item.get("album") else "Unknown",
                    "year": item.get("album").get("release_date", "")[:4] if item.get("album") else "N/A",
                    "energy": "N/A",
                    "valence": "N/A",
                    "tempo": "N/A",
                    "spotify_id": item.get("id"),
                    "uri": item.get("uri")
                })
            return json.dumps(tracks)
        except Exception as e:
            return json.dumps({"error": str(e)})

