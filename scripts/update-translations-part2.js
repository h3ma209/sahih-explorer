const fs = require('fs');
const path = require('path');

const scholarsDir = path.join(process.cwd(), 'public/data/scholars');
const hadithIndexFile = path.join(process.cwd(), 'public/data/hadith-index.json');

// --- Translation Dictionaries ---

const AREAS = {
  "Hadith": { en: "Hadith", ar: "حديث", ku: "فەرموودە" },
  "Fiqh": { en: "Fiqh", ar: "فقه", ku: "فیقهـ" },
  "Faqih": { en: "Faqih", ar: "فقيه", ku: "فەقیهـ" },
  "Qira'at": { en: "Qira'at", ar: "قراءات", ku: "قیرائات" },
  "Tafsir": { en: "Tafsir", ar: "تفسير", ku: "تەفسیر" },
  "Tafsir/Quran": { en: "Tafsir/Quran", ar: "تفسير القرآن", ku: "تەفسیر/قورئان" },
  "Recitation/Quran": { en: "Recitation/Quran", ar: "تلاوة القرآن", ku: "خوێندنەوە/قورئان" },
  "History": { en: "History", ar: "تاريخ", ku: "مێژوو" },
  "Grammar": { en: "Grammar", ar: "نحو", ku: "رێزمان" },
  "Literature": { en: "Literature", ar: "أدب", ku: "ئەدەب" },
  "Medicine": { en: "Medicine", ar: "طب", ku: "پزیشكی" },
  "Astronomy": { en: "Astronomy", ar: "فلك", ku: "گەردوونناسی" },
  "Logic": { en: "Logic", ar: "منطق", ku: "مەنتیق" },
  "Philosophy": { en: "Philosophy", ar: "فلسفة", ku: "فەلسەفە" },
  "Geography": { en: "Geography", ar: "جغرافيا", ku: "جوگرافیا" },
  "Mathematics": { en: "Mathematics", ar: "رياضيات", ku: "بیركاری" },
  "Sira": { en: "Sira", ar: "سيرة", ku: "ژیاننامە" },
  "Aqidah": { en: "Aqidah", ar: "عقيدة", ku: "بیروباوەڕ" },
  "Usul al-Fiqh": { en: "Usul al-Fiqh", ar: "أصول الفقه", ku: "بنەماكانی فیقهـ" },
  "Inheritance": { en: "Inheritance", ar: "مواريث", ku: "میرات" },
  "Spirituality": { en: "Spirituality", ar: "روحانيات", ku: "رۆحانیەت" },
  "Poetry": { en: "Poetry", ar: "شعر", ku: "شیعر" },
  "Politics": { en: "Politics", ar: "سياسة", ku: "سیاسەت" },
  "Genealogy": { en: "Genealogy", ar: "أنساب", ku: "رەچەڵەكناسی" },
  "Commander": { en: "Commander", ar: "قائد", ku: "سەركردە" },
  "Reformer": { en: "Reformer", ar: "مصلح", ku: "چاکساز" }
};

const PLACES = {
  "Makkah": { en: "Makkah", ar: "مكة المكرمة", ku: "مەككە" },
  "Medina": { en: "Medina", ar: "المدينة المنورة", ku: "مەدینە" },
  "al-Medina": { en: "Medina", ar: "المدينة المنورة", ku: "مەدینە" },
  "Kufa": { en: "Kufa", ar: "الكوفة", ku: "كوفە" },
  "al-Kufa": { en: "Kufa", ar: "الكوفة", ku: "كوفە" },
  "Basra": { en: "Basra", ar: "البصرة", ku: "بەسرە" },
  "al-Basra": { en: "Basra", ar: "البصرة", ku: "بەسرە" },
  "Baghdad": { en: "Baghdad", ar: "بغداد", ku: "بەغداد" },
  "Damascus": { en: "Damascus", ar: "دمشق", ku: "دیمەشق" },
  "Egypt": { en: "Egypt", ar: "مصر", ku: "میسر" },
  "Yemen": { en: "Yemen", ar: "اليمن", ku: "یەمەن" },
  "Syria": { en: "Syria", ar: "الشام", ku: "شام" },
  "al-Sham": { en: "Syria", ar: "الشام", ku: "شام" },
  "Wasit": { en: "Wasit", ar: "واسط", ku: "واسیت" },
  "Ray": { en: "Ray", ar: "الري", ku: "ڕەی" },
  "Khurasan": { en: "Khurasan", ar: "خراسان", ku: "خۆراسان" },
  "Balkh": { en: "Balkh", ar: "بلخ", ku: "بەڵخ" },
  "Bukhara": { en: "Bukhara", ar: "بخاري", ku: "بوخارا" },
  "Nishapur": { en: "Nishapur", ar: "نيسابور", ku: "نیشابور" },
  "Marw": { en: "Marw", ar: "مرو", ku: "مەرو" },
  "Samarkand": { en: "Samarkand", ar: "سمرقند", ku: "سەمەرقەند" },
  "Herat": { en: "Herat", ar: "هرات", ku: "هیرات" },
  "Isfahan": { en: "Isfahan", ar: "أصفهان", ku: "ئەسفەهان" },
  "Mosul": { en: "Mosul", ar: "الموصل", ku: "موسڵ" },
  "Himss": { en: "Homs", ar: "حمص", ku: "حومس" },
  "Jerusalem": { en: "Jerusalem", ar: "القدس", ku: "قودس" },
  "Tehran": { en: "Tehran", ar: "طهران", ku: "تاران" },
  "Cairo": { en: "Cairo", ar: "القاهرة", ku: "قاهیرە" },
  "Alexandria": { en: "Alexandria", ar: "الإسكندرية", ku: "ئەسكەندەریە" },
  "Taif": { en: "Taif", ar: "الطائف", ku: "تائیف" },
  "Hijaz": { en: "Hijaz", ar: "الحجاز", ku: "حیجاز" },
  "al-Hijaz": { en: "Hijaz", ar: "الحجاز", ku: "حیجاز" },
  "Andalusia": { en: "Andalusia", ar: "الأندلس", ku: "ئەندەلوس" },
  "Cordoba": { en: "Cordoba", ar: "قرطبة", ku: "قورتوبە" },
  "Ahwaz": { en: "Ahwaz", ar: "الأهواز", ku: "ئەهواز" },
  "Shiraz": { en: "Shiraz", ar: "شيراز", ku: "شیراز" },
  "Qom": { en: "Qom", ar: "قم", ku: "قوم" }
};

const TAGS = {
  "Ansar": { en: "Ansar", ar: "الأنصار", ku: "ئەنسار" },
  "Muhajirun": { en: "Muhajirun", ar: "المهاجرون", ku: "كۆچبەران" },
  "Quraish": { en: "Quraish", ar: "قريش", ku: "قوڕەیش" },
  "Companion": { en: "Companion", ar: "صحابي", ku: "هاوەڵ" },
  "Tabi'i": { en: "Tabi'i", ar: "تابعي", ku: "شوێنكەوتوو" },
  "Badr": { en: "Battle of Badr", ar: "غزوة بدر", ku: "جەنگی بەدر" },
  "Uhud": { en: "Battle of Uhud", ar: "غزوة أحد", ku: "جەنگی ئوحود" },
  "Khandaq": { en: "Battle of the Trench", ar: "غزوة الخندق", ku: "جەنگی خەندەق" },
  "Hudaybiyyah": { en: "Treaty of Hudaybiyyah", ar: "صلح الحديبية", ku: "پەیمانی حودەیبیە" },
  "Conquest of Makkah": { en: "Conquest of Makkah", ar: "فتح مكة", ku: "فەتحی مەككە" },
  "Hunayn": { en: "Battle of Hunayn", ar: "غزوة حنين", ku: "جەنگی حونەین" },
  "Tabuk": { en: "Battle of Tabuk", ar: "غزوة تبوك", ku: "جەنگی تەبووك" },
  "Jamal": { en: "Battle of the Camel", ar: "موقعة الجمل", ku: "جەنگی جەمەل" },
  "Siffin": { en: "Battle of Siffin", ar: "وقعة صفين", ku: "جەنگی سفیین" },
  "Karbala": { en: "Battle of Karbala", ar: "معركة كربلاء", ku: "جەنگی كەربەلا" },
  "B.Hashim": { en: "Banu Hashim", ar: "بنو هاشم", ku: "بەنی هاشم" },
  "B.Umayya": { en: "Banu Umayya", ar: "بنو أمية", ku: "بەنی ئومەیە" },
  "B.Abbas": { en: "Banu Abbas", ar: "بنو العباس", ku: "بەنی عەباس" },
  "B.Tamim": { en: "Banu Tamim", ar: "بنو تميم", ku: "بەنی تەمیم" },
  "B.Asad": { en: "Banu Asad", ar: "بنو أسد", ku: "بەنی ئەسەد" },
  "B.Makhzum": { en: "Banu Makhzum", ar: "بنو مخزوم", ku: "بەنی مەخزوم" },
  "B.Zuhrah": { en: "Banu Zuhrah", ar: "بنو زهرة", ku: "بەنی زوهرە" },
  "Ahl al-Bayt": { en: "Ahl al-Bayt", ar: "أهل البيت", ku: "ئەهلی بەیت" },
  "Mothers of Believers": { en: "Mothers of Believers", ar: "أمهات المؤمنين", ku: "دایكی باوەڕداران" },
  "Ten Promised Paradise": { en: "Ten Promised Paradise", ar: "العشرة المبشرون بالجنة", ku: "دە مژدەپێدراوی بەهەشت" },
  "Prophet": { en: "Prophet", ar: "نبي", ku: "پێغەمبەر" },
  "Rasool": { en: "Rasool", ar: "رسول", ku: "رەسوڵ" },
  "Client": { en: "Client (Mawla)", ar: "مولى", ku: "مەولا" },
  "Female": { en: "Female", ar: "أنثى", ku: "مێ" },
  "Child": { en: "Child (Young Companion)", ar: "صغير الصحابة", ku: "منداڵ" },
  "Judge": { en: "Judge (Qadi)", ar: "قاضي", ku: "دادوەر" },
  "Early Muslim": { en: "Early Muslim", ar: "من السابقين الأولين", ku: "موسڵمانی سەرەتا" },
  "Late Muslim": { en: "Late Muslim", ar: "أسلم متأخرا", ku: "موسڵمانی درەنگ" },
  "Sahaba": { en: "Sahaba", ar: "صحابة", ku: "سەحابە" },
  "Khazraj": { en: "Khazraj", ar: "الخزرج", ku: "خەزرەج" },
  "Aws": { en: "Aws", ar: "الأوس", ku: "ئەوس" }
};

const BOOKS = {
  "Sahih Bukhari": { en: "Sahih Bukhari", ar: "صحيح البخاري", ku: "سەحیحی بوخاری" },
  "Sahih Muslim": { en: "Sahih Muslim", ar: "صحيح مسلم", ku: "سەحیحی موسليم" },
  "Sunan an-Nasa'i": { en: "Sunan an-Nasa'i", ar: "سنن النسائي", ku: "سونەنی نەسائی" },
  "Sunan Abi Da'ud": { en: "Sunan Abi Da'ud", ar: "سنن أبي داود", ku: "سونەنی ئەبی داود" },
  "Sunan Ibn Majah": { en: "Sunan Ibn Majah", ar: "سنن ابن ماجه", ku: "سونەنی ئیبن ماجە" },
  "Jami' al-Tirmidhi": { en: "Jami' al-Tirmidhi", ar: "جامع الترمذي", ku: "جاميعي تیرمیزی" }
};

// --- Helper Functions ---

function getTranslation(value, dictionary) {
  if (!value) return null;
  const key = value.trim();
  // Try exact match
  if (dictionary[key]) return dictionary[key];
  
  // Try case-insensitive?
  // Check if we can find a loose match
  const found = Object.keys(dictionary).find(k => k.toLowerCase() === key.toLowerCase());
  return found ? dictionary[found] : null;
}

function processArray(arr, dictionary, targetKey) {
  if (!Array.isArray(arr)) return;
  // We want to add a parallel array ?? Or translate distinct values?
  // The request is to add translations.
  // We can add a new field e.g. "tags_display" which is an array of objects
  
  const displayArr = [];
  let foundAny = false;
  
  arr.forEach(item => {
    const trans = getTranslation(item, dictionary);
    if (trans) {
        displayArr.push(trans);
        foundAny = true;
    } else {
        // Keep original if no translation found, or keep minimal object
        displayArr.push({ en: item, ar: item, ku: item });
    }
  });

  // Only return if we have processed something
  return displayArr;
}

// --- Main Execution ---

async function main() {
    console.log('Starting Part 2 translation update...');

    // 1. Update Hadith Index
    try {
        console.log('Updating hadith-index.json...');
        // Use streaming or just load it if size permits (90MB is okay for Node)
        // Note: fs.readFileSync limit is ~2GB. 90MB is fine.
        const hadiths = JSON.parse(fs.readFileSync(hadithIndexFile, 'utf8'));
        let hCount = 0;
        
        hadiths.forEach(h => {
             // Handle "book" field
             const trans = getTranslation(h.book, BOOKS);
             if (trans) {
                 h.book_display = trans;
                 hCount++;
             }
             // Also hadith chain? No, chain is IDs.
        });
        
        fs.writeFileSync(hadithIndexFile, JSON.stringify(hadiths, null, 2));
        console.log(`Updated ${hCount} entries in hadith-index.json`);
    } catch (e) {
        console.error('Error updating hadith-index:', e.message);
    }

    // 2. Update Scholar Files
    console.log('Updating scholar JSON files...');
    const files = fs.readdirSync(scholarsDir);
    let sCount = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(scholarsDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const scholar = JSON.parse(content);
            let modified = false;

            if (scholar.biography) {
                // Areas of Interest
                if (scholar.biography.area_of_interest) {
                    const disp = processArray(scholar.biography.area_of_interest, AREAS);
                    if (disp) {
                        scholar.biography.area_of_interest_display = disp;
                        modified = true;
                    }
                }
                
                // Places
                if (scholar.biography.places_of_stay) {
                    const disp = processArray(scholar.biography.places_of_stay, PLACES);
                    if (disp) {
                        scholar.biography.places_of_stay_display = disp;
                        modified = true;
                    }
                }

                // Tags
                if (scholar.biography.tags) {
                     const disp = processArray(scholar.biography.tags, TAGS);
                     if (disp) {
                         scholar.biography.tags_display = disp;
                         modified = true;
                     }
                }

                // Birth Place
                if (scholar.biography.birth && scholar.biography.birth.place) {
                     // Check if place contains any key from PLACES
                     // heuristic: find matched city in string
                     const placeStr = scholar.biography.birth.place;
                     const matchedCity = Object.keys(PLACES).find(city => placeStr.includes(city));
                     if (matchedCity) {
                         // We found a city. We construct a display object.
                         // But we can't translate the whole sentence easily.
                         // "9th Rabi' awwal, Makkah" -> "9th Rabi' awwal, [Makkah translated]"?
                         // Maybe just add a separate field `birth_city_display`?
                         // Or try to replace.
                         // Let's create `birth_place_display` object
                         const cityTrans = PLACES[matchedCity];
                         scholar.biography.birth.place_display = {
                             en: placeStr,
                             ar: placeStr.replace(matchedCity, cityTrans.ar), // Simple replacement
                             ku: placeStr.replace(matchedCity, cityTrans.ku)
                         };
                         modified = true;
                     }
                }
                
                // Death Place
                if (scholar.biography.death && scholar.biography.death.place) {
                     const placeStr = scholar.biography.death.place;
                     const matchedCity = Object.keys(PLACES).find(city => placeStr.includes(city));
                     if (matchedCity) {
                         const cityTrans = PLACES[matchedCity];
                         scholar.biography.death.place_display = {
                             en: placeStr,
                             ar: placeStr.replace(matchedCity, cityTrans.ar),
                             ku: placeStr.replace(matchedCity, cityTrans.ku)
                         };
                         modified = true;
                     }
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(scholar, null, 2));
                sCount++;
            }
            
            if (sCount % 1000 === 0) process.stdout.write('.');

        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    }
    
    console.log(`\nSuccessfully updated ${sCount} scholar files.`);
}

main();
