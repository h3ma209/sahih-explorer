import pandas as pd
import json
import os

# Configuration
# Assuming running from sahih-explorer root
CSV_PATH = '../data(good)/all_hadiths_clean.csv'
SEARCH_INDEX_PATH = 'public/data/search-index.json'
OUTPUT_PATH = 'public/data/hadith-index.json'
LIMIT = 1000  # For prototype performance

def load_scholar_map():
    """Load search index to map IDs to scholar details"""
    print(f"Loading scholar map from {SEARCH_INDEX_PATH}...")
    if not os.path.exists(SEARCH_INDEX_PATH):
        print(f"Error: {SEARCH_INDEX_PATH} not found.")
        return {}
        
    with open(SEARCH_INDEX_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # Create map: ID (str) -> Scholar Dict
        return {str(item['id']): item for item in data}

def clean_text(text):
    if pd.isna(text):
        return ""
    return str(text).strip()

def process_hadiths():
    scholar_map = load_scholar_map()
    print(f"Loaded {len(scholar_map)} scholars.")

    print(f"Reading CSV from {CSV_PATH}...")
    try:
        df = pd.read_csv(CSV_PATH)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    hadiths = []
    
    # Process rows
    count = 0
    for _, row in df.iterrows():
        if count >= LIMIT:
            break
            
        # Parse chain IDs
        chain_str = str(row.get('chain_indx', ''))
        chain_ids = [cid.strip() for cid in chain_str.split(',') if cid.strip().isdigit()]
        
        # Build Narrator Objects
        narrators = []
        for sid in chain_ids:
            if sid in scholar_map:
                s = scholar_map[sid]
                narrators.append({
                    "id": str(s['id']),
                    "name": s['name'],
                    "grade": s.get('grade', 'Unknown'),
                    "death_year": s.get('death_year', '')
                })
            else:
                # Fallback for unknown IDs
                narrators.append({
                    "id": sid,
                    "name": f"Unknown Scholar ({sid})",
                    "grade": "Unknown",
                    "death_year": ""
                })

        hadith = {
            "id": f"h{row['hadith_id']}",
            "source": clean_text(row.get('source', 'Unknown Book')),
            "book": clean_text(row.get('source', '')), # Alias for UI compatibility
            "hadith_no": clean_text(row.get('hadith_no', '')),
            "chapter_no": clean_text(row.get('chapter_no', '')),
            "chapter": clean_text(row.get('chapter', '')),
            "matn": clean_text(row.get('text_ar', '')),
            "matn_en": clean_text(row.get('text_en', '')),
            "narrators": narrators
        }
        
        hadiths.append(hadith)
        count += 1

    print(f"Processed {len(hadiths)} hadiths.")
    
    # Save JSON
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(hadiths, f, ensure_ascii=False, indent=2)
    print(f"Saved index to {OUTPUT_PATH}")

if __name__ == "__main__":
    process_hadiths()
