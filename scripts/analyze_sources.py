import csv
import collections

def analyze_sources():
    path = 'data-processing/data/all_hadiths_clean.csv'
    sources = collections.Counter()
    with_usc = collections.Counter()
    
    with open(path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            s = row.get('source', '').strip()
            sources[s] += 1
            if row.get('usc_msa_ref', '').strip():
                 with_usc[s] += 1
                 
    print("Source Distribution:")
    for s, count in sources.most_common():
        print(f"{s}: {count} (mapped: {with_usc[s]})")

if __name__ == '__main__':
    analyze_sources()
