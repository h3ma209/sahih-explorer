// Translation mappings for dynamic content
export const cityTranslations: Record<string, Record<string, string>> = {
  // Cities and Places
  "Makkah": { en: "Makkah", ar: "مكة", ckb: "مەككە" },
  "Medinah": { en: "Medinah", ar: "المدينة", ckb: "مەدینە" },
  "Medina": { en: "Medina", ar: "المدينة", ckb: "مەدینە" },
  "Basrah": { en: "Basrah", ar: "البصرة", ckb: "بەسرە" },
  "Kufa": { en: "Kufa", ar: "الكوفة", ckb: "کوفە" },
  "Damascus": { en: "Damascus", ar: "دمشق", ckb: "دیمەشق" },
  "Baghdad": { en: "Baghdad", ar: "بغداد", ckb: "بەغدا" },
  "Egypt": { en: "Egypt", ar: "مصر", ckb: "میسر" },
  "Syria": { en: "Syria", ar: "الشام", ckb: "شام" },
  "Yemen": { en: "Yemen", ar: "اليمن", ckb: "یەمەن" },
  "Taif": { en: "Taif", ar: "الطائف", ckb: "تائیف" },
  "Jerusalem": { en: "Jerusalem", ar: "القدس", ckb: "قودس" },
};

export const tagTranslations: Record<string, Record<string, string>> = {
  // Tribes and Groups
  "Quraish": { en: "Quraish", ar: "قريش", ckb: "قورەیش" },
  "Ansar": { en: "Ansar", ar: "الأنصار", ckb: "ئەنسار" },
  "Khazraj": { en: "Khazraj", ar: "الخزرج", ckb: "خەزرەج" },
  "Aws": { en: "Aws", ar: "الأوس", ckb: "ئەوس" },
  "B.Hashim": { en: "Banu Hashim", ar: "بنو هاشم", ckb: "بەنی هاشم" },
  
  // Roles and Titles
  "Prophet": { en: "Prophet", ar: "النبي", ckb: "پێغەمبەر" },
  "Rasool": { en: "Messenger", ar: "الرسول", ckb: "نێردراو" },
  "Companion": { en: "Companion", ar: "صحابي", ckb: "هاوەڵ" },
  "Servant": { en: "Servant", ar: "خادم", ckb: "خزمەتکار" },
  "Scribe": { en: "Scribe", ar: "كاتب", ckb: "نووسەر" },
  
  // Battles
  "Badr": { en: "Battle of Badr", ar: "غزوة بدر", ckb: "شەڕی بەدر" },
  "Uhud": { en: "Battle of Uhud", ar: "غزوة أحد", ckb: "شەڕی ئوحود" },
  "Khandaq": { en: "Battle of Khandaq", ar: "غزوة الخندق", ckb: "شەڕی خەندەق" },
  "Hunayn": { en: "Battle of Hunayn", ar: "غزوة حنين", ckb: "شەڕی حونەین" },
  "Tabuk": { en: "Battle of Tabuk", ar: "غزوة تبوك", ckb: "شەڕی تەبووک" },
  
  // Other Common Terms
  "Muhajireen": { en: "Muhajireen", ar: "المهاجرون", ckb: "موهاجیرون" },
  "Sahaba": { en: "Companions", ar: "الصحابة", ckb: "سەحابە" },
  "Tabi'un": { en: "Tabi'un", ar: "التابعون", ckb: "تابعون" },
};

// Helper function to translate a value
export function translateValue(
  value: string,
  locale: string,
  type: 'city' | 'tag' = 'city'
): string {
  if (!value) return value;
  
  const mapping = type === 'city' ? cityTranslations : tagTranslations;
  const translation = mapping[value.trim()];
  
  if (translation && translation[locale]) {
    return translation[locale];
  }
  
  // Return original if no translation found
  return value;
}

// Helper to translate an array of values
export function translateArray(
  values: string[],
  locale: string,
  type: 'city' | 'tag' = 'city'
): string[] {
  return values.map(v => translateValue(v, locale, type));
}
