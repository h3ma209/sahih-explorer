import pandas as pd
import json
import os
import re

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

ARABIC_SOURCE_MAP = {
    'Sahih Bukhari': 'ara-bukhari.min.json',
    'Sahih Muslim': 'ara-muslim.min.json',
    "Sunan Abi Da'ud": 'ara-abudawud.min.json',
    "Jami' al-Tirmidhi": 'ara-tirmidhi.min.json',
    "Sunan an-Nasa'i": 'ara-nasai.min.json',
    'Sunan Ibn Majah': 'ara-ibnmajah.min.json'
}

def remove_tashkeel(text):
    """Remove Arabic diacritics."""
    tashkeel = re.compile(r'[\u0617-\u061A\u064B-\u0652]')
    return tashkeel.sub('', text)

def normalize_arabic(text):
    """Normalize Arabic text for matching."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = remove_tashkeel(text)
    text = re.sub(r'\s+', '', text)
    text = re.sub(r'[^\w]', '', text)
    return text

def load_translations_by_number(source_name):
    """Load English translations indexed by hadith number."""
    if source_name not in SOURCE_MAP:
        return {}
    
    eng_path = os.path.join(JSON_DIR, SOURCE_MAP[source_name])
    
    if not os.path.exists(eng_path):
        return {}
    
    with open(eng_path, 'r', encoding='utf-8') as f:
        eng_data = json.load(f)
    
    eng_hadiths = eng_data.get('hadiths', [])
    
    # Create mapping by hadith number
    by_number = {}
    for h in eng_hadiths:
        num = h.get('hadithnumber')
        text = h.get('text', '')
        if num and text:
            by_number[num] = text
    
    return by_number

def load_arabic_to_english_map(source_name):
    """Load mapping from Arabic text to English text."""
    if source_name not in ARABIC_SOURCE_MAP:
        return {}
    
    ara_path = os.path.join(JSON_DIR, ARABIC_SOURCE_MAP[source_name])
    eng_path = os.path.join(JSON_DIR, SOURCE_MAP[source_name])
    
    if not os.path.exists(ara_path) or not os.path.exists(eng_path):
        return {}
    
    with open(ara_path, 'r', encoding='utf-8') as f:
        ara_data = json.load(f)
    with open(eng_path, 'r', encoding='utf-8') as f:
        eng_data = json.load(f)
    
    ara_hadiths = ara_data.get('hadiths', [])
    eng_hadiths = eng_data.get('hadiths', [])
    
    eng_by_num = {h.get('hadithnumber'): h.get('text', '') for h in eng_hadiths}
    
    ara_to_eng = {}
    for h in ara_hadiths:
        ara_text = h.get('text', '')
        ref = h.get('hadithnumber')
        
        if ara_text and ref and ref in eng_by_num and eng_by_num[ref]:
            norm_ara = normalize_arabic(ara_text)
            if norm_ara:
                ara_to_eng[norm_ara] = eng_by_num[ref]
    
    return ara_to_eng

def main():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    df['source'] = df['source'].str.strip()
    
    total_updated = 0
    
    for source_name in SOURCE_MAP.keys():
        print(f"\n{'='*60}")
        print(f"Processing {source_name}")
        print('='*60)
        
        # Method 1: Match by hadith number
        print("Method 1: Matching by hadith number...")
        by_number = load_translations_by_number(source_name)
        print(f"  Loaded {len(by_number)} translations from JSON")
        
        mask = (df['source'] == source_name) & (df['text_en'].isna())
        method1_count = 0
        
        for idx in df[mask].index:
            hadith_no = str(df.at[idx, 'hadith_no']).strip()
            
            # Try to convert to int for matching
            try:
                hadith_num = int(hadith_no)
                if hadith_num in by_number:
                    df.at[idx, 'text_en'] = by_number[hadith_num]
                    method1_count += 1
            except:
                pass
        
        print(f"  Updated {method1_count} rows via hadith number")
        total_updated += method1_count
        
        # Method 2: Match by Arabic text (for remaining)
        print("Method 2: Matching by Arabic text...")
        ara_to_eng = load_arabic_to_english_map(source_name)
        print(f"  Loaded {len(ara_to_eng)} Arabic→English mappings")
        
        mask = (df['source'] == source_name) & (df['text_en'].isna()) & (df['text_ar'].notna())
        method2_count = 0
        
        for idx in df[mask].index:
            ara_text = df.at[idx, 'text_ar']
            norm_ara = normalize_arabic(ara_text)
            
            if norm_ara in ara_to_eng:
                df.at[idx, 'text_en'] = ara_to_eng[norm_ara]
                method2_count += 1
        
        print(f"  Updated {method2_count} rows via Arabic matching")
        total_updated += method2_count
        
        # Show remaining missing for this source
        still_missing = df[(df['source'] == source_name) & (df['text_en'].isna())]
        print(f"  Still missing: {len(still_missing)}")

    print(f"\n{'='*60}")
    print(f"TOTAL UPDATED: {total_updated}")
    print('='*60)
    
    # Save
    print(f"\nSaving to {CSV_PATH}...")
    df.to_csv(CSV_PATH, index=False)
    print("Done!")
    
    # Final stats
    total_missing = df['text_en'].isna().sum()
    print(f"\nFinal missing: {total_missing}/{len(df)} ({100*total_missing/len(df):.2f}%)")

if __name__ == "__main__":
    main()
