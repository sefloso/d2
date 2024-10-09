import pandas as pd
import re
import json

# Read the JSON file
with open('mountain_goats_songs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Convert to DataFrame
df = pd.DataFrame(data)

# Function to clean lyrics
def clean_lyrics(lyrics):
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

# Apply the cleaning function to the 'lyrics' column
df['lyrics'] = df['lyrics'].apply(clean_lyrics)

# Remove songs with empty lyrics
df = df[df['lyrics'].apply(len) > 0]

# Convert DataFrame back to list of dictionaries
cleaned_data = df.to_dict('records')

# Save the cleaned data back to a JSON file
with open('cleaned_mountain_goats_songs.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

print("Lyrics cleaned and saved to cleaned_mountain_goats_songs.json")