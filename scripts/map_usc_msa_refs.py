import pandas as pd
import json
import re
import os

# File paths
CSV_PATH = 'data-processing/data/all_hadiths_clean.csv'
JSON_DIR = 'data-processing/data/json_source'

# Mapping from CSV source name to JSON filename
SOURCE_MAP = {
    'Sahih Bukhari': 'eng-bukhari.min.json',
    'Sahih Muslim': 'eng-muslim.min.json',
    "Sunan Abi Da'ud": 'eng-abudawud.min.json',
    "Jami' al-Tirmidhi": 'eng-tirmidhi.min.json',
    "Sunan an-Nasa'i": 'eng-nasai.min.json',
    'Sunan Ibn Majah': 'eng-ibnmajah.min.json'
}

# Arabic source map for fallback or primary use
ARABIC_SOURCE_MAP = {
    'Sahih Muslim': 'ara-muslim.min.json'
}

def remove_tashkeel(text):
    # Basic Tashkeel removal
    tashkeel = re.compile(r'[\u0617-\u061A\u064B-\u0652]')
    return tashkeel.sub('', text)


def normalize_text(text):
    if not isinstance(text, str):
        return ""
    # Remove HTML tags if any (basic check)
    text = re.sub(r'<[^>]+>', '', text)
    # Remove Arabic symbols like ﷺ, ﷻ, etc. (Unicode range for Arabic Presentation Forms)
    text = re.sub(r'[\uFB50-\uFDFF\uFE70-\uFEFF]', '', text)
    # Standardize common variations
    text = text.replace('Apostle', 'Messenger')
    text = text.replace('apostle', 'messenger')
    # Remove all whitespace (including newlines, tabs, multiple spaces)
    text = re.sub(r'\s+', '', text)
    # Lowercase and keep only alphanumeric chars (for English)
    return re.sub(r'[^\w]', '', text.lower())

def normalize_arabic(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = remove_tashkeel(text)
    # Remove all whitespace
    text = re.sub(r'\s+', '', text)
    # Keep only word characters (includes Arabic)
    text = re.sub(r'[^\w]', '', text)
    return text

def load_json_map(json_filename):
    path = os.path.join(JSON_DIR, json_filename)
    if not os.path.exists(path):
        print(f"Warning: {path} not found.")
        return {}
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check structure: it seems to be "hadiths" key or list
    # Based on edtions.json it might be nested under 'hadiths'
    # Let's inspect a bit dynamically or assume structure from previous knowledge
    # Usually fawazahmed0 api returns { "hadiths": [ ... ] }
    
    hadiths = data.get('hadiths', [])
    text_map = {}
    is_arabic = 'ara-' in json_filename
    
    for h in hadiths:
        # Use 'text' key for text (English or Arabic depending on file)
        body = h.get('body') or h.get('text', '')
        ref = h.get('hadithnumber')
        
        if body and ref:
            if is_arabic:
                 norm = normalize_arabic(body)
            else:
                 norm = normalize_text(body)
            
            if norm:
                text_map[norm] = ref
    return text_map

def main():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    
    # Strip whitespace from source names
    df['source'] = df['source'].str.strip()
    
    # Ensure usc_msa_ref exists
    if 'usc_msa_ref' not in df.columns:
        df['usc_msa_ref'] = 0
    
    total_updated = 0
    
    for source_name in set(list(SOURCE_MAP.keys()) + list(ARABIC_SOURCE_MAP.keys())):
        # Determine which file to use. Prefer English if available and viable?
        # Actually for Muslim we found English missing in CSV.
        # So for Muslim use Arabic.
        
        json_file = None
        use_arabic = False
        
        if source_name in ARABIC_SOURCE_MAP and source_name == 'Sahih Muslim':
             json_file = ARABIC_SOURCE_MAP[source_name]
             use_arabic = True
        elif source_name in SOURCE_MAP:
             json_file = SOURCE_MAP[source_name]
             # For Bukhari, we want to OVERWRITE existing refs since they're wrong
             # For others, we skip if already populated
        
        if not json_file:
            continue
            
        print(f"Processing {source_name} using {json_file}...")
        
        # Load map
        ref_map = load_json_map(json_file)
        if not ref_map:
            continue
            
        # Filter rows for this source
        mask = (df['source'] == source_name)
        
        # Iterate and update
        # Vectorized apply might be faster but loop is clearer for debugging mixed types
        # We need to update specifically where mask is True
        
        updated_count = 0
        
        # Iterate over indices of the filtered rows
        for idx in df[mask].index:
            current_ref = df.at[idx, 'usc_msa_ref']
            
            # If already populated (and meaningful), maybe skip?
            # User request "Expanding", implying missing ones. 
            # But let's overwrite if it's 0 or empty to be safe, or if we trust this source more.
            # Let's write if it is 0 or NaN or empty string
            
            should_update = False
            
            # For Bukhari, ALWAYS update to fix incorrect numbering
            if source_name == 'Sahih Bukhari':
                should_update = True
            else:
                # For other books, only update if missing
                try:
                    if pd.isna(current_ref) or int(current_ref) == 0:
                        should_update = True
                except:
                    # If it's a string, maybe it's "0" or empty
                    if str(current_ref).strip() in ['0', '', 'nan']:
                        should_update = True

            if should_update:
                if use_arabic:
                     text_val = df.at[idx, 'text_ar']
                     norm_text = normalize_arabic(text_val)
                else:
                     text_val = df.at[idx, 'text_en']
                     norm_text = normalize_text(text_val)
                
                if norm_text in ref_map:
                    df.at[idx, 'usc_msa_ref'] = ref_map[norm_text]
                    updated_count += 1
        
        print(f"  Updated {updated_count} rows for {source_name}")
        total_updated += updated_count

    print(f"Total rows updated: {total_updated}")
    
    # Save
    out_path = CSV_PATH # Overwrite
    print(f"Saving to {out_path}...")
    df.to_csv(out_path, index=False)
    print("Done.")

if __name__ == "__main__":
    main()
