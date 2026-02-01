import os
import glob

data_dir = "public/data/scholars"
files = glob.glob(os.path.join(data_dir, "*.json"))

count = 0
for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if '"ku":' in content:
        new_content = content.replace('"ku":', '"ckb":')
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        count += 1

print(f"Updated {count} files.")
