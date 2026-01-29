import pandas as pd
import os
import re

def sanitize_filename(name):
    """
    Sanitize the string to be safe for filenames.
    Replaces non-alphanumeric characters (except space, dot, hyphen) with underscore.
    """
    # Remove characters that are unsafe for filenames
    safe_name = re.sub(r'[^\w\s\.\-]', '', name)
    return safe_name.strip()

def clean_text(text):
    """
    Clean text by removing newlines, extra spaces, and other artifacts.
    """
    if not isinstance(text, str):
        return ""
    # Replace newlines and tabs with space
    text = text.replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    # Collapse multiple spaces into one
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

    return text.strip()

def clean_narrator(text):
    """
    Remove 'Narrated by' prefixes and clean.
    """
    text = clean_text(text)
    # Remove "Narrated by" or "Narrated" (case insensitive)
    text = re.sub(r'^narrated\s+by\s+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'^narrated\s+', '', text, flags=re.IGNORECASE)
    return text.strip()

def get_category(book_name):
    """
    Extract category from book name by removing leading numbers and dots.
    E.g., "1. Revelation" -> "Revelation"
    """
    # Remove leading digits and dot and spaces
    return re.sub(r'^\d+\.\s*', '', book_name).strip()

def process_sahih_bukhari():
    input_file = "sahih_bukhari.json"
    output_file = "sahih_bukhari_complete.csv"
    
    print(f"Reading {input_file}...")
    try:
        df = pd.read_json(input_file)
    except ValueError as e:
        print(f"Error reading JSON: {e}")
        return

    all_data = []
    global_id = 1

    for index, row in df.iterrows():
        volume_name = row['name']
        books = row['books']
        
        for book in books:
            book_name = book.get('name', 'Unknown Book')
            category = get_category(book_name)
            hadiths = book.get('hadiths', [])
            
            if not hadiths:
                continue
                
            for hadith in hadiths:
                entry = {
                    'id': global_id,
                    'volume': volume_name,
                    'book': book_name,
                    'category': category,
                    'info': clean_text(hadith.get('info', '')),
                    'narrated_by': clean_narrator(hadith.get('by', '')),
                    'text': clean_text(hadith.get('text', ''))
                }
                all_data.append(entry)
                global_id += 1
            
    # Create DataFrame
    full_df = pd.DataFrame(all_data)
    
    # Write to CSV
    full_df.to_csv(output_file, index=False)
    
    print(f"\nProcessing complete.")
    print(f"Total Hadiths processed: {len(all_data)}")
    print(f"File saved to: {os.path.abspath(output_file)}")

if __name__ == "__main__":
    process_sahih_bukhari()
