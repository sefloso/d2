import json
import re
from collections import defaultdict

def normalize_title(title):
    # Remove common suffixes and parenthetical information
    patterns = [
        r'\s*\(Demo\).*',
        r'\s*\(Live.*?\).*',
        r'\s*- Live.*',
        r'\s*\(Remastered\).*',
        r'\s*\(Acoustic\).*',
    ]
    
    normalized = title
    for pattern in patterns:
        normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE)
    
    return normalized.strip()

def clean_lyrics(lyrics):
    # ... (keep the existing clean_lyrics function)
    # Remove [Verse 1], [Chorus], etc.
    lyrics = re.sub(r'\[.*?\]', '', lyrics)
    
    # Remove line numbers (e.g., "1.", "2.", etc.)
    lyrics = re.sub(r'^\d+\.?\s*', '', lyrics, flags=re.MULTILINE)
    
    # Remove "Lyrics" from the beginning if present
    lyrics = re.sub(r'^.*?Lyrics', '', lyrics, flags=re.DOTALL)
    
    # Remove "Embed" from the end if present
    lyrics = re.sub(r'Embed$', '', lyrics)
    
    # Remove "You might also like" and everything after it
    lyrics = re.sub(r'You might also like.*', '', lyrics, flags=re.DOTALL)
    
    # Remove extra whitespace and newlines
    lyrics = re.sub(r'\n+', '\n', lyrics.strip())
    
    # Split into lines and keep only the first 5
    lines = lyrics.split('\n')
    return lines[:5]

# Read the JSON file
with open('mountain_goats_songs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Group songs by normalized title
song_groups = defaultdict(list)
for song in data:
    # remove jordan lake sessions
    if 'jordan lake' in song['title'].lower():
        continue
    # remove instrumental songs
    elif 'ContributorsThis song is an instrumental' in song['lyrics']:
        continue
    normalized_title = normalize_title(song['title'])
    song_groups[normalized_title].append(song)

# Select the best version of each song
cleaned_data = []
for normalized_title, versions in song_groups.items():
    # Sort versions by title length and select the shortest (assumed to be the original)
    best_version = min(versions, key=lambda x: len(x['title']))
    
    cleaned_lyrics = clean_lyrics(best_version['lyrics'])
    
    if cleaned_lyrics:  # Only add songs with non-empty lyrics
        cleaned_data.append({
            'title': best_version['title'],
            'lyrics': cleaned_lyrics
        })

# Save the cleaned data back to a JSON file
with open('cleaned_mountain_goats_songs.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

print(f"Cleaned data saved. Original count: {len(data)}, Cleaned count: {len(cleaned_data)}")