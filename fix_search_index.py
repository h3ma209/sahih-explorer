import os

file_path = "public/data/search-index.json"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if '"ku":' in content:
        new_content = content.replace('"ku":', '"ckb":')
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Updated search-index.json")
    else:
        print("No changes needed for search-index.json")
else:
    print("search-index.json not found")
