import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = 'https://www.thi.de';
const START = 'https://www.thi.de/en/studies/degree-programmes/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const DEGREE_RX = /\b(Bachelor|Master)\b|\b(B\.|M\.)\s?(Sc|Eng|A)\b|\b(B\.\s?Sc\.|M\.\s?Sc\.|B\.\s?Eng\.|M\.\s?Eng\.|MBA|B\.\s?A\.|M\.\s?A\.)\b/i;
const NAV_SKIP_RX = /(submenu|Open submenu|Close submenu|About us|Study programmes|Lifelong Learning|Service|Portal|Dates|Timetable|Contact|Counselling|Fees|Scholarship|Application|Admission|Filter|reset Filter|Select degree program or enter keyword)/i;

function norm(t) { return t.replace(/\s+/g, ' ').trim(); }
function abs(base, href) { try { return new URL(href, base).toString(); } catch { return null; } }

async function fetchHTML(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Fetch ${res.status} ${url}`);
  return await res.text();
}

function extractFromDetailBlocks($, container, baseUrl) {
  const out = [];
  // Find occurrences of a detail block: name line followed by fields like "Degree:", "Duration:", etc.
  // Strategy: iterate all elements; when we hit an element containing 'Degree:', scan backward for the name, forward for other fields.
  const degreeNodes = $(container).find('*').filter((_, el) => /\bDegree:/i.test($(el).text()));
  degreeNodes.each((_, el) => {
    const $el = $(el);

    // Find name: look up a few previous siblings for a non-empty non-meta text, or a preceding link text
    let name = '';
    let cursor = $el.prev();
    for (let i = 0; i < 8 && cursor && cursor.length; i++) {
      const txt = norm(cursor.text() || '');
      if (txt && !/^(Degree:|Duration:|Start of studies:|Language:?|NC:|Dual Study:)/i.test(txt) && !NAV_SKIP_RX.test(txt)) { name = txt; break; }
      cursor = cursor.prev();
    }
    if (!name) {
      const link = $el.prevAll('a').first();
      const txt = norm(link.text() || '');
      if (txt && !NAV_SKIP_RX.test(txt)) name = txt;
    }
    if (!name) return;

    const details = { degree: '', duration: '', start: '', language: '', dual: '' };

    const degTxt = norm($el.text());
    const dm = degTxt.match(/Degree:\s*(.*)$/i);
    if (dm) details.degree = norm(dm[1]);

    // Scan forward limited siblings
    let next = $el.next();
    for (let i = 0; i < 12 && next && next.length; i++) {
      const t = norm(next.text() || '');
      if (/^Duration:/i.test(t)) details.duration = norm(t.replace(/^Duration:/i, ''));
      else if (/^Start of studies:/i.test(t)) details.start = norm(t.replace(/^Start of studies:/i, ''));
      else if (/^Language:?/i.test(t)) details.language = norm(t.replace(/^Language:?/i, ''));
      else if (/^Dual Study:/i.test(t)) details.dual = norm(t.replace(/^Dual Study:/i, ''));
      next = next.next();
    }

    if (!DEGREE_RX.test(details.degree)) return;

    // Link for name if available within the same container
    let url = null;
    const link = $(container).find('a').filter((_, a) => norm($(a).text()).toLowerCase() === name.toLowerCase()).first();
    if (link && link.attr('href')) url = abs(baseUrl, link.attr('href'));

    out.push({ name, url, ...details });
  });
  return out;
}

function extractProgramsByFaculty(html, baseUrl) {
  const $ = cheerio.load(html);
  const programs = [];
  $('h2').each((_, h) => {
    const title = norm($(h).text());
    if (!/^Faculty|Degree programmes in executive education/i.test(title)) return;
    const faculty = title.replace(/^Faculty of\s*/i, '').trim();
    const container = $(h).parent();

    const detailEntries = extractFromDetailBlocks($, container, baseUrl);
    detailEntries.forEach(p => programs.push({ ...p, faculty }));
  });

  // Dedupe by name
  const seen = new Set();
  const unique = [];
  for (const p of programs) {
    const name = norm(p.name || '');
    if (!name || NAV_SKIP_RX.test(name) || !(DEGREE_RX.test(p.degree || name))) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ name, degree: p.degree || '', faculty: p.faculty || '', url: p.url || null, duration: p.duration || '', start: p.start || '', language: p.language || '', dual: p.dual || '' });
  }
  return unique;
}

function extractModules($) {
  const modules = [];
  $('h2, h3, h4').each((_, h) => {
    const title = norm($(h).text());
    if (!/(module|modules|curriculum|courses|studieninhalte|modul)/i.test(title)) return;
    const sec = $(h).parent();
    sec.find('ul li, ol li').each((__, li) => {
      const t = norm($(li).text());
      if (t && t.length > 2 && t.length < 140 && !NAV_SKIP_RX.test(t)) modules.push(t);
    });
    sec.find('table td, table th').each((__, td) => {
      const t = norm($(td).text());
      if (t && t.length > 2 && t.length < 140 && !/module|course/i.test(t) && !NAV_SKIP_RX.test(t)) modules.push(t);
    });
  });
  return Array.from(new Set(modules)).slice(0, 150);
}

async function enrichWithModules(program) {
  if (!program.url || !program.url.startsWith(ROOT) || /\.(pdf|docx?)$/i.test(program.url)) {
    return { ...program, modules: [] };
  }
  try {
    const html = await fetchHTML(program.url);
    const $ = cheerio.load(html);
    const modules = extractModules($);
    return { ...program, modules };
  } catch {
    return { ...program, modules: [] };
  }
}

async function main() {
  const html = await fetchHTML(START);
  let programs = extractProgramsByFaculty(html, START);

  const enriched = [];
  for (const p of programs) {
    enriched.push(await enrichWithModules(p));
  }

  const data = {
    source: START,
    scrapedAt: new Date().toISOString(),
    programs: enriched
  };

  const outPath = path.join(process.cwd(), 'public', 'thi-programs.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved ${enriched.length} programs to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });