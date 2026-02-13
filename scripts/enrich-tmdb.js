#!/usr/bin/env node

/**
 * enrich-tmdb.js — Enriches the master list with TMDB data.
 * Cache-first: checks tmdb-cache.json before hitting API.
 *
 * Usage:
 *   node scripts/enrich-tmdb.js
 *   node scripts/enrich-tmdb.js --refresh        # ignore cache
 *   node scripts/enrich-tmdb.js --max 10         # only process first 10
 *   node scripts/enrich-tmdb.js --delay 100      # ms between requests
 *   node scripts/enrich-tmdb.js --concurrency 3  # parallel requests
 *
 * Requires TMDB_API_KEY in .env.local
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse CLI flags
const args = process.argv.slice(2);
function getFlag(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultVal;
  if (typeof defaultVal === 'boolean') return true;
  return args[idx + 1] ?? defaultVal;
}

const REFRESH = getFlag('refresh', false);
const MAX = parseInt(getFlag('max', '0'), 10);
const DELAY = parseInt(getFlag('delay', '25'), 10);
const CONCURRENCY = parseInt(getFlag('concurrency', '5'), 10);

// Load .env.local
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) {
    console.error('Missing .env.local with TMDB_API_KEY');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

loadEnv();
const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error('TMDB_API_KEY not found in .env.local');
  process.exit(1);
}

const BASE_URL = 'https://api.themoviedb.org/3';

// Cache
const cachePath = join(__dirname, 'tmdb-cache.json');
let cache = {};
if (!REFRESH && existsSync(cachePath)) {
  cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
  console.log(`Loaded cache with ${Object.keys(cache).length} entries`);
}

function saveCache() {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Search for a movie and get its TMDB ID
async function searchMovie(title, year) {
  const cacheKey = `search:${title}:${year}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const data = await tmdbFetch('/search/movie', { query: title, year: String(year) });

  if (data.results && data.results.length > 0) {
    // Try exact year match first
    const exactMatch = data.results.find(r => {
      const releaseYear = r.release_date ? parseInt(r.release_date.split('-')[0]) : null;
      return releaseYear === year;
    });
    const result = exactMatch || data.results[0];
    cache[cacheKey] = result.id;
    return result.id;
  }

  // Try without year as fallback
  const fallback = await tmdbFetch('/search/movie', { query: title });
  if (fallback.results && fallback.results.length > 0) {
    cache[cacheKey] = fallback.results[0].id;
    return fallback.results[0].id;
  }

  cache[cacheKey] = null;
  return null;
}

// Get full movie details
async function getMovieDetails(tmdbId) {
  const cacheKey = `details:${tmdbId}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const data = await tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: 'release_dates',
  });

  cache[cacheKey] = data;
  return data;
}

// Get collection details
async function getCollection(collectionId) {
  const cacheKey = `collection:${collectionId}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const data = await tmdbFetch(`/collection/${collectionId}`);
  cache[cacheKey] = data;
  return data;
}

// Extract US MPAA certification from release_dates
function getCertification(details) {
  const releaseDates = details.release_dates?.results;
  if (!releaseDates) return null;

  const us = releaseDates.find(r => r.iso_3166_1 === 'US');
  if (!us) return null;

  // Find theatrical or general release certification
  for (const rd of us.release_dates) {
    if (rd.certification) return rd.certification;
  }
  return null;
}

// Process a single movie
async function processMovie(movie) {
  const { title, year, sources, consensusScore } = movie;

  try {
    const tmdbId = await searchMovie(title, year);
    if (!tmdbId) {
      console.warn(`  [SKIP] No TMDB result for: ${title} (${year})`);
      return null;
    }

    await sleep(DELAY);
    const details = await getMovieDetails(tmdbId);

    const result = {
      tmdbId,
      title: details.title || title,
      year: details.release_date ? parseInt(details.release_date.split('-')[0]) : year,
      posterPath: details.poster_path || null,
      genres: (details.genres || []).map(g => g.name),
      runtime: details.runtime || null,
      overview: details.overview || '',
      certification: getCertification(details),
      voteAverage: details.vote_average || null,
      collectionId: details.belongs_to_collection?.id || null,
      sources,
      consensusScore,
    };

    return result;
  } catch (err) {
    console.error(`  [ERROR] ${title} (${year}): ${err.message}`);
    return null;
  }
}

// Process movies in batches with concurrency control
async function processBatch(movies, concurrency) {
  const results = [];
  for (let i = 0; i < movies.length; i += concurrency) {
    const batch = movies.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(m => processMovie(m)));
    results.push(...batchResults);

    const done = Math.min(i + concurrency, movies.length);
    console.log(`  Processed ${done}/${movies.length}`);

    // Save cache periodically
    if (done % 20 === 0) saveCache();

    if (i + concurrency < movies.length) {
      await sleep(DELAY);
    }
  }
  return results;
}

async function main() {
  // Read master list
  const masterPath = join(__dirname, 'master-list.json');
  if (!existsSync(masterPath)) {
    console.error('master-list.json not found. Run: node scripts/master-list.js');
    process.exit(1);
  }

  const masterData = JSON.parse(readFileSync(masterPath, 'utf-8'));
  let movies = masterData.movies;

  if (MAX > 0) {
    movies = movies.slice(0, MAX);
  }

  console.log(`Enriching ${movies.length} movies from TMDB (concurrency=${CONCURRENCY}, delay=${DELAY}ms)\n`);

  // Process all movies
  const enriched = await processBatch(movies, CONCURRENCY);
  const validMovies = enriched.filter(Boolean);

  // Collect all collection IDs
  const collectionIds = new Set();
  for (const movie of validMovies) {
    if (movie.collectionId) {
      collectionIds.add(movie.collectionId);
    }
  }

  // Fetch collection details
  console.log(`\nFetching ${collectionIds.size} collection(s)...`);
  const collections = {};
  const collectionMoviesMap = {}; // non-curated franchise movies

  for (const colId of collectionIds) {
    await sleep(DELAY);
    try {
      const colData = await getCollection(colId);
      const curatedTmdbIds = validMovies
        .filter(m => m.collectionId === colId)
        .map(m => m.tmdbId);

      // All movie IDs in the collection
      const allParts = (colData.parts || [])
        .sort((a, b) => {
          const yearA = a.release_date ? parseInt(a.release_date.split('-')[0]) : 9999;
          const yearB = b.release_date ? parseInt(b.release_date.split('-')[0]) : 9999;
          return yearA - yearB;
        });

      collections[colId] = {
        name: colData.name,
        movieTmdbIds: allParts.map(p => p.id),
      };

      // Collect non-curated franchise movies for the faded display
      for (const part of allParts) {
        if (!curatedTmdbIds.includes(part.id)) {
          collectionMoviesMap[part.id] = {
            tmdbId: part.id,
            title: part.title,
            year: part.release_date ? parseInt(part.release_date.split('-')[0]) : null,
            posterPath: part.poster_path || null,
            overview: part.overview || '',
          };
        }
      }

      console.log(`  ${colData.name}: ${allParts.length} movies (${curatedTmdbIds.length} curated)`);
    } catch (err) {
      console.error(`  [ERROR] Collection ${colId}: ${err.message}`);
    }
  }

  // Save cache
  saveCache();
  console.log(`\nCache saved (${Object.keys(cache).length} entries)`);

  // Build output
  const output = {
    metadata: {
      generated: new Date().toISOString().split('T')[0],
      movieCount: validMovies.length,
      collectionCount: Object.keys(collections).length,
    },
    movies: validMovies.sort((a, b) => {
      if (b.consensusScore !== a.consensusScore) return b.consensusScore - a.consensusScore;
      return a.title.localeCompare(b.title);
    }),
    collections,
    collectionMovies: collectionMoviesMap,
  };

  const outPath = join(__dirname, '..', 'src', 'data', 'movies.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\nDone! ${validMovies.length} movies written to src/data/movies.json`);
  console.log(`Collections: ${Object.keys(collections).length}`);
  console.log(`Non-curated franchise movies: ${Object.keys(collectionMoviesMap).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
