const fs = require('fs');
const path = require('path');

const hadithPath = path.join(process.cwd(), 'public/data/hadith-index.json');
const scholarPath = path.join(process.cwd(), 'public/data/search-index.json');
const statsPath = path.join(process.cwd(), 'public/data/stats.json');

try {
  console.log('Reading files...');
  const hadiths = JSON.parse(fs.readFileSync(hadithPath, 'utf8'));
  const scholars = JSON.parse(fs.readFileSync(scholarPath, 'utf8'));

  console.log('Calculating stats...');
  const hadithsByBook = {};
  hadiths.forEach(h => {
    const book = h.book ? h.book.trim() : 'Unknown';
    hadithsByBook[book] = (hadithsByBook[book] || 0) + 1;
  });

  const stats = {
    totalScholars: scholars.length,
    totalHadiths: hadiths.length,
    hadithsByBook
  };

  console.log('Writing stats.json...');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log('Done!');
  console.log(stats);

} catch (error) {
  console.error('Error generating stats:', error);
}
