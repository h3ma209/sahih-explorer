import csv
import json
import re
import os
from datetime import datetime

# Configuration
DATA_DIR = 'data'
OUTPUT_DIR = 'sahih-explorer/public/data'
SCHOLARS_DIR = os.path.join(OUTPUT_DIR, 'scholars')

# Ensure output directories exist
os.makedirs(SCHOLARS_DIR, exist_ok=True)

def parse_ids(id_str):
    """Extract IDs from strings like 'Name [ID], Name2 [ID2]'"""
    if not id_str or id_str == 'NA':
        return []
    ids = re.findall(r'\[(\d+)\]', id_str)
    return ids

def parse_date_field(date_str):
    """Parse date fields that may contain lists like "['28 BH', '596 CE']" """
    if not date_str or date_str == 'NA':
        return None
    try:
        # Handle string representation of lists
        if date_str.startswith('['):
            dates = eval(date_str)
            return dates if isinstance(dates, list) else [date_str]
    except:
        pass
    return [date_str]

def clean_name(name):
    """Extract clean name without Arabic text and honorifics"""
    name = str(name)
    # Remove content in parentheses (usually Arabic or honorifics)
    clean = re.sub(r'\([^)]*\)', '', name)
    # Remove extra whitespace
    clean = ' '.join(clean.split())
    return clean.strip()

def parse_tags(tags_str):
    """Parse tags field which contains space-separated tags with URLs"""
    if not tags_str or tags_str == 'NA':
        return []
    
    # Extract tag names (text before the URL in brackets)
    tags = re.findall(r'([^,\[]+)\s*\[', tags_str)
    return [tag.strip() for tag in tags if tag.strip()]

def load_scholars(filepath):
    """Load all scholars into a dictionary"""
    scholars = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            scholars[row['scholar_indx']] = row
    return scholars

def resolve_person_names(id_list, scholars):
    """Resolve a list of IDs to person objects with names"""
    persons = []
    for person_id in id_list:
        if person_id in scholars:
            person = scholars[person_id]
            persons.append({
                "id": person_id,
                "name": clean_name(person['name']),
                "grade": person.get('grade', '')
            })
    return persons

def get_enhanced_scholar_data(target_id, scholars, all_hadiths):
    """Get comprehensive data for a single scholar"""
    if target_id not in scholars:
        return None
    
    person = scholars[target_id]
    
    # Parse biographical data
    birth_dates = parse_date_field(person.get('birth_date', ''))
    death_dates = parse_date_field(person.get('death_date', ''))
    
    # Get related hadiths (optimization: pre-grouped hadiths would be faster)
    person_hadiths = [
        h for h in all_hadiths 
        if target_id in h['chain']
    ]
    
    tree = {
        "id": target_id,
        "name": clean_name(person['name']),
        "full_name": person['name'],
        "grade": person.get('grade', ''),
        
        # Biographical information
        "biography": {
            "birth": {
                "date_hijri": person.get('birth_date_hijri', ''),
                "date_gregorian": person.get('birth_date_gregorian', ''),
                "date_display": birth_dates,
                "place": person.get('birth_place', '')
            },
            "death": {
                "date_hijri": person.get('death_date_hijri', ''),
                "date_gregorian": person.get('death_date_gregorian', ''),
                "date_display": death_dates,
                "place": person.get('death_place', ''),
                "reason": person.get('death_reason', '')
            },
            "places_of_stay": person.get('places_of_stay', '').split(', ') if person.get('places_of_stay') else [],
            "area_of_interest": person.get('area_of_interest', '').split(', ') if person.get('area_of_interest') else [],
            "tags": parse_tags(person.get('tags', ''))
        },
        
        # Family relationships
        "parents": resolve_person_names(parse_ids(person.get('parents', '')), scholars),
        "spouses": resolve_person_names(parse_ids(person.get('spouse', '')), scholars),
        "siblings": resolve_person_names(parse_ids(person.get('siblings', '')), scholars),
        "children": resolve_person_names(parse_ids(person.get('children', '')), scholars),
        
        # Academic lineage
        "teachers": resolve_person_names(person.get('teachers_inds', '').split(', ') if person.get('teachers_inds') and person.get('teachers_inds') != 'NA' else [], scholars),
        "students": resolve_person_names(person.get('students_inds', '').split(', ') if person.get('students_inds') and person.get('students_inds') != 'NA' else [], scholars),
        
        # Hadiths (limit for file size)
        "hadiths": person_hadiths[:50],
        "total_hadiths": len(person_hadiths)
    }
    
    return tree

def load_all_hadiths(filepath):
    """Load all hadiths into memory with parsed chains"""
    hadiths = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                chain = row.get('chain_indx', '')
                chain_ids = [x.strip() for x in chain.split(',') if x.strip()]
                
                hadiths.append({
                    "hadith_no": row.get('hadith_no', '').strip(),
                    "source": row.get('source', ''),
                    "chapter": row.get('chapter', ''),
                    "chapter_no": row.get('chapter_no', ''),
                    "text_ar": row.get('text_ar', ''),
                    "text_en": row.get('text_en', ''),
                    "chain": chain_ids
                })
    except FileNotFoundError:
        print(f"Warning: Hadith file not found at {filepath}")
    return hadiths

def main():
    print("🚀 Starting Production Data Build...")
    
    # 1. Load Source Data
    print("📚 Loading Scholars Database...")
    scholars = load_scholars(os.path.join(DATA_DIR, 'all_rawis.csv'))
    
    print("📜 Loading Hadiths Database...")
    all_hadiths = load_all_hadiths(os.path.join(DATA_DIR, 'all_hadiths_clean.csv'))
    
    print(f"Loaded {len(scholars)} scholars and {len(all_hadiths)} hadiths.")
    
    # 2. Generate Search Index
    print("🔍 Generating Search Index...")
    search_index = []
    
    count = 0
    total = len(scholars)
    
    for scholar_id, person in scholars.items():
        # Calculate approximate influence score for search ranking
        # Based on number of students + teachers
        students_count = len(person.get('students_inds', '').split(',')) if person.get('students_inds') != 'NA' else 0
        teachers_count = len(person.get('teachers_inds', '').split(',')) if person.get('teachers_inds') != 'NA' else 0
        influence = students_count + teachers_count
        
        name = clean_name(person['name'])
        
        # Add to search index
        search_index.append({
            "id": scholar_id,
            "name": name,
            "grade": person.get('grade', ''),
            "death_year": person.get('death_date_hijri', ''),
            "score": influence
        })
        
        # 3. Generate Individual JSON Files (Limit to top scholars or batch for now)
        # For full production, we would process ALL, but for dev optimization/demo
        # we will process the top 200 most influential + Abu Bakr specifically
        if scholar_id == "2" or influence > 10:  # Adjust threshold as needed
            scholar_data = get_enhanced_scholar_data(scholar_id, scholars, all_hadiths)
            if scholar_data:
                output_path = os.path.join(SCHOLARS_DIR, f"{scholar_id}.json")
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(scholar_data, f, indent=2, ensure_ascii=False)
            
        count += 1
        if count % 1000 == 0:
            print(f"Processed {count}/{total}...")

    # Sort search index by influence score
    search_index.sort(key=lambda x: x['score'], reverse=True)
    
    # Save Search Index
    search_path = os.path.join(OUTPUT_DIR, 'search-index.json')
    with open(search_path, 'w', encoding='utf-8') as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)
        
    print(f"\n✅ Build Complete!")
    print(f"   - Search Index: {len(search_index)} scholars")
    print(f"   - Location: {search_path}")
    print(f"   - Individual Scholar Files generated in {SCHOLARS_DIR}")

if __name__ == "__main__":
    main()
