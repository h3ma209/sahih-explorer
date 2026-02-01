import pandas as pd
import json

# File paths
CSV_PATH = 'data-processing/data/all_hadiths_clean.csv'

# Map source names to sunnah.com collection names
SOURCE_MAP = {
    'Sahih Bukhari': 'bukhari',
    'Sahih Muslim': 'muslim',
    "Sunan Abi Da'ud": 'abudawud',
    "Jami' al-Tirmidhi": 'tirmidhi',
    "Sunan an-Nasa'i": 'nasai',
    'Sunan Ibn Majah': 'ibnmajah'
}

def main():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    
    # Get all missing English translations
    missing_mask = df['text_en'].isna()
    missing_df = df[missing_mask].copy()
    
    print(f"Found {len(missing_df)} hadiths without English translation\n")
    
    # Group by source
    for source in missing_df['source'].unique():
        source_missing = missing_df[missing_df['source'] == source]
        print(f"{source}: {len(source_missing)} missing")
    
    # Export list for manual review
    export_data = []
    for idx, row in missing_df.iterrows():
        collection = SOURCE_MAP.get(row['source'], '')
        hadith_no = str(row['hadith_no']).strip()
        
        export_data.append({
            'csv_id': int(row['id']),
            'source': row['source'],
            'hadith_no': hadith_no,
            'chapter': row['chapter'],
            'sunnah_com_url': f'https://sunnah.com/{collection}:{hadith_no}' if collection else '',
            'arabic_preview': str(row['text_ar'])[:100] if pd.notna(row['text_ar']) else ''
        })
    
    with open('missing_translations.json', 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nExported {len(export_data)} missing translations to missing_translations.json")
    print("Each entry includes a sunnah.com URL for manual lookup if needed.")

if __name__ == "__main__":
    main()
