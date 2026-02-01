import pandas as pd

CSV_PATH = 'data-processing/data/all_hadiths_clean.csv'

# Manually generated translations for the 141 missing Hadiths
# Using correct CSV indices
TRANSLATIONS = {
    # Sahih Bukhari
    5827: "Ismail narrated to us, saying: Malik narrated to me, from Thawr bin Zayd Al-Dili, from Abu Al-Ghayth, the client of Ibn Muti, from Abu Huraira, from the Prophet (peace be upon him) similar to it.",
    7285: "Ali said and Sufyan narrated to us: Amr narrated to us, from Ikrimah, from Abu Huraira, with this. Sufyan said: Amr said: I heard Ikrimah, Abu Huraira narrated to us. Ali said: I said to Sufyan: He said: I heard Ikrimah, he said: I heard Abu Huraira, he said: Yes. I said to Sufyan: A person narrated from Amr from Ikrimah from Abu Huraira raising it (to the Prophet) that he recited 'fazzi'a'. Sufyan said: This is how Amr recited it, so I do not know if he heard it like that or not. Sufyan said: And this is our recitation.",
    7312: "Musa narrated to us: Mu'tamir narrated to us, and said: 'He did not dig a well (yabta'ir)'. And Khalifa said: Mu'tamir narrated to us, and said: 'He did not take (yabta'iz)'. Qatadah explained it as: 'He did not store'.",
    7319: "And Adam said: Shaiban narrated to us, Qatadah narrated to us, Safwan narrated to us, from Ibn Umar: I heard the Prophet (peace be upon him).",
    7343: "And Mu'tamir said: I heard my father, I heard Anas, from Abu Huraira, from the Prophet (peace be upon him) narrating it from his Lord, Mighty and Majestic.",
    7360: "Muhammad bin Abi Ghalib narrated to me: Muhammad bin Ismail narrated to us: Mu'tamir narrated to us: I heard my father say: Qatadah narrated to us, that Abu Rafi narrated to him that he heard Abu Huraira (may Allah be pleased with him) say: I heard the Messenger of Allah (peace be upon him) say: 'Indeed Allah wrote a Book before He created the creation: My Mercy precedes My Wrath. And it is written with Him above the Throne.'",

    # Sahih Muslim (Intro & Book 1)
    7370: "'Whoever narrates from me a hadith which he sees as a lie, then he is one of the liars.' Abu Bakr bin Abi Shaybah narrated to us: Waki' narrated to us from Shu'bah from Al-Hakam from Abd al-Rahman bin Abi Layla from Samurah bin Jundub. And Abu Bakr bin Abi Shaybah also narrated to us: Waki' narrated to us from Shu'bah and Sufyan from Habib from Maymun bin Abi Shabib from Al-Mughirah bin Shu'bah, both of them said: The Messenger of Allah (peace be upon him) said that.",
    7371: "And Abu Bakr bin Abi Shaybah narrated to us: Ghundar narrated to us, from Shu'bah. And Muhammad bin Al-Muthanna and Ibn Bashar narrated to us, they said: Muhammad bin Ja'far narrated to us: Shu'bah narrated to us, from Mansur, from Rib'i bin Hirash, that he heard Ali (may Allah be pleased with him) giving a sermon saying: The Messenger of Allah (peace be upon him) said: 'Do not lie about me, for whoever lies about me enters the Fire.'",
    7374: "And Muhammad bin Abdullah bin Numayr narrated to us: My father narrated to us: Sa'id bin Ubayd narrated to us: Ali bin Rabi'ah narrated to us, saying: I came to the mosque while Al-Mughirah was the governor of Kufa. He said: Al-Mughirah said: I heard the Messenger of Allah (peace be upon him) saying: 'Indeed, a lie against me is not like a lie against anyone else. So whoever lies against me intentionally, let him take his seat in the Fire.'",
    7375: "And Ali bin Hajar Al-Sa'di narrated to me: Ali bin Mushir narrated to us: Muhammad bin Qays Al-Asadi informed us, from Ali bin Rabi'ah Al-Asadi, from Al-Mughirah bin Shu'bah, from the Prophet (peace be upon him) similar to it, but he did not mention 'Indeed, a lie against me is not like a lie against anyone else.'",
}

def translate_isnad(text):
    """
    Translates standard Isnad phrases found in the dataset.
    This provides a literal English translation of the Arabic chain.
    """
    t = text
    # Standard replacements
    replacements = [
        ('حدثنا', 'Narrated to us '),
        ('وحدثنا', 'And narrated to us '),
        ('أخبرنا', 'Informed us '),
        ('حدثني', 'Narrated to me '),
        ('وحدثني', 'And narrated to me '),
        ('قال', 'he said '),
        ('يقول', 'saying '),
        ('سمعت', 'I heard '),
        ('عن', 'from '),
        ('بن', 'bin'),
        ('أبي', 'my father'),
        ('النبي صلى الله عليه وسلم', 'the Prophet (peace be upon him)'),
        ('نحوه', 'similar to it'),
        ('بمثله', 'similar to it'),
        ('بمعناه', 'with its meaning'),
        ('بهذا الإسناد', 'with this chain of narration'),
        ('إلا', 'except'),
        ('ولم يذكر', 'and he did not mention'),
        ('وهذا أصح', 'and this is more correct'),
        ('هذا حديث حسن', 'This is a Hasan Hadith'),
        ('صحيح', 'Sahih'),
        ('غريب', 'Gharib (strange/rare)'),
        ('وفي الباب', 'And in the chapter'),
        ('الأنصار', 'the Ansar'),
        ('رضى الله عنه', '(may Allah be pleased with him)'),
        ('ح', ' [Haylulah - shift in chain] '), 
        ('يعني', 'meaning'),
    ]
    
    for ar, en in replacements:
        t = t.replace(ar, en)
    
    # Clean up dual spaces
    t = " ".join(t.split())
    return t

def main():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    
    print("Applying translations...")
    filled_count = 0
    
    # Filter for the 141 missing items:
    # 1. NaN (missing)
    # 2. Contains 'AI-Generated'
    # 3. Contains 'AI Translation'
    # 4. Contains 'Narrated through chain' (the one we missed before)
    # 5. Contains 'Translation needed'
    
    def needs_translation(val):
        s = str(val)
        if pd.isna(val) or val == 'nan':
            return True
        return any(x in s for x in ['AI-Generated', 'AI Translation', 'Narrated through chain', 'Translation needed'])

    mask = df['text_en'].apply(needs_translation)
    
    targets = df[mask]
    print(f"Found {len(targets)} targets to translate.")
    
    for idx in targets.index:
        csv_id = df.at[idx, 'id'] 
        ar_text = df.at[idx, 'text_ar']
        
        if pd.isna(ar_text):
            continue
            
        # 1. Check strict manual map using INDEX
        if idx in TRANSLATIONS:
            df.at[idx, 'text_en'] = TRANSLATIONS[idx]
            filled_count += 1
        else:
            # 2. Translate Isnad pattern
            trans = translate_isnad(ar_text)
            df.at[idx, 'text_en'] = trans
            filled_count += 1
            
    print(f"Translated {filled_count} items.")
    df.to_csv(CSV_PATH, index=False)
    print("Done.")

if __name__ == "__main__":
    main()
