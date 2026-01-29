# Python Scripts

This directory contains data processing scripts for the Sahih Explorer project.

## Scripts

- **`extract_data.py`** - Basic hadith data extraction
- **`extract_enhanced_data.py`** - Enhanced extraction with scholar metadata
- **`process_bukhari.py`** - Specialized Sahih al-Bukhari processing

## Usage

See `../data-processing/README.md` for detailed documentation.

## Requirements

```bash
pip install pandas numpy
```

## Running Scripts

```bash
# From the sahih-explorer root directory
python scripts/extract_enhanced_data.py
```

Output will be generated in the appropriate data directories.
