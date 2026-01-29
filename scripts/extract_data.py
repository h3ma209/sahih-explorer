import csv
import json
import re

def parse_ids(id_str):
    if not id_str or id_str == 'NA':
        return []
    # IDs can be in format "[10]", "10", or lists like "10, 20"
    # The csv seems to use names with [ID] sometimes.
    # Let's look at the columns: parents, spouse, siblings, children are the relationship columns.
    # In the rawis file, they often look like: "Name [ID] , Name2 [ID]"
    ids = re.findall(r'\[(\d+)\]', id_str)
    return ids

def load_scholars(filepath):
    scholars = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            scholars[row['scholar_indx']] = row
    return scholars

def get_family_tree(target_id, scholars, depth=1):
    if target_id not in scholars:
        return None
    
    person = scholars[target_id]
    
    # helper to get details for a list of ID strings
    def resolve_relations(relation_str):
        ids = parse_ids(relation_str)
        relations = []
        for rid in ids:
            if rid in scholars:
                r_person = scholars[rid]
                relations.append({
                    "id": rid,
                    "name": r_person['name'],
                    "role": r_person.get('grade', '')
                })
        return relations

    tree = {
        "id": target_id,
        "name": person['name'],
        "parents": resolve_relations(person['parents']),
        "spouses": resolve_relations(person['spouse']),
        "siblings": resolve_relations(person['siblings']),
        "children": resolve_relations(person['children'])
    }
    return tree

def get_hadiths(target_id, hadiths_path):
    related_hadiths = []
    with open(hadiths_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            chain = row['chain_indx']
            # tokenize chain carefully, it is comma separated
            chain_ids = [x.strip() for x in chain.split(',')]
            if target_id in chain_ids:
                related_hadiths.append({
                    "hadith_no": row['hadith_no'],
                    "chapter": row['chapter'],
                    "text_en": row['text_en'],
                    "chain": chain_ids
                })
    return related_hadiths

def main():
    target_id = "2" # Abu Bakr
    scholars = load_scholars('data/all_rawis.csv')
    
    print(f"Loaded {len(scholars)} scholars.")
    
    family_tree = get_family_tree(target_id, scholars)
    print("Generated family tree.")
    
    # We will limit hadiths for the demo to the first 10
    hadiths = get_hadiths(target_id, 'data/all_hadiths_clean.csv')
    print(f"Found {len(hadiths)} hadiths.")
    
    output = {
        "scholar": family_tree,
        "hadiths": hadiths[:20] # Limit for json size in demo
    }
    
    with open('abubakr_demo_data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print("Data saved to abubakr_demo_data.json")

if __name__ == "__main__":
    main()
