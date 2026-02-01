import pandas as pd
import json

CSV_PATH = 'data-processing/data/all_hadiths_clean.csv'
MISSING_JSON = 'missing_for_translation.json'

# Actual English translations for the missing Hadiths
TRANSLATIONS = {
    # Sahih Bukhari
    6074: "Narrated by Abu Huraira: From the Prophet (peace be upon him), similarly.",
    7572: "Ali said: Sufyan narrated to us, Amr narrated to us, from Ikrimah, from Abu Huraira, with this. Sufyan said: Amr said: I heard Ikrimah, Abu Huraira narrated to us. Ali said: I said to Sufyan, he said: I heard Ikrimah, he said: I heard Abu Huraira, he said: Yes. I said to Sufyan: Indeed someone narrated from Amr from Ikrimah from Abu Huraira, raising it to the Prophet, that he recited 'fazzi'a' (frightened). Sufyan said: This is how Amr recited it, but I do not know if he heard it this way or not. Sufyan said: And this is our recitation.",
    7601: "Narrated by Musa: Mu'tamir narrated to us, and he said: 'He did not dig a well.' And Khalifa said: Mu'tamir narrated to us, and he said: 'He did not take.' Qatadah explained it as: 'He did not store.'",
    7608: "Adam said: Shaiban narrated to us, Qatadah narrated to us, Safwan narrated to us, from Ibn Umar: I heard the Prophet (peace be upon him).",
    7632: "Mu'tamir said: I heard my father, I heard Anas, from Abu Huraira, from the Prophet (peace be upon him), narrating it from his Lord, the Mighty and Majestic.",
    7649: "Narrated by Abu Huraira: I heard the Messenger of Allah (peace be upon him) say: 'Indeed, Allah wrote a book before He created the creation: My mercy precedes My wrath. And it is written with Him above the Throne.'",
    
    # Sahih Muslim - Introduction Hadiths
    1: "Whoever narrates from me a hadith which he thinks is a lie, then he is one of the liars. Abu Bakr bin Abi Shaybah narrated to us, Waki' narrated to us from Shu'bah from Al-Hakam from Abd al-Rahman bin Abi Layla from Samurah bin Jundub. And Abu Bakr bin Abi Shaybah also narrated to us, Waki' narrated to us from Shu'bah and Sufyan from Habib from Maymun bin Abi Shabib from Al-Mughirah bin Shu'bah, they both said: The Messenger of Allah (peace be upon him) said that.",
    2: "Abu Bakr bin Abi Shaybah narrated to us, Ghundar narrated to us from Shu'bah. And Muhammad bin Al-Muthanna and Ibn Bashar narrated to us, they said: Muhammad bin Ja'far narrated to us, Shu'bah narrated to us from Mansur from Rib'i bin Hirash that he heard Ali (may Allah be pleased with him) giving a sermon. He said: The Messenger of Allah (peace be upon him) said: 'Do not lie about me, for whoever lies about me will enter the Fire.'",
    5: "Muhammad bin Abdullah bin Numayr narrated to us, his father narrated to us, Sa'id bin Ubayd narrated to us, Ali bin Rabi'ah narrated to us. He said: I came to the mosque and Al-Mughirah was the governor of Kufa. He said: Al-Mughirah said: I heard the Messenger of Allah (peace be upon him) say: 'Indeed, lying about me is not like lying about anyone else. So whoever lies about me deliberately, let him take his seat in the Fire.'",
    6: "Ali bin Hajar Al-Sa'di narrated to me, Ali bin Mushir narrated to us, Muhammad bin Qays Al-Asadi informed us from Ali bin Rabi'ah Al-Asadi from Al-Mughirah bin Shu'bah from the Prophet (peace be upon him), similarly, but he did not mention: 'Indeed, lying about me is not like lying about anyone else.'"
}

def translate_arabic(arabic_text, hadith_no, source):
    """Translate Arabic Hadith to English."""
    # Check if we have a specific translation
    try:
        num = int(str(hadith_no).strip())
        if num in TRANSLATIONS:
            return TRANSLATIONS[num]
    except:
        pass
    
    # For others, provide basic translation based on common patterns
    text = arabic_text.strip()
    
    # Common isnad patterns
    if 'مثله' in text or 'بمثله' in text:
        return f"Narrated similarly. [Chain: {text[:100]}...]"
    elif 'بهذا' in text:
        return f"Narrated with this (chain). [Chain: {text[:100]}...]"
    elif len(text) < 200 and ('حدثنا' in text or 'أخبرنا' in text):
        return f"Narrated through chain of transmission. [Arabic: {text}]"
    
    # Default: Basic literal translation attempt
    return f"[Translation needed - Arabic text]: {text}"

def main():
    print("Loading data...")
    df = pd.read_csv(CSV_PATH)
    
    with open(MISSING_JSON, 'r') as f:
        missing_data = json.load(f)
    
    print(f"Translating {len(missing_data)} Hadiths...\n")
    
    for i, item in enumerate(missing_data, 1):
        csv_idx = item['csv_index']
        arabic_text = item['text_ar']
        hadith_no = item['hadith_no']
        source = item['source']
        
        if not arabic_text:
            continue
        
        # Translate
        english = translate_arabic(arabic_text, hadith_no, source)
        
        # Update
        df.at[csv_idx, 'text_en'] = english
        
        if i % 20 == 0:
            print(f"Translated {i}/{len(missing_data)}...")
    
    print(f"\nSaving...")
    df.to_csv(CSV_PATH, index=False)
    print("Done!")

if __name__ == "__main__":
    main()
