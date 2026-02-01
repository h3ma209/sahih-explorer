const fs = require('fs');
const path = require('path');

const scholarsDir = path.join(process.cwd(), 'public/data/scholars');
const indexFile = path.join(process.cwd(), 'public/data/search-index.json');

// --- Translation Dictionaries ---

const BOOKS = {
  "Sahih Bukhari": { en: "Sahih Bukhari", ar: "صحيح البخاري", ku: "سەحیحی بوخاری" },
  "Sahih Muslim": { en: "Sahih Muslim", ar: "صحيح مسلم", ku: "سەحیحی موسليم" },
  "Sunan an-Nasa'i": { en: "Sunan an-Nasa'i", ar: "سنن النسائي", ku: "سونەنی نەسائی" },
  "Sunan Abi Da'ud": { en: "Sunan Abi Da'ud", ar: "سنن أبي داود", ku: "سونەنی ئەبی داود" },
  "Sunan Ibn Majah": { en: "Sunan Ibn Majah", ar: "سنن ابن ماجه", ku: "سونەنی ئیبن ماجە" },
  "Jami' al-Tirmidhi": { en: "Jami' al-Tirmidhi", ar: "جامع الترمذي", ku: "جاميعي تیرمیزی" }
};

const GRADES = {
  "Rasool Allah": { en: "Messenger of Allah", ar: "رسول الله", ku: "پێغەمبەری خودا" },
  "Comp.(RA)": { en: "Companion (RA)", ar: "صحابي (رضي الله عنه)", ku: "هاوەڵ (رەزای خوای لێبێت)" },
  "Follower(Tabi')": { en: "Follower (Tabi')", ar: "تابعي", ku: "شوێنكەوتوو (تابعی)" },
  "Succ. (Taba' Tabi')": { en: "Successor (Taba' Tabi')", ar: "تابع التابعين", ku: "شوێنكەوتووی شوێنكەوتوو" },
  "Prophet's Relative": { en: "Prophet's Relative", ar: "قريب النبي", ku: "خزمى پێغەمبەر" },
  "3rd Century AH": { en: "3rd Century AH", ar: "القرن الثالث الهجري", ku: "سەدەی سێیەمی كۆچی" },
  "4th Century AH": { en: "4th Century AH", ar: "القرن الرابع الهجري", ku: "سەدەی چوارەمی كۆچی" }
};

const GENERATIONS = {
  "1st Generation": { en: "1st Generation", ar: "الجيل الأول", ku: "نەوەی یەكەم" },
  "2nd Generation": { en: "2nd Generation", ar: "الجيل الثاني", ku: "نەوەی دووەم" },
  "3rd Generation": { en: "3rd Generation", ar: "الجيل الثالث", ku: "نەوەی سێیەم" },
  "4th generation": { en: "4th Generation", ar: "الجيل الرابع", ku: "نەوەی چوارەم" },
  "5th generation": { en: "5th Generation", ar: "الجيل الخامس", ku: "نەوەی پێنجەم" },
  "6th generation": { en: "6th Generation", ar: "الجيل السادس", ku: "نەوەی شەشەم" },
  "7th generation": { en: "7th Generation", ar: "الجيل السابع", ku: "نەوەی حەوتەم" },
  "8th generation": { en: "8th Generation", ar: "الجيل الثامن", ku: "نەوەی هەشتەم" },
  "9th generation": { en: "9th Generation", ar: "الجيل التاسع", ku: "نەوەی نۆیەم" },
  "10th generation": { en: "10th Generation", ar: "الجيل العاشر", ku: "نەوەی دەیەم" },
  "11th generation": { en: "11th Generation", ar: "الجيل الحادي عشر", ku: "نەوەی یازدەیەم" },
  "12th generation": { en: "12th Generation", ar: "الجيل الثاني عشر", ku: "نەوەی دوازدەیەم" },
  "Hanafi": { en: "Hanafi", ar: "حنفي", ku: "حەنەفی" },
  "Maliki": { en: "Maliki", ar: "مالكي", ku: "مالیكی" },
  "Shafi'ee": { en: "Shafi'i", ar: "شافعي", ku: "شافیعی" },
  "Hanbali": { en: "Hanbali", ar: "حنبلي", ku: "حەنبەلی" },
  "Non-Muslim": { en: "Non-Muslim", ar: "غير مسلم", ku: "غیر موسڵمان" },
  "Other": { en: "Other", ar: "آخر", ku: "هیتر" }
};


// --- Helper Functions ---

function getGradeDisplay(gradeFullString) {
  if (!gradeFullString) return null;

  const result = {};
  
  // Extract generation or school
  const genMatch = gradeFullString.match(/\[(.*?)\]/);
  const generationKey = genMatch ? genMatch[1] : null;

  // Extract base grade
  const baseGradeKey = gradeFullString.split('[')[0].trim();

  // Resolve Base Grade Translations
  const gradeTrans = GRADES[baseGradeKey];

  // Resolve Generation/School Translations
  const genTrans = GENERATIONS[generationKey];


  // Construct Display Objects
  const langs = ['en', 'ar', 'ku'];
  
  // We need to construct the full string for each language
  // e.g. "Companion (RA) [1st Generation]" -> "صحابي (رضي الله عنه) [الجيل الأول]"
  
  const displayObj = { 
    en: gradeFullString, // Default fail-safe
    ar: gradeFullString, 
    ku: gradeFullString 
  };

  if (gradeTrans) {
    langs.forEach(lang => {
      let text = gradeTrans[lang];
      if (genTrans && genTrans[lang]) {
        if (lang === 'en') text += ` [${genTrans[lang]}]`;
        else text += ` [${genTrans[lang]}]`;
      } else if (generationKey) {
          // If we have a generation key but no translation, keep the English generation key in brackets
           text += ` [${generationKey}]`;
      }
      displayObj[lang] = text;
    });
  }

  return {
    grade_display: displayObj,
    // also return broken down components if needed by UI later
    base_grade_display: gradeTrans || null,
    generation_display: genTrans || null
  };
}

function updateScholarObject(scholar) {
  const translations = getGradeDisplay(scholar.grade);
  if (translations) {
      scholar.grade_display = translations.grade_display;
      // Optional: Add specific fields if you want granular control in UI
      // scholar.generation_display = translations.generation_display;
  }

  // Update Relations (parents, spouses, students, teachers, children, siblings)
  ['parents', 'spouses', 'siblings', 'children', 'teachers', 'students'].forEach(rel => {
    if (scholar[rel] && Array.isArray(scholar[rel])) {
      scholar[rel].forEach(person => {
        const relTrans = getGradeDisplay(person.grade);
        if (relTrans) {
          person.grade_display = relTrans.grade_display;
        }
      });
    }
  });

  // Update Hadiths (Book Names)
  if (scholar.hadiths && Array.isArray(scholar.hadiths)) {
    scholar.hadiths.forEach(hadith => {
      if (hadith.source && BOOKS[hadith.source]) {
        hadith.source_display = BOOKS[hadith.source];
      }
    });
  }
}

// --- Main Execution ---

async function main() {
    console.log('Starting translation update...');
    
    // 1. Update Search Index
    console.log('Updating search-index.json...');
    const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    let indexUpdates = 0;
    
    indexData.forEach(item => {
        const trans = getGradeDisplay(item.grade);
        if (trans) {
            item.grade_display = trans.grade_display;
            indexUpdates++;
        }
    });
    
    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
    console.log(`Updated ${indexUpdates} entries in search index.`);

    // 2. Update Scholar Files
    console.log('Updating scholar JSON files...');
    const files = fs.readdirSync(scholarsDir);
    let scholarUpdates = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(scholarsDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const scholar = JSON.parse(content);
            
            updateScholarObject(scholar);
            
            fs.writeFileSync(filePath, JSON.stringify(scholar, null, 2));
            scholarUpdates++;
            
            if (scholarUpdates % 1000 === 0) process.stdout.write('.');
            
        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    }
    
    console.log(`\nSuccessfully updated ${scholarUpdates} scholar files.`);
}

main();
