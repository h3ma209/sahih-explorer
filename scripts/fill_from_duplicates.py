import pandas as pd
import json

CSV_PATH = 'data-processing/data/all_hadiths_clean.csv'

def main():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    
    # 1. Build translation memory from rows that have both Arabic and English
    print("Building Arabic->English translation memory...")
    ar_to_en = {}
    valid_count = 0
    
    for idx, row in df.iterrows():
        if pd.notna(row['text_ar']) and pd.notna(row['text_en']):
            ar = row['text_ar'].strip()
            en = row['text_en']
            
            # Avoid using our own previous AI placeholder/disclaimer translations as source
            # The user complained about these, so we filter them out
            if '[AI-Generated' not in en and '[AI Translation' not in en:
                ar_to_en[ar] = en
                valid_count += 1
                
    print(f"Indexed {len(ar_to_en)} valid translations.")
    
    # 2. Fill missing English translations using the memory
    print("Filling missing translations...")
    filled_count = 0
    missing_before = df['text_en'].isna().sum() + df['text_en'].astype(str).str.contains('AI-Generated').sum()
    
    # We iterate through all rows to also overwrite the AI-generated ones we just added
    for idx, row in df.iterrows():
        current_en = str(row['text_en'])
        
        # Check if missing OR if it's one of our AI placeholders
        is_missing = pd.isna(row['text_en'])
        is_ai_placeholder = '[AI-Generated' in current_en or '[AI Translation' in current_en
        
        if (is_missing or is_ai_placeholder) and pd.notna(row['text_ar']):
            ar = row['text_ar'].strip()
            if ar in ar_to_en:
                df.at[idx, 'text_en'] = ar_to_en[ar]
                filled_count += 1
    
    print(f"Filled/Overwrote {filled_count} entries with existing translations from duplicates.")
    
    # 3. Save
    df.to_csv(CSV_PATH, index=False)
    print("Saved to CSV.")
    
    # Final check
    final_missing = df['text_en'].isna().sum()
    print(f"Final missing count: {final_missing}")

if __name__ == "__main__":
    main()
