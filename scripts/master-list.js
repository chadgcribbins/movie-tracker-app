#!/usr/bin/env node

/**
 * master-list.js — Reads all source JSON files, deduplicates by normalized
 * title + year, and outputs a master list with consensus scores.
 *
 * Usage: node scripts/master-list.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcesDir = join(__dirname, '..', 'src', 'data', 'sources');

// Source file -> short key mapping
const sourceKeys = {
  'fatherly-100.json': 'fatherly',
  'rotten-tomatoes-50.json': 'rotten_tomatoes',
  'common-sense-classic-50.json': 'common_sense_classic',
  'common-sense-modern-50.json': 'common_sense_modern',
  'empire-50.json': 'empire',
  'timeout-50.json': 'timeout',
};

// Manual alias map for known title variations
const titleAliases = {
  'fantastic mr fox': 'fantastic mr. fox',
  'my neighbour totoro': 'my neighbor totoro',
  'harry potter and the philosopher\'s stone': 'harry potter and the sorcerer\'s stone',
  'wallace & gromit: the curse of the were-rabbit': 'wallace & gromit: the curse of the were-rabbit',
  'wall-e': 'wall-e',
  'willy wonka & the chocolate factory': 'willy wonka and the chocolate factory',
  'beauty and the beast': 'beauty and the beast',
  'ferngully': 'ferngully: the last rainforest',
  'the muppets christmas carol': 'the muppet christmas carol',
  'muppets christmas carol': 'the muppet christmas carol',
  'star wars: episode iv - a new hope': 'star wars',
  'who framed roger rabbit?': 'who framed roger rabbit',
  'e.t. the extra-terrestrial': 'e.t. the extra-terrestrial',
  'beauty and the beast': 'beauty and the beast',
  'one hundred and one dalmatians': '101 dalmatians',
  'pee-wee\'s big adventure': 'pee-wee\'s big adventure',
};

function normalizeTitle(title) {
  let normalized = title.toLowerCase().trim();
  // Apply aliases
  if (titleAliases[normalized]) {
    normalized = titleAliases[normalized];
  }
  return normalized;
}

function makeKey(title, year) {
  return `${normalizeTitle(title)}::${year}`;
}

// Read all source files
const masterMap = new Map();

const files = readdirSync(sourcesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const sourceKey = sourceKeys[file];
  if (!sourceKey) {
    console.warn(`Unknown source file: ${file}, skipping`);
    continue;
  }

  const raw = readFileSync(join(sourcesDir, file), 'utf-8');
  const movies = JSON.parse(raw);

  console.log(`${sourceKey}: ${movies.length} movies`);

  for (const movie of movies) {
    const key = makeKey(movie.title, movie.year);

    if (masterMap.has(key)) {
      const existing = masterMap.get(key);
      if (!existing.sources.includes(sourceKey)) {
        existing.sources.push(sourceKey);
        existing.consensusScore++;
      }
    } else {
      // Use the normalized title but preserve original casing from first encounter
      masterMap.set(key, {
        title: movie.title,
        year: movie.year,
        sources: [sourceKey],
        consensusScore: 1,
      });
    }
  }
}

// Convert to sorted array
const masterList = Array.from(masterMap.values())
  .sort((a, b) => {
    // Sort by consensus score (desc), then title (asc)
    if (b.consensusScore !== a.consensusScore) return b.consensusScore - a.consensusScore;
    return a.title.localeCompare(b.title);
  });

const output = {
  generated: new Date().toISOString().split('T')[0],
  totalMovies: masterList.length,
  movies: masterList,
};

const outPath = join(__dirname, 'master-list.json');
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`\nDone! ${masterList.length} unique movies written to ${outPath}`);
console.log(`\nConsensus distribution:`);
const dist = {};
for (const m of masterList) {
  dist[m.consensusScore] = (dist[m.consensusScore] || 0) + 1;
}
for (const [score, count] of Object.entries(dist).sort((a, b) => b[0] - a[0])) {
  console.log(`  ${score} list(s): ${count} movies`);
}
