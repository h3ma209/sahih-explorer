# Data Processing Scripts

This directory contains Python scripts for extracting and processing hadith data from various sources.

## 📁 Directory Structure

```
data-processing/
├── all_hadiths/          # Hadith collections in CSV and JSON format
│   ├── Sahih al-Bukhari.csv
│   ├── Sahih al-Bukhari.json
│   ├── Sahih Muslim.csv
│   ├── Sahih Muslim.json
│   └── ... (other collections)
├── books_csv/            # Individual books/chapters from Sahih al-Bukhari
│   ├── 1. Revelation.csv
│   ├── 2. Belief.csv
│   └── ... (92 books total)
├── data/                 # Processed scholar and hadith data
└── scripts/              # Python processing scripts
```

## 🐍 Python Scripts

### `extract_data.py`

Basic data extraction script for hadith collections.

**Usage:**

```bash
python scripts/extract_data.py
```

### `extract_enhanced_data.py`

Enhanced data extraction with additional metadata and processing.

**Features:**

- Extracts scholar biographical data
- Processes hadith chains (isnad)
- Generates search indices
- Creates JSON files for the web application

**Usage:**

```bash
python scripts/extract_enhanced_data.py
```

### `process_bukhari.py`

Specialized script for processing Sahih al-Bukhari hadiths.

**Usage:**

```bash
python scripts/process_bukhari.py
```

## 📊 Data Files

### Hadith Collections (`all_hadiths/`)

Contains the six major hadith collections (Kutub al-Sittah):

- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawood
- Jami' at-Tirmidhi
- Sunan an-Nasa'i
- Sunan Ibn Majah

Each collection is available in both CSV and JSON formats.

### Books CSV (`books_csv/`)

Individual chapters from Sahih al-Bukhari, organized by topic:

- Revelation
- Belief
- Knowledge
- Ablution
- Prayer
- Zakat
- Fasting
- Hajj
- And 84 more...

### Processed Data (`data/`)

Output from the processing scripts, ready for use in the web application.

## 🔧 Requirements

```bash
pip install pandas numpy
```

## 📝 Notes

- All hadith data is sourced from authenticated Islamic collections
- CSV files use UTF-8 encoding for Arabic text
- JSON files are formatted for direct use in the Next.js application
- Scholar data includes biographical information, academic networks, and hadith narrations

## 🚀 Workflow

1. **Extract Raw Data**: Run `extract_data.py` to get basic hadith data
2. **Enhance Data**: Run `extract_enhanced_data.py` to add scholar info and metadata
3. **Process Collections**: Run `process_bukhari.py` for specialized Bukhari processing
4. **Output**: Processed files are placed in `public/data/` for the web app

## 📖 Data Attribution

All hadith data is from authenticated Islamic sources and collections. This data is used for educational and research purposes.
