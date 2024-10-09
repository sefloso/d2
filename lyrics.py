import time
import json
from api_code import token
from lyricsgenius import Genius

# Configuration
GENIUS_ACCESS_TOKEN = token
ARTIST_NAME = "The Mountain Goats"
MAX_SONGS = None

def fetch_lyrics():
    genius = Genius(GENIUS_ACCESS_TOKEN)
    
    # Fetch the artist and their songs
    artist = genius.search_artist(ARTIST_NAME, max_songs=MAX_SONGS)
    
    # Prepare the data structure
    songs_data = []
    
    # Iterate through the songs and extract title and lyrics
    for song in artist.songs:
        songs_data.append({
            "title": song.title,
            "lyrics": song.lyrics
        })
        print(f"Fetched: {song.title}")
    
    # Save to a JSON file
    with open("mountain_goats_songs.json", "w", encoding="utf-8") as f:
        json.dump(songs_data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully saved data for {len(songs_data)} songs.")

if __name__ == "__main__":
    fetch_lyrics()