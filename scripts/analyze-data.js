const fs = require('fs');
const path = require('path');

const scholarsDir = path.join(process.cwd(), 'public/data/scholars');

const areas = new Map();
const places = new Map();
const tags = new Map();

function add(map, val) {
  if (!val || typeof val !== 'string') return;
  const v = val.trim();
  map.set(v, (map.get(v) || 0) + 1);
}

const files = fs.readdirSync(scholarsDir);
let count = 0;

console.log('Scanning scholars...');

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  try {
      const content = fs.readFileSync(path.join(scholarsDir, file), 'utf8');
      const s = JSON.parse(content);

      if (s.biography) {
          if (Array.isArray(s.biography.area_of_interest)) {
              s.biography.area_of_interest.forEach(a => add(areas, a));
          }
          if (Array.isArray(s.biography.places_of_stay)) {
              s.biography.places_of_stay.forEach(p => add(places, p));
          }
          if (Array.isArray(s.biography.tags)) {
              s.biography.tags.forEach(t => add(tags, t));
          }
          // Also check birth/death places as they might overlap with places_of_stay
          if (s.biography.birth && s.biography.birth.place) {
             // Heuristic: check if place contains a known city like "Makkah"
             // But simpler to just list top occurences
             add(places, s.biography.birth.place);
          }
          if (s.biography.death && s.biography.death.place) {
             add(places, s.biography.death.place);
          }
      }
  } catch (e) {
      console.error(`Error in ${file}:`, e.message);
  }
  
  count++;
  if (count % 5000 === 0) process.stdout.write('.');
}

console.log('\n\n=== AREAS OF INTEREST ===');
[...areas.entries()]
  .sort((a,b) => b[1] - a[1])
  .slice(0, 50)
  .forEach(([k,v]) => console.log(`${k} (${v})`));

console.log('\n=== PLACES (Top 50) ===');
[...places.entries()]
  .sort((a,b) => b[1] - a[1])
  .slice(0, 50)
  .forEach(([k,v]) => console.log(`${k} (${v})`));

console.log('\n=== TAGS (Top 50) ===');
[...tags.entries()]
  .sort((a,b) => b[1] - a[1])
  .slice(0, 50)
  .forEach(([k,v]) => console.log(`${k} (${v})`));
