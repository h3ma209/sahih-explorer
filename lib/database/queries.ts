import { query, queryOne } from './sqliteClient';

export interface Scholar {
  id: number;
  name: string;
  full_name: string;
  grade: string;
  birth_date_hijri: string;
  birth_date_gregorian: string;
  birth_place: string;
  death_date_hijri: string;
  death_date_gregorian: string;
  death_place: string;
  death_reason: string;
}

export interface ScholarRelationship {
  id: number;
  name: string;
  grade: string;
}

export interface Hadith {
  id: number;
  hadith_no: string;
  source: string;
  chapter: string;
  chapter_no: string;
  text_ar: string;
  text_en: string;
}

/**
 * Get a scholar by ID with all related information
 */
export async function getScholarById(id: number): Promise<Scholar | null> {
  const scholar = queryOne<Scholar>(
    'SELECT * FROM scholars WHERE id = ?',
    [id]
  );

  return scholar;
}

/**
 * Get scholar relationships (parents, children, spouses, teachers, students)
 */
export function getScholarRelationships(
  scholarId: number,
  relationshipType: 'parent' | 'child' | 'spouse' | 'sibling' | 'teacher' | 'student'
): ScholarRelationship[] {
  return query<ScholarRelationship>(
    `SELECT s.id, s.name, s.grade
     FROM scholars s
     INNER JOIN scholar_relationships sr ON s.id = sr.related_scholar_id
     WHERE sr.scholar_id = ? AND sr.relationship_type = ?`,
    [scholarId, relationshipType]
  );
}

/**
 * Get all relationships for a scholar
 */
export function getAllScholarRelationships(scholarId: number) {
  return {
    parents: getScholarRelationships(scholarId, 'parent'),
    children: getScholarRelationships(scholarId, 'child'),
    spouses: getScholarRelationships(scholarId, 'spouse'),
    siblings: getScholarRelationships(scholarId, 'sibling'),
    teachers: getScholarRelationships(scholarId, 'teacher'),
    students: getScholarRelationships(scholarId, 'student'),
  };
}

/**
 * Get scholar's places of stay
 */
export function getScholarPlaces(scholarId: number): string[] {
  const results = query<{ place: string }>(
    'SELECT place FROM scholar_places WHERE scholar_id = ?',
    [scholarId]
  );
  return results.map((r) => r.place);
}

/**
 * Get scholar's areas of interest
 */
export function getScholarInterests(scholarId: number): string[] {
  const results = query<{ interest: string }>(
    'SELECT interest FROM scholar_interests WHERE scholar_id = ?',
    [scholarId]
  );
  return results.map((r) => r.interest);
}

/**
 * Get scholar's tags
 */
export function getScholarTags(scholarId: number): string[] {
  const results = query<{ tag: string }>(
    'SELECT tag FROM scholar_tags WHERE scholar_id = ?',
    [scholarId]
  );
  return results.map((r) => r.tag);
}

/**
 * Search scholars by name (full-text search)
 */
export function searchScholars(searchTerm: string, limit: number = 50): Scholar[] {
  return query<Scholar>(
    `SELECT s.*
     FROM scholars s
     INNER JOIN scholars_fts fts ON s.id = fts.id
     WHERE scholars_fts MATCH ?
     LIMIT ?`,
    [searchTerm, limit]
  );
}

/**
 * Get hadiths narrated by a scholar
 */
export function getScholarHadiths(scholarId: number): Hadith[] {
  return query<Hadith>(
    `SELECT DISTINCT h.*
     FROM hadiths h
     INNER JOIN hadith_chains hc ON h.id = hc.hadith_id
     WHERE hc.scholar_id = ?
     ORDER BY h.source, CAST(h.hadith_no AS INTEGER)`,
    [scholarId]
  );
}

/**
 * Get hadith chain (narrators in order)
 */
export function getHadithChain(hadithId: number): ScholarRelationship[] {
  return query<ScholarRelationship>(
    `SELECT s.id, s.name, s.grade
     FROM scholars s
     INNER JOIN hadith_chains hc ON s.id = hc.scholar_id
     WHERE hc.hadith_id = ?
     ORDER BY hc.position`,
    [hadithId]
  );
}

/**
 * Get complete scholar profile with all related data
 */
export async function getCompleteScholarProfile(id: number) {
  const scholar = await getScholarById(id);
  
  if (!scholar) {
    return null;
  }

  const relationships = getAllScholarRelationships(id);
  const places = getScholarPlaces(id);
  const interests = getScholarInterests(id);
  const tags = getScholarTags(id);
  const hadiths = getScholarHadiths(id);

  return {
    scholar,
    biography: {
      birth: {
        date_hijri: scholar.birth_date_hijri,
        date_gregorian: scholar.birth_date_gregorian,
        place: scholar.birth_place,
      },
      death: {
        date_hijri: scholar.death_date_hijri,
        date_gregorian: scholar.death_date_gregorian,
        place: scholar.death_place,
        reason: scholar.death_reason,
      },
      places_of_stay: places,
      area_of_interest: interests,
      tags,
    },
    ...relationships,
    hadiths,
  };
}
